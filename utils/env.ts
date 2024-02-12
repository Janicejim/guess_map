import { config } from "dotenv";
config();

export const env = {
  DB_USERNAME: process.env.DB_USERNAME,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,
  DB_REAL_NAME: process.env.DB_REAL_NAME,
  DB_HOST: process.env.DB_HOST || "localhost",
  PORT: +process.env.PORT! || 8080,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
  SALT_ROUNDS: +process.env.SALT_ROUNDS!,
  LOGGING_LEVEL: process.env.LOGGING_LEVEL,
  NODE_ENV: process.env.NODE_ENV,
  POSTGRES_HOST: "",
  POSTGRES_USER: process.env.POSTGRES_USER,
  POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
  POSTGRES_DB: process.env.POSTGRES_DB,
};
