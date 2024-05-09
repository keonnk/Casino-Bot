import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import config from '../config.js';

async function main() {
    const migrationClient = postgres(config.database_url, { max: 1 });
    await migrate(drizzle(migrationClient), {
        migrationsFolder: "./src/drizzle/migrations"
    })

    await migrationClient.end()
}

main()