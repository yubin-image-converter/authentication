import { OAuthProvider } from '../const/oauth-provider.const';

export interface OAuthStatePayload {
  provider: OAuthProvider;
}

export function isValidOAuthStatePayload(obj: unknown): obj is OAuthStatePayload {
  if (typeof obj !== 'object' || obj === null) return false;

  const maybe = obj as Record<string, unknown>;
  return 'provider' in maybe && typeof maybe.provider === 'string';
}
