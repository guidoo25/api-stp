import { config } from "dotenv";
config();


 export const DB_HOST = process.env.DB_HOST ;
 export const DB_USER = process.env.DB_USER ;
 export const DB_PASSWORD = process.env.DB_PASSWORD ;
 export const DB_DATABASE = process.env.DB_DATABASE ;
 export const DB_PORT = process.env.DB_PORT ;
 export const PORT = process.env.PORT ;
 export const SOAP_URL =process.env.SOAP_URL;
 export const PRIVATE_KEY_PASSPHRASE = process.env.PRIVATE_KEY_PASSPHRASE;
 export const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH;
