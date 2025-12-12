import jwt from "jsonwebtoken";
import { env } from "./env";

export interface TokenPayload {
  userId: string;
  email: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

class JWTService {
  generateAccessToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    });
  }

  generateRefreshToken(payload: TokenPayload): string {
    return jwt.sign(payload, env.jwt.refreshSecret, {
      expiresIn: env.jwt.refreshExpiresIn,
    });
  }

  generateTokenPair(payload: TokenPayload): TokenPair {
    return {
      accessToken: this.generateAccessToken(payload),
      refreshToken: this.generateRefreshToken(payload),
    };
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.jwt.secret) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired access token");
    }
  }

  verifyRefreshToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
    } catch (error) {
      throw new Error("Invalid or expired refresh token");
    }
  }

  decodeToken(token: string): TokenPayload | null {
    try {
      return jwt.decode(token) as TokenPayload;
    } catch (error) {
      return null;
    }
  }
}

export const jwtService = new JWTService();
