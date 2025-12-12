import { TokenPayload } from "../config/jwt";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload & {
        id: string;
      };
    }
  }
}

export {};
