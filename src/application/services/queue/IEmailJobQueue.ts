export interface SendVerificationEmailJob {
    verificationId: string,
    email: string,
    name: string,
    otp: string,
}

export interface SendPasswordResetEmailJob {
    verificationId: string,
    email: string,
    name: string,
    otp: string,
}

export interface IEmailJobQueue {
    addVerificationEmail(
        job: SendVerificationEmailJob,
    ): Promise<void>;

    addPasswordResetEmail(
        job: SendPasswordResetEmailJob,
    ): Promise<void>;
}
