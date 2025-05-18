import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { UlidModule } from '../ulid/ulid.module';
import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule, ConfigModule, UlidModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
