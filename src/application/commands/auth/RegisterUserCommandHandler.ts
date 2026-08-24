import { randomUUID } from "node:crypto";

import type { IUserRepository } from "../../../domain/repositories/IUserRepository.js";

import type { IPasswordHasher } from "../../services/auth/IPasswordHasher.js";
import type { RegisterUserInput } from "../../dto/auth/RegisterUserInput.js";

import { ConflictError } from "../../../shared/errors/ConflictError.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";
import { IOtpService } from "../../services/registration/IOtpService.js";
import { IRegistrationStore } from "../../services/registration/IRegistrationStore.js";
import { IEmailJobQueue } from "../../services/queue/IEmailJobQueue.js";
import type { ICommandHandler } from "../../bus/ICommand.js";
import type { RegisterUserCommand } from "./RegisterUserCommand.js";

export interface RegisterUserResult {
  verificationId: string;
}

export class RegisterUserCommandHandler implements ICommandHandler<RegisterUserCommand, RegisterUserResult> {
  constructor(
    private readonly userRepository: IUserRepository,
    private readonly passwordHasher: IPasswordHasher,
    private readonly otpService: IOtpService,
    private readonly registrationStore: IRegistrationStore,
    private readonly logger: ILogger,
    private readonly emailJobQueue: IEmailJobQueue,
  ) {}

  private async handle(input: RegisterUserInput): Promise<RegisterUserResult> {
    this.logger.info("Registering user", {
      email: input.email,
    });

    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      this.logger.warn("Registration failed: user already exists", {
        email: input.email,
      });

      throw new ConflictError("User already exists");
    }

    const passwordHash = await this.passwordHasher.hash(input.password);

    const otp = this.otpService.generate();

    const otpHash = await this.otpService.hash(otp);

    const verificationId = randomUUID();

    await this.registrationStore.create(
      verificationId,
      {
        email: input.email,
        name: input.name,
        passwordHash,
        otpHash,
        attempts: 0,
      },
      60 * 10,
    );

    await this.emailJobQueue.addVerificationEmail({
      verificationId,
      email: input.email,
      name: input.name,
      otp,
    });
    this.logger.info("Registration verification created", {
      verificationId,
      email: input.email,
    });

    return {
      verificationId,
    };
  }

  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    return this.handle(command.input);
  }
}
