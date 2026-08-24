import nodemailer from "nodemailer";

import type { IEmailService } from "../../application/ports/registration/IEmailService.js";

import { renderVerificationEmail } from "./templates/verification-email.js";

export class EmailService implements IEmailService {
  private readonly transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  async sendVerificationEmail(
    email: string,
    otp: string,
    name: string,
  ): Promise<void> {
    const html = renderVerificationEmail(name, otp);

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Verify your email address",
      html,
      text: `Hello ${name},\n\nYour Enterprise Node verification code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you did not request this code, you can safely ignore this email.`,
    });
  }

  async sendWelcomeEmail(email: string, name: string): Promise<void> {
    const html = `
    <!DOCTYPE html>
    <html>
      <body>
        <h1>Welcome to Enterprise Node!</h1>
        <p>Hello ${name},</p>
        <p>Your account has been successfully created.</p>
      </body>
    </html>
  `;

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Welcome to Enterprise Node",
      html,
    });
  }
  async sendPasswordResetEmail(
    email: string,
    otp: string,
    name: string,
  ): Promise<void> {
    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: "Reset your password",
      text: `
Hello ${name},

Your password reset code is:

${otp}

This code will expire in 10 minutes.

If you did not request a password reset, please ignore this email.
    `.trim(),
    });
  }

  async sendNewDeviceLoginEmail(params: {
    to: string;
    otp: string;
    deviceInfo: string | null;
    ipAddress: string | null;
  }): Promise<void> {
    const device = params.deviceInfo ?? "Unknown device";
    const ip = params.ipAddress ?? "Unknown IP";

    await this.transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: params.to,
      subject: "New device login verification",
      text: `
A new login was attempted from:

Device: ${device}
IP: ${ip}

Your verification code is: ${params.otp}

This code will expire in 10 minutes.

If you did not attempt this login, please secure your account immediately.
    `.trim(),
    });
  }
}
