import type { IEmailService } from "../../../application/services/registration/IEmailService.js";
import type { ILogger } from "../../../shared/logging/ILogger.js";
import { rabbitmqClient } from "./rabbitmqClient.js";

const EMAIL_EXCHANGE = "enterprise.email";
const EMAIL_QUEUE = "enterprise.email.verification";
const VERIFICATION_ROUTING_KEY = "email.verification";

const PASSWORD_RESET_QUEUE = "enterprise.email.password-reset";
const PASSWORD_RESET_ROUTING_KEY = "email.password-reset";

interface VerificationEmailJob {
  verificationId: string;
  email: string;
  name: string;
  otp: string;
}

interface PasswordResetEmailJob {
  verificationId: string;
  email: string;
  name: string;
  otp: string;
}

export class EmailWorker {
  constructor(
    private readonly rabbitMQClient: rabbitmqClient,
    private readonly emailService: IEmailService,
    private readonly logger: ILogger,
  ) {}

  async start(): Promise<void> {
    const channel = this.rabbitMQClient.getChannel();

    await channel.assertExchange(EMAIL_EXCHANGE, "topic", {
      durable: true,
    });

    await this.startVerificationConsumer(channel);
    await this.startPasswordResetConsumer(channel);
  }

  private async startVerificationConsumer(channel: any): Promise<void> {
    await channel.assertQueue(EMAIL_QUEUE, {
      durable: true,
    });

    await channel.bindQueue(
      EMAIL_QUEUE,
      EMAIL_EXCHANGE,
      VERIFICATION_ROUTING_KEY,
    );

    await channel.consume(
      EMAIL_QUEUE,
      async (message: any) => {
        if (!message) {
          return;
        }

        try {
          const job = JSON.parse(
            message.content.toString(),
          ) as VerificationEmailJob;

          this.logger.info("Processing verification email job", {
            verificationId: job.verificationId,
            email: job.email,
          });

          await this.emailService.sendVerificationEmail(
            job.email,
            job.otp,
            job.name,
          );

          channel.ack(message);

          this.logger.info("Verification email sent successfully", {
            verificationId: job.verificationId,
            email: job.email,
          });
        } catch (error) {
          this.logger.error("Failed to process verification email", {
            error,
          });

          /*
           * For now:
           * reject the message without retry.
           *
           * Later you can add:
           * retry + DLQ.
           */
          channel.nack(message, false, false);
        }
      },
      {
        noAck: false,
      },
    );

    this.logger.info("Email worker started", {
      queue: EMAIL_QUEUE,
    });
  }

  private async startPasswordResetConsumer(channel: any): Promise<void> {
    await channel.assertQueue(PASSWORD_RESET_QUEUE, {
      durable: true,
    });

    await channel.bindQueue(
      PASSWORD_RESET_QUEUE,
      EMAIL_EXCHANGE,
      PASSWORD_RESET_ROUTING_KEY,
    );

    await channel.consume(
      PASSWORD_RESET_QUEUE,
      async (message: any) => {
        if (!message) {
          return;
        }

        try {
          const job = JSON.parse(
            message.content.toString(),
          ) as PasswordResetEmailJob;

          this.logger.info("Processing password reset email job", {
            verificationId: job.verificationId,
            email: job.email,
          });

          await this.emailService.sendPasswordResetEmail(
            job.email,
            job.otp,
            job.name,
          );

          channel.ack(message);

          this.logger.info("Password reset email sent successfully", {
            verificationId: job.verificationId,
            email: job.email,
          });
        } catch (error) {
          this.logger.error("Failed to process password reset email", {
            error,
          });

          channel.nack(message, false, false);
        }
      },
      {
        noAck: false,
      },
    );

    this.logger.info("Password reset email worker started", {
      queue: PASSWORD_RESET_QUEUE,
    });
  }
}
