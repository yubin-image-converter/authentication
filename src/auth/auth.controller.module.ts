import { AuthModule } from '@libs/service/auth/auth.module';
import { Module } from '@nestjs/common';

import { AuthController } from './auth.controller';

@Module({
  controllers: [AuthController],
  imports: [AuthModule],
})
export class AuthControllerModule {}
