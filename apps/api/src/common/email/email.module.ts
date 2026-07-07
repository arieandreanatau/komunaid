import { Module, Global } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EmailAdapter } from './email-adapter.interface';
import { ConsoleEmailAdapter } from './console-email.adapter';
import { SMTPEmailAdapter } from './smtp-email.adapter';

const emailAdapterFactory = {
  provide: 'EMAIL_ADAPTER',
  useFactory: (configService: ConfigService): EmailAdapter => {
    const nodeEnv = configService.get('nodeEnv') || 'development';
    if (nodeEnv === 'production') {
      return new SMTPEmailAdapter();
    }
    return new ConsoleEmailAdapter();
  },
  inject: [ConfigService],
};

@Global()
@Module({
  providers: [emailAdapterFactory],
  exports: ['EMAIL_ADAPTER'],
})
export class EmailModule {}
