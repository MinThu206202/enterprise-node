import type { IUserRepository } from "../../../../domain/repositories/IUserRepository.js";

import type { IRegistrationStore } from "../../../ports/registration/IRegistrationStore.js";

import type { IOtpService } from "../../../ports/registration/IOtpService.js";

import type { ILogger } from "../../../../shared/logging/ILogger.js";

import type { VerifyEmailInput } from "../validation/verifyEmailSchema.js";

import { UnauthorizedError } from "../../../../shared/errors/UnauthorizedError.js";
import { ConflictError } from "../../../../shared/errors/ConflictError.js";
import type { IUnitOfWork } from "../../../ports/database/IUnitOfWork.js";
import { AUTH_EVENTS } from "../../../events/AuthEvents.js";

import { randomUUID } from "node:crypto";

import { User } from "../../../../domain/entities/User.js";
import type { ITrustedDeviceRepository } from "../../../../domain/repositories/ITrustedDeviceRepository.js";
import type { RequestContext } from "../../../context/RequestContext.js";
import { CheckLoginDeviceUseCase } from "../use-cases/CheckLoginDeviceUseCase.js";
import type { ICommandHandler } from "../../../bus/ICommand.js";
import type { VerifyEmailCommand } from "./VerifyEmailCommand.js";

const TRUST_DAYS = 30;

export interface VerifyEmailResult {
  userId: string;
  email: string;
}

export class VerifyEmailCommandHandler implements ICommandHandler<VerifyEmailCommand, VerifyEmailResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly registrationStore: IRegistrationStore,
    private readonly otpService: IOtpService,
    private readonly logger: ILogger,
    private readonly unitOfWork: IUnitOfWork,
    private readonly trustedDeviceRepository: ITrustedDeviceRepository,
  ) {}

  private async handle(
    input: VerifyEmailInput,
    context: RequestContext,
  ): Promise<VerifyEmailResult> {
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
        version: 1,
        passwordHash: registration.passwordHash,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
      });

      await this.unitOfWork.execute(async (tx) => {
        await tx.userRepository.save(user);

        const userRole = await tx.roleRepository.findByName("USER");

        if (!userRole) {
          throw new Error(
            "Default USER role not found. Run `pnpm prisma db seed` first.",
          );
        }

        await tx.userRoleRepository.assign(user.getId(), userRole.id);

        const messageId = randomUUID();
        const eventId = randomUUID();

        await tx.outboxRepository.create({
          type: AUTH_EVENTS.USER_REGISTERED,
          payload: {
            eventId,
            messageId,
            eventType: AUTH_EVENTS.USER_REGISTERED,
            eventVersion: 1,

            aggregateId: user.getId(),
            aggregateVersion: user.getVersion(),

            occurredAt: now.toISOString(),

            payload: {
              userId: user.getId(),
              email: user.getEmail(),
              name: user.getName(),
              version: user.getVersion(),
            },
          },
        });
      });

      const deviceInfo = context.deviceInfo ?? "unknown";
      const ipAddress = context.ipAddress ?? "unknown";
      const checkLoginDevice = new CheckLoginDeviceUseCase(
        this.trustedDeviceRepository,
      );
      const deviceId = checkLoginDevice.generateDeviceId(ipAddress);
      const trustedUntil = new Date(
        now.getTime() + TRUST_DAYS * 24 * 60 * 60 * 1000,
      );

      await this.trustedDeviceRepository.save({
        id: randomUUID(),
        userId: user.getId(),
        deviceId,
        deviceInfo,
        ipAddress: context.ipAddress,
        firstSeenAt: now,
        lastSeenAt: now,
        trustedUntil,
        revokedAt: null,
        createdAt: now,
        updatedAt: now,
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

  async execute(command: VerifyEmailCommand): Promise<VerifyEmailResult> {
    return this.handle(command.input, command.context);
  }
}
