export const OAUTH_PROVIDERS = {
  GOOGLE: 'google',
  NAVER: 'naver', // APPLE: 'apple', // 나중에 추가 가능
} as const;

export type OAuthProvider = (typeof OAUTH_PROVIDERS)[keyof typeof OAUTH_PROVIDERS];
