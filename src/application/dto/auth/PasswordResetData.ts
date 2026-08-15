export interface PasswordResetData{
    userId : string,
    email : string,
    name : string ,
    otpHash : string,
    attempts : string,
}