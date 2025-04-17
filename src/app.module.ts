import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import * as path from 'path';

import { AuthControllerModule } from './auth/auth.controller.module';
import { IdsControllerModule } from './ids/ids.controller.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from './config/validation';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'client'),
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema,
    }),
    IdsControllerModule,
    AuthControllerModule,
  ],
})
export class AppModule {}
