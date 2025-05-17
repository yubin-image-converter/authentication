import { HttpService } from '@nestjs/axios';
import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as axios from 'axios';
import { Response } from 'express';
import { firstValueFrom } from 'rxjs';

import { OAuthProvider } from './const/oauth-provider.const';
import { GoogleTokenResponse } from './interface/google-token';
import { GoogleUserInfo } from './interface/google-userinfo';
import { isValidOAuthStatePayload, OAuthStatePayload } from './interface/oauth-state-payload';
import { UserResponse } from './interface/user-response';

@Injectable()
export class AuthService {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  public decodeOAuthState(state: string): OAuthStatePayload {
    const unknownValue: unknown = JSON.parse(Buffer.from(state, 'base64').toString());

    if (!isValidOAuthStatePayload(unknownValue)) {
      throw new BadRequestException('[AuthService] Invalid state format');
    }

    return unknownValue;
  }

  public generateOAuthState(provider: OAuthProvider): string {
    const rawState = {
      provider,
      nonce: crypto.randomUUID(),
    };
    return Buffer.from(JSON.stringify(rawState)).toString('base64');
  }

  /**
   * Generates OAuth consent screen redirect URL for the given provider.
   */
  public getOAuthRedirectUrl(provider: OAuthProvider, state: string): string {
    try {
      if (provider !== 'google') {
        throw new BadRequestException('[AuthService] Unsupported OAuth provider');
      }

      const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID')!;
      const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI')!;
      const scope = 'email profile';

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
   * Handles OAuth callback from provider: validate state, exchange code for token, retrieve user info.
   */
  public async handleOAuthCallback(
    provider: string,
    code: string,
    _state?: string,
  ): Promise<UserResponse> {
    if (provider !== 'google') {
      throw new BadRequestException('[AuthService] Unsupported OAuth provider');
    }

    const userInfo = await this.handleGoogleCallback(code);

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
      console.error(
        '[AuthService] Failed to communicate with Spring API',
        (err as axios.AxiosError).toJSON(),
      );
      throw new InternalServerErrorException(
        '[AuthService] An error occurred while connecting to the Spring API',
      );
    }
  }

  public setOAuthStateCookie(res: Response, state: string) {
    res.cookie('oauth_state', state, {
      httpOnly: true,
      sameSite: 'lax',
    });
  }

  public verifyOAuthStateMatch(queryState: string, cookieState: string) {
    if (!queryState || queryState !== cookieState) {
      throw new BadRequestException('[AuthService] State mismatch');
    }
  }

  /**
   * Exchanges authorization code for access token and retrieves Google user info.
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
        console.error(
          `[AuthService] Failed to exchange Google token (status=${err.response?.status})`,
          JSON.stringify(err.response?.data, null, 2),
        );
      } else {
        console.error('[AuthService] Unexpected error during Google OAuth callback', err);
      }
      throw new InternalServerErrorException(
        '[AuthService] Error occurred while handling Google OAuth callback',
      );
    }
  }
}
