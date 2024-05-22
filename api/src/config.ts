import * as dotenv from "dotenv";

export const NODE_ENV = process.env.NODE_ENV;

let path;
switch (process.env.NODE_ENV) {
  case "test":
    path = `.env.test`;
    break;
  case "production":
    path = `.env.production`;
    break;
  default:
    path = `.env.development`;
}
dotenv.config({ path: path });

console.log(`LOADING ${NODE_ENV} CONFIG FROM ${path}`);

export const API_PORT = process.env.API_PORT || "3000";
export const FRONTEND_URL = process.env.FRONTEND_URL || "";
export const AUTH_REDIRECT = process.env.AUTH_REDIRECT || "";
export const AUTH0_DOMAIN = `${process.env.AUTH0_DOMAIN}` || "";
export const AUTH0_AUDIENCE = process.env.AUTH0_AUDIENCE;

export const DB_USER = process.env.DB_USER || "postgres";
export const DB_PASS = process.env.DB_PASS || "";
export const DB_HOST = process.env.DB_HOST || "";
export const DB_PORT = parseInt(process.env.DB_PORT || "") || 5432;
export const DB_NAME = process.env.DB_NAME || "";
export const DB_CLIENT = process.env.DB_CLIENT || "postgresql";

export const API_GATEWAY_KEY = process.env.API_GATEWAY_KEY || "";

export const DB_CONFIG = {
  client: DB_CLIENT,
  connection: { host: DB_HOST, user: DB_USER, password: DB_PASS, database: DB_NAME, port: DB_PORT },
};

export const DB_CONFIG_DEV = {
  client: DB_CLIENT,
  connection: {
    server: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    port: DB_PORT,
  },
};

export const MAIL_FROM = process.env.MAIL_FROM || "PMAPService@yukon.ca";
export const MAIL_HOST = process.env.MAIL_HOST || "smtp.gov.yk.ca";
export const MAIL_PORT = process.env.MAIL_PORT || 25;
export const MAIL_USER = process.env.MAIL_USER || "";
export const MAIL_PASS = process.env.MAIL_PASS || "";

export const MAIL_CONFIG_DEV = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: MAIL_USER,
    pass: MAIL_PASS,
  },
};

export const MAIL_CONFIG = {
  host: MAIL_HOST,
  port: MAIL_PORT,
  secure: false, // true for 465, false for other ports
};

export const APPLICATION_NAME = process.env.APPLICATION_NAME || "Survey Tool";

export const DB_SCHEMA = process.env.DB_SCHEMA || "";
export const DB_USER_TABLE = process.env.DB_USER_TABLE || "";

export const AD_CLIENT_ID = process.env.AD_CLIENT_ID || "";
export const AD_CLIENT_SECRET = process.env.AD_CLIENT_SECRET || "";
export const AD_TENANT_ID = process.env.AD_TENANT_ID || "";
