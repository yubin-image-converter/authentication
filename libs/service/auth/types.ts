export interface GoogleTokenResponse {
    access_token: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
    token_type: string;
    id_token?: string;
  }
  
  export interface GoogleUserInfo {
    id: string;
    email: string;
    verified_email: boolean;
    name: string;
    given_name: string;
    family_name: string;
    picture: string;
    locale: string;
  }
  
  export interface NaverTokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    expires_in: string;
  }
  
  export interface NaverUserInfo {
    id: string;
    nickname?: string;
    name?: string;
    email?: string;
    gender?: 'M' | 'F';
    age?: string;
    birthday?: string;
    birthyear?: string;
    mobile?: string;
    profile_image?: string;
  }
  
  export const OAUTH_PROVIDERS = {
    GOOGLE: 'google',
    NAVER: 'naver',
    // APPLE: 'apple', // 나중에 추가 가능
  } as const;
  
  export type OAuthProvider = (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS];
  