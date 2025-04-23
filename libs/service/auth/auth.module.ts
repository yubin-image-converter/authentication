import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AuthService } from './auth.service';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
