import { config } from "dotenv";
config();


export const DB_HOST = process.env.DB_HOST ;
export const DB_USER = process.env.DB_USER ;
export const DB_PASSWORD = process.env.DB_PASSWORD ;
export const DB_DATABASE = process.env.DB_DATABASE ;
export const DB_PORT = process.env.DB_PORT ;
export const PORT = process.env.PORT ;
export const JWT_SECRET  =process.env.JWT_SECRET;
export const BookingKey = process.env.API_KEY_BOOKING;
export const redis = process.env.URL_REDIS;
export const client_api = process.env.CLIENT_API;
export const client_pass = process.env.ClIENT_PASS;