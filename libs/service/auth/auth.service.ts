import { HttpService } from '@nestjs/axios';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as axios from 'axios';
import { firstValueFrom } from 'rxjs';

import { OAuthProvider } from './const/oauth-provider.const';
import { GoogleTokenResponse } from './interface/google-token.interface';
import { GoogleUserInfo } from './interface/google-userinfo.interface';
import { UserResponse } from './interface/user-response.interface';

@Injectable()
export class AuthService {
  private readonly state = 'xyz'; // CSRF 방지를 위한 토큰
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * 주어진 provider에 대해 OAuth 인증 URL을 생성합니다.
   * @param provider - OAuth 제공자 이름 (예: 'google').
   * @param state - CSRF 방지를 위한 state 값.
   * @returns OAuth 동의 화면으로 리다이렉트할 URL 문자열.
   */
  public getOAuthRedirectUrl(provider: OAuthProvider, state: string): string {
    try {
      if (provider !== 'google') {
        throw new BadRequestException('지원하지 않는 제공자입니다.');
      }

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
      const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI')!;
      const scope = 'email profile';

      console.log(`🔁 redirect_uri 확인: ${redirectUri}`);

      return [
        'https://accounts.google.com/o/oauth2/v2/auth?',
        `response_type=code`,
        `&client_id=${clientId}`,
        `&redirect_uri=${encodeURIComponent(redirectUri)}`,
        `&scope=${encodeURIComponent(scope)}`,
        `&state=${encodeURIComponent(state)}`,
      ].join('');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  /**
   * OAuth 콜백을 처리합니다: state 검증, code를 토큰으로 교환, 사용자 정보 조회.
   * @param provider - OAuth 제공자 이름.
   * @param code - 제공자로부터 전달받은 authorization code.
   * @param state - 검증할 CSRF state 값.
   * @returns 사용자 정보가 담긴 UserResponse 객체.
   */
  public async handleOAuthCallback(
    provider: string,
    code: string,
    _state?: string,
  ): Promise<UserResponse> {
    if (provider !== 'google') {
      throw new BadRequestException('지원하지 않는 제공자입니다.');
    }

    // 2) authorization code를 토큰으로 교환하여 사용자 정보 획득
    const userInfo = await this.handleGoogleCallback(code);

    // 3) Spring Boot API로 사용자 정보 전송 (회원가입 또는 로그인)
    try {
      const { data } = await firstValueFrom(
        this.httpService.post<UserResponse>(
          this.configService.get<string>('API_SERVER_URL') + '/api/auth/oauth/callback',
          {
            email: userInfo.email,
            name: userInfo.name,
            provider,
            providerId: userInfo.id,
          },
        ),
      );
      return data;
    } catch (err) {
      this.logger.error('Spring 연동 실패', (err as axios.AxiosError).toJSON());
      throw new InternalServerErrorException('Spring 연동 중 오류가 발생했습니다.');
    }
  }

  /**
   * authorization code를 access token으로 교환하고, Google 사용자 정보를 조회합니다.
   * @param code - Google에서 받은 authorization code.
   * @returns 사용자의 프로필 정보가 담긴 GoogleUserInfo 객체.
   */
  private async handleGoogleCallback(code: string): Promise<GoogleUserInfo> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams({
      code,
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID')!,
      client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET')!,
      redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI')!,
      grant_type: 'authorization_code',
    });

    try {
      const { data: tokenResp } = await firstValueFrom(
        this.httpService.post<GoogleTokenResponse>(tokenUrl, params, {
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        }),
      );

      const accessToken = tokenResp.access_token;
      const { data: userInfo } = await firstValueFrom(
        this.httpService.get<GoogleUserInfo>('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }),
      );
      return userInfo;
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        this.logger.error(
          `Google 토큰 교환 실패 (status=${err.response?.status})`,
          JSON.stringify(err.response?.data, null, 2),
        );
      } else {
        this.logger.error('Google OAuth 처리 중 예외 발생', err);
      }
      throw new InternalServerErrorException('Google OAuth 콜백 처리 중 오류가 발생했습니다.');
    }
  }
}
