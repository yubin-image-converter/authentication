import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthService {
    constructor(private readonly httpService: HttpService) {}
    
  redirectToOAuth(provider: string): string {
    switch (provider) {
      case 'google':
        const googleClientId = process.env.GOOGLE_CLIENT_ID;
        const redirectUri = process.env.GOOGLE_REDIRECT_URI;
        const scope = 'email profile';
        const state = 'xyz'; // CSRF 방지용 또는 client 상태 식별용

        const url = `https://accounts.google.com/o/oauth2/v2/auth?response_type=code&client_id=${googleClientId}&redirect_uri=${redirectUri}&scope=${scope}&state=${state}`;
        return url;

      default:
        throw new BadRequestException('지원하지 않는 OAuth 제공자입니다.');
    }
  }


  async handleGoogleCallback(code: string) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';

    const tokenPayload = {
      code,
      client_id: process.env.GOOGLE_CLIENT_ID,
      client_secret: process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri: process.env.GOOGLE_REDIRECT_URI,
      grant_type: 'authorization_code',
    };

    const { data: tokenResponse } = await firstValueFrom(
      this.httpService.post(tokenUrl, tokenPayload, {
        headers: { 'Content-Type': 'application/json' },
      }),
    );

    const accessToken = tokenResponse.access_token;

    // 사용자 정보 요청
    const { data: userInfo } = await firstValueFrom(
      this.httpService.get('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }),
    );

    // 이후 처리 (DB 저장, JWT 발급 등)
    return userInfo;
  }
}
