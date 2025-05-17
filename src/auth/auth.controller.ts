import { AuthService } from '@libs/service/auth/auth.service';
import { OAuthProvider } from '@libs/service/auth/const/oauth-provider.const';
import { BadRequestException, Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Request, Response } from 'express';

import { OAuthCallbackDto } from './dto/oauth.callback.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('signin')
  @ApiOperation({
    summary: 'Google OAuth2 로그인 리다이렉트',
    description: 'OAuth2 provider로 사용자를 리다이렉트합니다.',
  })
  @ApiQuery({ name: 'provider', enum: ['google'], required: true })
  @ApiResponse({ status: 302, description: 'OAuth2 provider로 리다이렉션됨' })
  oauthSignIn(@Query('provider') provider: OAuthProvider, @Res() res: Response) {
    try {
      if (!provider) throw new BadRequestException('provider가 필요합니다.');

      const state = this.authService.generateOAuthState(provider);
      this.authService.setOAuthStateCookie(res, state);

      const url = this.authService.getOAuthRedirectUrl(provider, state);

      return res.redirect(url);
    } catch (error) {
      console.error(`[AuthController] oauthSignIn: `, error);
    }
  }

  @Get('callback')
  @ApiOperation({
    summary: 'Google OAuth2 콜백 처리',
    description:
      'provider로부터 받은 응답을 API 서버로 전달하고, API 서버가 반환한 JWT를 클라이언트에게 전달합니다.',
  })
  @ApiResponse({ status: 200, description: '로그인 성공 및 쿠키 발급됨' })
  async oauthCallback(@Query() query: OAuthCallbackDto, @Req() req: Request, @Res() res: Response) {
    try {
      const { code, state: queryState } = query;

      const cookieState = (req.cookies as Record<string, string>)['oauth_state'];

      this.authService.verifyOAuthStateMatch(queryState, cookieState);
      const { provider } = this.authService.decodeOAuthState(queryState);

      const data = await this.authService.handleOAuthCallback(provider, code, queryState);

      const feUrl = this.configService.get<string>('FE_SERVER_URL')?.replace(/\/$/, '');

      console.log(
        `access_token 발급 완료, 프론트로 리디렉션 ${feUrl}/?accessToken=${data.accessToken}`,
      );
      return res.redirect(`${feUrl}/?accessToken=${data.accessToken}`);
    } catch (error) {
      console.error(`[AuthController] oauthCallback: `, error);
      return res.status(400).send('Failed to complete OAuth authentication.');
    }
  }

  @Get('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '쿠키에 저장된 accessToken을 제거하고 프론트엔드로 리다이렉트합니다.',
  })
  @ApiResponse({ status: 200, description: '로그아웃 완료 및 클라이언트로 리다이렉션됨' })
  logout(@Res() res: Response) {
    res.clearCookie('accessToken');

    const feUrl = this.configService.get<string>('FE_SERVER_URL')?.replace(/\/$/, '');
    console.log(`[AuthController] Logged out, redirecting to ${feUrl}`);

    return res.redirect(`${feUrl}/`);
  }
}
