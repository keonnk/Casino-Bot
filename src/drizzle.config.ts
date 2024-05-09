import { defineConfig } from "drizzle-kit"
import config  from "./config.js"

export default defineConfig({
    schema: "./src/drizzle/schema.ts",
    out: "./src/drizzle/migrations",
    driver: "pg",
    dbCredentials: {
        connectionString: config.database_url as string
    },
    verbose: true,
    strict: true
})