import { defineConfig } from "drizzle-kit"
import config  from "./config.js"

export default defineConfig({
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations",
    dialect: "postgresql",
    dbCredentials: {
        url: config.database_url as string
    },
    verbose: true,
    strict: true
})