import { User } from "../../generated/prisma/client";

declare global {
  namespace Express {
    interface Request {
      user: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        isActive: boolean;
      };
    }
  }
}
