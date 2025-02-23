import { config } from "dotenv";
config();

export const env = {
  DB_USERNAME: process.env.DB_USERNAME || "",
  DB_PASSWORD: process.env.DB_PASSWORD || "",
  DB_NAME: process.env.DB_NAME || "",
  DB_REAL_NAME: process.env.DB_REAL_NAME || "",
  DB_HOST: process.env.DB_HOST || "localhost",
  PORT: +process.env.PORT! || 8080,
  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || "",
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || "",
  SALT_ROUNDS: +process.env.SALT_ROUNDS! || 9,
  LOGGING_LEVEL: process.env.LOGGING_LEVEL || "",
  NODE_ENV: process.env.NODE_ENV || "",
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID || "",
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY || "",
  S3_REGION: process.env.S3_REGION || "",
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME || "",
  S3_IMAGE_URL: process.env.S3_IMAGE_URL || ""
};
