// Seeds the global farm-side permission catalog (module:action rows). Idempotent.
// Permissions are shared across all farms; roles (per farm) reference them.
import "../models/index.js";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Permissions from "../models/permissions.js";
import { PERMISSION_META, ALL_PERMISSIONS } from "../constants/rbac.js";

export async function seedPermissions() {
    for (const name of ALL_PERMISSIONS) {
        const meta = PERMISSION_META[name] || {};
        await Permissions.findOrCreate({
            where: { name, type: "farm" },
            defaults: {
                name,
                description: meta.description || name,
                resource: meta.module || name.split(":")[0],
                main_resource: meta.module || name.split(":")[0],
                type: "farm",
            },
        });
    }
    logger.info(`Farm permission catalog seeded (${ALL_PERMISSIONS.length} permissions).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
    seedPermissions()
        .then(() => sequelize.close())
        .then(() => process.exit(0))
        .catch((err) => { logger.error(`Permission seeder failed: ${err.message}`); process.exit(1); });
}

export default seedPermissions;
