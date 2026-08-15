export interface ResetPasswordInput {
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}
