export const isAuthKeyValid = (key: string): boolean => {
  const authKeys: string[] = process.env.AUTH_KEYS?.split("|") ?? [];
  return authKeys.includes(key);
};
export const isSecretKeyValid = (key: string): boolean => {
  const secretKeys: string[] = process.env.SECRET_KEYS?.split("|") ?? [];
  return secretKeys.includes(key);
};
