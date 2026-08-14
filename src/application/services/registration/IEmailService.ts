export interface IEmailService {
  sendVerificationEmail(email: string, otp: string , name:string): Promise<void>;

  sendWelcomeEmail(email : string , name : string):Promise<void>;
}

