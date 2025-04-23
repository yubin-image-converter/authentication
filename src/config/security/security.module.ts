import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';
import helmet from 'helmet';
import * as hpp from 'hpp';

import { createHelmetOptions } from './helmet.config';

@Module({})
export class SecurityModule implements NestModule {
  constructor(private config: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const enableSecurity = this.config.get<boolean>('security.enable', false);
    const helmetOptions = createHelmetOptions(enableSecurity);

    consumer
      .apply(
        helmet(helmetOptions),
        hpp({ whitelist: ['sort', 'filter', 'tags'] }),
        cookieParser(this.config.get<string>('COOKIE_SECRET')),
      )
      .forRoutes('*');
  }
}
