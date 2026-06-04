import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  name?: string;
  houseId?: string | null;
}

export const sessionOptions: SessionOptions = {
  password: process.env.SECRET_COOKIE_PASSWORD || "complex_password_at_least_32_characters_long",
  cookieName: "cashflow_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const defaultSession: SessionData = {};
