const verificationEmailTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify your email address</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #f8fafc; padding: 40px 10px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 12px;">
          <tr>
            <td style="padding: 32px 32px 20px 32px; border-bottom: 1px solid #f1f5f9;">
              <span style="font-size: 18px; font-weight: 700; color: #0f172a;">Enterprise Node</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px 0 32px;">
              <h1 style="font-size: 20px; font-weight: 600; color: #0f172a; margin: 0 0 16px 0;">Verify your email address</h1>
              <p style="font-size: 15px; line-height: 1.6; color: #475569; margin: 0 0 24px 0;">
                Hello <strong>{{name}}</strong>,<br><br>
                Thank you for creating an account with <strong>Enterprise Node</strong>. Please use the following verification code to complete your registration:
              </p>
            </td>
          </tr>
          <tr>
            <td align="center" style="padding: 0 32px;">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="background-color: #f1f5f9; border-radius: 8px;">
                <tr>
                  <td align="center" style="padding: 18px 28px;">
                    <span style="font-family: 'Courier New', Courier, monospace; font-size: 32px; font-weight: 700; letter-spacing: 6px; color: #0f172a;">{{otp}}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 20px 32px 32px 32px;">
              <p style="font-size: 13px; color: #64748b; margin: 0 0 16px 0; text-align: center;">
                This verification code will expire in <strong>10 minutes</strong>.
              </p>
              <p style="font-size: 13px; line-height: 1.5; color: #64748b; margin: 0;">
                If you did not request this code, you can safely ignore this email.
              </p>
            </td>
          </tr>
        </table>
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 520px;">
          <tr>
            <td align="center" style="padding-top: 20px; font-size: 12px; color: #94a3b8; line-height: 1.5;">
              <p style="margin: 0 0 4px 0;"><strong>Enterprise Node</strong></p>
              <p style="margin: 0;">This is an automated system email. Please do not reply.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

export function renderVerificationEmail(name: string, otp: string): string {
  return verificationEmailTemplate
    .replaceAll("{{name}}", name)
    .replaceAll("{{otp}}", otp);
}
