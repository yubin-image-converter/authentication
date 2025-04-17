import { AuthService } from '@libs/service/auth/auth.service';
import { OAUTH_PROVIDERS, OAuthProvider } from '@libs/service/auth/types';
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'OAuth 로그인 진입점' })
  @ApiQuery({
    name: 'provider',
    enum: Object.values(OAUTH_PROVIDERS),
  })
  @Get('signin')
  oauthLogin(@Query('provider') provider: OAuthProvider) {
    return this.authService.redirectToOAuth(provider);
  }

  @ApiOperation({ summary: 'OAuth 콜백' })
  @ApiQuery({
    name: 'provider',
    enum: Object.values(OAUTH_PROVIDERS),
  })
  @ApiQuery({ name: 'code', required: true })
  @ApiQuery({ name: 'state', required: false })
  @Get('callback')
  async oauthCallback(
    @Query('provider') provider: OAuthProvider,
    @Query('code') code: string,
    @Query('state') state?: string,
  ) {
    return this.authService.handleOAuthCallback(provider, code, state);
  }
}
