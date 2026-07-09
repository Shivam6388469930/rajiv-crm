import {
  generateToken,
  generateRefreshToken,
} from "@/lib/jwt";

export const createTokens = (userId: string) => {
  return {
    accessToken: generateToken({
      id: userId,
    }),

    refreshToken: generateRefreshToken({
      id: userId,
    }),
  };
};