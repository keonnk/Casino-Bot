import { drizzle } from "drizzle-orm/postgres-js"
import * as schema from "./schema.js"
import postgres from "postgres"
import config from "../config.js"

const client = postgres(config.database_url)
export const db = drizzle(client, { schema, logger: true })