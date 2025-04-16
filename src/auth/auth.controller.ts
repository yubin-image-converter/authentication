import { AuthService } from '@libs/service/auth/auth.service';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiOperation({ summary: 'OAuth 로그인 진입점' })
  @Get('signin')
  async oauthLogin(@Query('provider') provider: string) {
    return this.authService.redirectToOAuth(provider);
  }

  @Get('callback/google')
async googleCallback(@Query('code') code: string) {
  return this.authService.handleGoogleCallback(code);
}
}
