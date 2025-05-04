import { AuthService } from '@libs/service/auth/auth.service';
import { OAuthProvider } from '@libs/service/auth/const/oauth-provider.const';
import { BadRequestException, Controller, Get, Query, Req, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiTags } from '@nestjs/swagger';
import * as crypto from 'crypto';
import type { Request, Response } from 'express';

import { OAuthCallbackDto } from './dto/oauth.callback.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  /** 1) 로그인 진입점: 서버에서 구글로 리다이렉트 */
  @Get('signin') oauthSignIn(@Query('provider') provider: OAuthProvider, @Res() res: Response) {
    if (!provider) throw new BadRequestException('provider가 필요합니다.');

    const rawState = {
      provider,
      nonce: crypto.randomUUID(),
    };
    const state = Buffer.from(JSON.stringify(rawState)).toString('base64');

    res.cookie('oauth_state', state, { httpOnly: true, sameSite: 'lax' });

    const url = this.authService.getOAuthRedirectUrl(provider, state);

    console.log(`🟡 OAuth 로그인 시작`);
    // console.log(`  ↪️ provider: ${provider}`);
    // console.log(`  ↪️ state (set to cookie): ${state}`);
    // console.log(`  ↪️ redirecting to: ${url}`);

    return res.redirect(url);
  }

  /** 2) OAuth 콜백 처리 */
  @Get('callback')
  async oauthCallback(@Query() query: OAuthCallbackDto, @Req() req: Request, @Res() res: Response) {
    const { code, state: queryState } = query;
    const cookieState = (req.cookies as Record<string, string>)['oauth_state'];

    console.log(`🔐 OAuth 콜백 도착`);

    if (!queryState || queryState !== cookieState) {
      console.error(`❌ state mismatch! 요청 거부됨`);
      throw new BadRequestException('state 불일치');
    }

    let provider: OAuthProvider;
    try {
      const decoded = JSON.parse(Buffer.from(queryState, 'base64').toString()) as {
        provider: OAuthProvider;
      };
      provider = decoded.provider;
      console.log(`✅ provider 복원됨: ${provider}`);
    } catch (error) {
      console.error(`❌ 잘못된 state 형식`);
      throw new BadRequestException('잘못된 state 형식', error);
    }

    // 🟢 Spring Boot 연동
    const data = await this.authService.handleOAuthCallback(provider, code, queryState);

    const feUrl = this.configService.get<string>('FE_SERVER_URL')?.replace(/\/$/, '');

    res.cookie('access_token', data.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      path: '/',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return res.redirect(`${feUrl}/oauth/callback`);
  }
}
