import nodemailer from "nodemailer";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("email");

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER ? {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  } : undefined,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  try {
    if (!process.env.SMTP_HOST) {
      log.warn({ to: params.to, subject: params.subject }, "SMTP not configured, email not sent");
      return false;
    }

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || "noreply@komuna.id",
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    log.info({ to: params.to, subject: params.subject }, "email sent");
    return true;
  } catch (error) {
    log.error({ err: error, to: params.to }, "failed to send email");
    return false;
  }
}

export function buildResetPasswordEmail(resetUrl: string): { subject: string; html: string } {
  return {
    subject: "Reset Password - KomunaID",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
      </head>
      <body style="margin:0;padding:0;background-color:#f4f4f4;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;padding:40px 0;">
          <tr>
            <td align="center">
              <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
                <tr>
                  <td style="background:linear-gradient(135deg,#0A1D4D,#1D4ED8,#11A79B);padding:40px 30px;text-align:center;">
                    <h1 style="color:#ffffff;margin:0;font-size:24px;">KomunaID</h1>
                    <p style="color:#00C8E6;margin:8px 0 0;font-size:14px;">Platform Komunitas Digital Indonesia</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:40px 30px;">
                    <h2 style="color:#0A1D4D;margin:0 0 16px;font-size:20px;">Reset Password</h2>
                    <p style="color:#4a5568;margin:0 0 24px;line-height:1.6;">
                      Anda telah meminta reset password. Klik tombol di bawah untuk membuat password baru.
                    </p>
                    <table cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
                      <tr>
                        <td style="background-color:#1D4ED8;border-radius:8px;">
                          <a href="${resetUrl}" style="display:inline-block;padding:14px 32px;color:#ffffff;text-decoration:none;font-weight:600;font-size:14px;">
                            Reset Password
                          </a>
                        </td>
                      </tr>
                    </table>
                    <p style="color:#718096;margin:0 0 8px;font-size:13px;line-height:1.6;">
                      Link ini akan kedaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="background-color:#f8fafc;padding:20px 30px;text-align:center;border-top:1px solid #e2e8f0;">
                    <p style="color:#a0aec0;margin:0;font-size:12px;">
                      &copy; ${new Date().getFullYear()} PT Komuna Digital Indonesia. All rights reserved.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
  };
}
