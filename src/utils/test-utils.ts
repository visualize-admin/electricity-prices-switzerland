export const getHttpCredentialsFromEnv = () => {
  const usernamePassword = process.env.BASIC_AUTH_CREDENTIALS;
  if (!usernamePassword) {
    return undefined;
  }
  const [username, password] = usernamePassword.split(":");
  if (!username || !password) {
    throw new Error(
      "BASIC_AUTH_CREDENTIALS environment variable must be in the format 'username:password'",
    );
  }
  return { username, password };
};

export const getExtraHttpHeadersFromEnv = () => {
  return {
    "x-vercel-skip-toolbar": "1",
    ...(process.env.VERCEL_AUTOMATION_BYPASS_SECRET && {
      "x-vercel-protection-bypass": process.env.VERCEL_AUTOMATION_BYPASS_SECRET,
    }),
  };
};
