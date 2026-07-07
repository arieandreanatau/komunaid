import { Injectable, Logger } from '@nestjs/common';
import { EmailAdapter, SendEmailOptions } from './email-adapter.interface';

@Injectable()
export class ConsoleEmailAdapter implements EmailAdapter {
  private readonly logger = new Logger(ConsoleEmailAdapter.name);

  async send(options: SendEmailOptions): Promise<void> {
    this.logger.log(`[EMAIL] To: ${options.to}`);
    this.logger.log(`[EMAIL] Subject: ${options.subject}`);
    this.logger.log(`[EMAIL] Body: ${options.text || options.html}`);
  }
}
