import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.url(),
  GOOGLE_CLIENT_ID: z.string(),
  JWT_SECRET: z.string(),
});

export const env = envSchema.parse(process.env);
