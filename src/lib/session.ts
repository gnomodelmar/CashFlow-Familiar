import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  name?: string;
  houseId?: string | null;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD as string,
  cookieName: "cashflow_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const defaultSession: SessionData = {};
