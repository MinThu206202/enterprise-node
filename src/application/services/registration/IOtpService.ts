export interface IOtpService{
    generate():string ,

    hash(otp: string) : Promise<string>,

    verify(
        otp : string,
        otpHash : string
    ): Promise<boolean>;
}