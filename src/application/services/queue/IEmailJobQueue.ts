export interface SendVerificationEmailJob{
    verificationId : string,
    email : string ,
    name : string,
    otp : string,
}

export interface IEmailJobQueue{
    addVerificationEmail(
        job: SendVerificationEmailJob,
    ): Promise<void>;
}