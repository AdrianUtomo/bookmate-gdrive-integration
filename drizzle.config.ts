import type { Config } from "drizzle-kit"
import * as dotenv from "dotenv"
dotenv.config({path: '.env.local'})

export default {
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config
