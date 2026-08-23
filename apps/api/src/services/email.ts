import nodemailer from "nodemailer";
import { Resend } from "resend";
import { createChildLogger } from "../lib/logger";

const log = createChildLogger("email");
const RESEND_BATCH_SIZE = 100;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "localhost",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      }
    : undefined,
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === "production",
  },
});

interface SendEmailParams {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(params: SendEmailParams): Promise<boolean> {
  const from = process.env.EMAIL_FROM || "noreply@komuna.id";
  const recipients = Array.isArray(params.to) ? params.to : [params.to];

  if (recipients.length === 0) {
    log.warn("email has no recipients");
    return false;
  }

  let pendingRecipients = recipients;

  if (process.env.RESEND_API_KEY) {
    let offset = 0;

    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      let resendFailed = false;

      for (; offset < recipients.length; offset += RESEND_BATCH_SIZE) {
        const batch = recipients.slice(offset, offset + RESEND_BATCH_SIZE).map((to) => ({
            from,
            to,
            subject: params.subject,
            html: params.html,
            text: params.text,
        }));
        const result = await resend.batch.send(batch);

        if (result.error) {
          resendFailed = true;
          pendingRecipients = recipients.slice(offset);
          log.error({ err: result.error, recipientCount: recipients.length }, "failed to send email via Resend");
          break;
        }
      }

      if (!resendFailed) {
        log.info({ recipientCount: recipients.length, subject: params.subject }, "email sent via Resend");
        return true;
      }
    } catch (error) {
      pendingRecipients = recipients.slice(offset);
      log.error({ err: error, recipientCount: recipients.length }, "failed to send email via Resend");
    }
  }

  // Keep recipients separate so email addresses are not disclosed to each other.
  if (process.env.SMTP_HOST) {
    try {
      for (const to of pendingRecipients) {
        await transporter.sendMail({
          from,
          to,
          subject: params.subject,
          html: params.html,
          text: params.text,
        });
      }
      log.info({ recipientCount: pendingRecipients.length, subject: params.subject }, "email sent via SMTP");
      return true;
    } catch (error) {
      log.error({ err: error, recipientCount: recipients.length }, "failed to send email via SMTP");
    }
  }

  // Development fallback: expose content locally without contacting a provider.
  if (process.env.NODE_ENV !== "production") {
    log.info({ recipientCount: pendingRecipients.length, subject: params.subject }, "dev email skipped (not actually sent)");
    return true;
  }

  log.warn(
    { recipientCount: recipients.length, subject: params.subject },
    "no email provider configured (set RESEND_API_KEY or SMTP_HOST), email not sent"
  );
  return false;
}

export function buildResetPasswordEmail(resetUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  return {
    subject: "Reset Password - KomunaID",
    text: `Anda meminta reset password KomunaID. Buka link berikut untuk membuat password baru: ${resetUrl}\n\nLink ini kedaluarsa dalam 1 jam. Jika Anda tidak meminta reset password, abaikan email ini.`,
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
