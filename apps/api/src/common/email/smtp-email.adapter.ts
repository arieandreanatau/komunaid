import { Injectable } from '@nestjs/common';
import { EmailAdapter, SendEmailOptions } from './email-adapter.interface';

@Injectable()
export class SMTPEmailAdapter implements EmailAdapter {
  async send(_options: SendEmailOptions): Promise<void> {
    // TODO: Implement SMTP email sending with nodemailer
    // await this.transporter.sendMail({ ... });
    throw new Error(
      'SMTP email adapter not yet implemented. Use ConsoleEmailAdapter in development.',
    );
  }
}
