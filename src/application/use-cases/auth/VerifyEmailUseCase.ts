import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import type { IRegistrationStore } from "../../services/registration/IRegistrationStore.js";

import type { IOtpService } from "../../services/registration/IOtpService.js";

import type { ILogger } from "../../../shared/logging/ILogger.js";

import type { VerifyEmailInput } from "../../validation/auth/verifyEmailSchema.js";

import { UnauthorizedError } from "../../../shared/errors/UnauthorizedError.js";
import { ConflictError } from "../../../shared/errors/ConflictError.js";
import type { IUnitOfWork } from "../../services/database/IUnitOfWork.js";
import { AUTH_EVENTS } from "../../events/AuthEvents.js";

import { randomUUID } from "node:crypto";

import { User } from "../../../domain/entities/User.js";

export interface VerifyEmailResult {
  userId: string;
  email: string;
}

export class VerifyEmailUseCase {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registrationStore: IRegistrationStore,
    private readonly otpService: IOtpService,
    private readonly logger: ILogger,
    private readonly unitOfWork: IUnitOfWork,
  ) {}

  async execute(input: VerifyEmailInput): Promise<VerifyEmailResult> {
    const lockId = randomUUID();

    const acquired = await this.registrationStore.acquireVerificationLock(
      input.verificationId,
      lockId,
      30,
    );

    // false = another verification is already processing
    if (!acquired) {
      throw new ConflictError("Email verification is already being processed");
    }

    try {
      const registration = await this.registrationStore.get(
        input.verificationId,
      );

      if (!registration) {
        throw new UnauthorizedError(
          "Verification request is invalid or expired",
        );
      }

      // Maximum 5 attempts
      if (registration.attempts >= 5) {
        throw new UnauthorizedError("Maximum verification attempts exceeded");
      }

      const valid = await this.otpService.verify(
        input.otp,
        registration.otpHash,
      );

      if (!valid) {
        await this.registrationStore.incrementAttempts(input.verificationId);

        throw new UnauthorizedError("Invalid verification code");
      }

      const existingUser = await this.userRepository.findByEmail(
        registration.email,
      );

      if (existingUser) {
        await this.registrationStore.delete(input.verificationId);

        throw new ConflictError("An account with this email already exists");
      }

      const now = new Date();

      const user = new User({
        id: randomUUID(),
        email: registration.email,
        name: registration.name,
        passwordHash: registration.passwordHash,
        createdAt: now,
        updatedAt: now,
      });

      await this.unitOfWork.execute(async (tx) => {
        await tx.userRepository.save(user);

        await tx.outboxRepository.create({
          type: AUTH_EVENTS.USER_REGISTERED,
          payload: {
            userId: user.getId(),
            email: user.getEmail(),
            name: user.getName(),
          },
        });
      });

      await this.registrationStore.delete(input.verificationId);

      this.logger.info("Email verification completed", {
        userId: user.getId(),
        email: user.getEmail(),
      });

      return {
        userId: user.getId(),
        email: user.getEmail(),
      };
    } finally {
      await this.registrationStore.releaseVerificationLock(
        input.verificationId,
        lockId,
      );
    }
  }
}
