import {
  GoogleTokenResponse,
  GoogleUserInfo,
  NaverTokenResponse,
  NaverUserInfo,
  OAuthProvider,
} from '@libs/service/auth/types';
import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosResponse } from 'axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
  private readonly state = 'xyz'; // CSRF 방지 또는 클라이언트 상태 식별용

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  /** OAuth 로그인 URL 리다이렉트용 URL 생성 */
  public redirectToOAuth(provider: OAuthProvider): string {
    return this.getOAuthRedirectUrl(provider);
  }

  /** OAuth 콜백 처리 */
  public async handleOAuthCallback(
    provider: OAuthProvider,
    code: string,
    state?: string,
  ): Promise<GoogleUserInfo | NaverUserInfo> {
    switch (provider) {
      case 'google':
        return this.handleGoogleCallback(code);
      case 'naver':
        return this.handleNaverCallback(code, state ?? this.state);
      default:
        throw new BadRequestException('지원하지 않는 OAuth 제공자입니다.');
    }
  }

  /** Google OAuth 콜백 처리 */
  private async handleGoogleCallback(code: string): Promise<GoogleUserInfo> {
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const tokenPayload = {
      code,
      client_id: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      client_secret: this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      grant_type: 'authorization_code',
    };

    const { data: tokenResponse } = await firstValueFrom<AxiosResponse<GoogleTokenResponse>>(
      this.httpService.post(tokenUrl, tokenPayload, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const accessToken = tokenResponse.access_token;

    const { data: userInfo } = await firstValueFrom<AxiosResponse<GoogleUserInfo>>(
      this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return userInfo;
  }

  /** Naver OAuth 콜백 처리 */
  private async handleNaverCallback(code: string, state: string): Promise<NaverUserInfo> {
    const tokenUrl = 'https://nid.naver.com/oauth2.0/token';

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.configService.get<string>('NAVER_CLIENT_ID') as string,
      client_secret: this.configService.get<string>('NAVER_CLIENT_SECRET') as string,
      code,
      state,
    });

    const { data: tokenResponse } = await firstValueFrom<AxiosResponse<NaverTokenResponse>>(
      this.httpService.post(tokenUrl, params.toString(), {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }),
    );

    const accessToken = tokenResponse.access_token;

    const response = await firstValueFrom<
      AxiosResponse<{
        response: NaverUserInfo;
      }>
    >(
      this.httpService.get('https://openapi.naver.com/v1/nid/me', {
        headers: { Authorization: `Bearer ${accessToken}` },
      }),
    );

    return response.data.response;
  }

  /** OAuth URL 생성기 */
  private getOAuthRedirectUrl(provider: 'google' | 'naver'): string {
    switch (provider) {
      case 'google': {
        const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
        const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
        const scope = 'email profile';

        return `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&scope=${encodeURIComponent(scope)}&state=${this.state}`;
      }

      case 'naver': {
        const clientId = this.configService.get<string>('NAVER_CLIENT_ID');
        const redirectUri = this.configService.get<string>('NAVER_REDIRECT_URI');
        //  const clientSecret = this.configService.get<string>('NAVER_CLIENT_SECRET');

        return `https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=${clientId}&redirect_uri=${redirectUri}&state=${this.state}`;
      }

      default:
        throw new BadRequestException('지원하지 않는 OAuth 제공자입니다.');
    }
  }
}
