import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { RedisModule, RedisModuleOptions } from '@nestjs-modules/ioredis';
import * as path from 'path';

// controller
import { AuthControllerModule } from './auth/auth.controller.module';
// security
import { SecurityModule } from './config/security/security.module';
// global DTO validation pipe
import { ValidationModule } from './config/validation/validation.module';
// validate environment properties
import { validationSchema } from './config/validation/validation.schema';

@Module({
  imports: [
    /**
     * nest.js validate environment properties
     */
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      validationSchema,
    }),
    /**
     * * nest.js global DTO validation pipe
     */
    ValidationModule,
    /**
     * serve static files for landing page
     */
    ServeStaticModule.forRoot({
      rootPath: path.join(process.cwd(), 'client'),
      serveRoot: '/',
      exclude: ['/api*', '/docs*'],
    }),

    /**
     * helmet, hpp, cookieParser
     */
    SecurityModule,
    AuthControllerModule,
  ],
})
export class AppModule {}
