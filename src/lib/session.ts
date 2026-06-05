import { SessionOptions } from "iron-session";

export interface SessionData {
  userId?: string;
  name?: string;
  houseId?: string | null;
}

const getPassword = () => {
  const pwd = process.env.SECRET_COOKIE_PASSWORD;
  if (pwd && pwd.trim().length >= 32) {
    return pwd.trim();
  }
  return "complex_password_at_least_32_characters_long";
};

export const sessionOptions: SessionOptions = {
  password: getPassword(),
  cookieName: "cashflow_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export const defaultSession: SessionData = {};
