import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const sequelize = new Sequelize(
    process.env.DATABASE_NAME,
    process.env.SQL_USER_NAME,
    process.env.SQL_USER_PASSWORD,
    { host: process.env.SQL_HOST, dialect: "postgres", logging: false }
);

try {
    await sequelize.authenticate();
    console.log("Connected.");
    await sequelize.query(`
        DO $$ DECLARE r RECORD;
        BEGIN
            FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
                EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
            END LOOP;
        END $$;
    `);
    // Also drop all custom ENUM types
    await sequelize.query(`
        DO $$ DECLARE r RECORD;
        BEGIN
            FOR r IN (SELECT typname FROM pg_type WHERE typtype = 'e' AND typnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')) LOOP
                EXECUTE 'DROP TYPE IF EXISTS public.' || quote_ident(r.typname) || ' CASCADE';
            END LOOP;
        END $$;
    `);
    console.log("All tables and ENUM types dropped.");
} catch (err) {
    console.error("Error:", err.message);
} finally {
    await sequelize.close();
}
