import { LoggerService } from '@nestjs/common';

export class AppLogger implements LoggerService {
  private context: string;

  constructor(context?: string) {
    this.context = context || 'Application';
  }

  log(message: string, ...optionalParams: unknown[]) {
    console.log(
      JSON.stringify({
        level: 'info',
        context: this.context,
        message,
        timestamp: new Date().toISOString(),
        ...this.buildExtra(optionalParams),
      }),
    );
  }

  error(message: string, ...optionalParams: unknown[]) {
    console.error(
      JSON.stringify({
        level: 'error',
        context: this.context,
        message,
        timestamp: new Date().toISOString(),
        ...this.buildExtra(optionalParams),
      }),
    );
  }

  warn(message: string, ...optionalParams: unknown[]) {
    console.warn(
      JSON.stringify({
        level: 'warn',
        context: this.context,
        message,
        timestamp: new Date().toISOString(),
        ...this.buildExtra(optionalParams),
      }),
    );
  }

  debug(message: string, ...optionalParams: unknown[]) {
    console.debug(
      JSON.stringify({
        level: 'debug',
        context: this.context,
        message,
        timestamp: new Date().toISOString(),
        ...this.buildExtra(optionalParams),
      }),
    );
  }

  verbose(message: string, ...optionalParams: unknown[]) {
    console.log(
      JSON.stringify({
        level: 'verbose',
        context: this.context,
        message,
        timestamp: new Date().toISOString(),
        ...this.buildExtra(optionalParams),
      }),
    );
  }

  private buildExtra(params: unknown[]): Record<string, unknown> {
    if (params.length === 0) return {};
    if (params.length === 1 && typeof params[0] === 'object') {
      return params[0] as Record<string, unknown>;
    }
    return { metadata: params };
  }
}
