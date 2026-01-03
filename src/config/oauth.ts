import { OAuth2Client } from "google-auth-library";
import { env } from "./env.js";

export const oauth = new OAuth2Client(env.GOOGLE_CLIENT_ID);
