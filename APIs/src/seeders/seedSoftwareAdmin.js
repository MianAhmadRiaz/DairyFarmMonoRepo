// Seeds the initial software-admin account, its role/permissions, and the
// default subscription-plan catalog. Idempotent — safe to run repeatedly and
// on every boot. Run standalone with: node src/seeders/seedSoftwareAdmin.js
import bcrypt from "bcrypt";
import "../models/index.js";
import sequelize from "../config/db.js";
import keys from "../config/keys.js";
import logger from "../logger/index.js";
import Admin from "../models/softwareAdmin.js";
import AdminRoles from "../models/systemAdminRoles.js";
import AdminRoleAndPermission from "../models/systmenAdminRoles&Permissions.js";
import Permissions from "../models/permissions.js";
import SubscriptionPlan from "../models/subscriptionPlan.js";
import { SystemAdminPermissions } from "../constants/index.js";

// The system-admin permission catalog (fixed UUIDs from constants so they are stable).
const ADMIN_PERMISSIONS = [
    { uuid: SystemAdminPermissions.viewRoles, name: "View Roles", resource: "roles" },
    { uuid: SystemAdminPermissions.editRoles, name: "Edit Roles", resource: "roles" },
    { uuid: SystemAdminPermissions.deleteRoles, name: "Delete Roles", resource: "roles" },
    { uuid: SystemAdminPermissions.createRoles, name: "Create Roles", resource: "roles" },
    { uuid: SystemAdminPermissions.viewPermissions, name: "View Permissions", resource: "permissions" },
    { uuid: SystemAdminPermissions.createPermissions, name: "Create Permissions", resource: "permissions" },
    { uuid: SystemAdminPermissions.viewBilling, name: "View Billing", resource: "billing" },
    { uuid: SystemAdminPermissions.manageBilling, name: "Manage Billing", resource: "billing" },
    { uuid: SystemAdminPermissions.viewFarms, name: "View Farms", resource: "farms" },
    { uuid: SystemAdminPermissions.manageFarms, name: "Manage Farms", resource: "farms" },
    { uuid: SystemAdminPermissions.impersonateFarm, name: "Impersonate Farm", resource: "farms" },
    { uuid: SystemAdminPermissions.viewRevenue, name: "View Revenue", resource: "revenue" },
];

// Default plan catalog. `key` makes each plan idempotent by name.
const DEFAULT_PLANS = [
    {
        name: "3-Month Free Trial",
        description: "Full access for 90 days at no cost. Assign to onboard a new farm.",
        price: 0, currency: "PKR", billing_cycle: "quarterly",
        pricing_model: "flat", per_animal_rate: 0, is_trial_plan: true,
        trial_days: 90, max_animals: null, max_employees: null,
        features: ["herd", "milking", "feeding", "stock", "employee", "finance", "breeding", "reports"],
    },
    {
        name: "Starter (Monthly)",
        description: "Small farms. Flat monthly fee, up to 50 animals.",
        price: 3000, currency: "PKR", billing_cycle: "monthly",
        pricing_model: "flat", per_animal_rate: 0, is_trial_plan: false,
        trial_days: 0, max_animals: 50, max_employees: 5,
        features: ["herd", "milking", "feeding", "stock", "reports"],
    },
    {
        name: "Professional (Yearly)",
        description: "Growing farms. Flat yearly fee, up to 200 animals, all modules.",
        price: 30000, currency: "PKR", billing_cycle: "yearly",
        pricing_model: "flat", per_animal_rate: 0, is_trial_plan: false,
        trial_days: 0, max_animals: 200, max_employees: 20,
        features: ["herd", "milking", "feeding", "stock", "employee", "finance", "breeding", "reports"],
    },
    {
        name: "Per-Animal (Yearly)",
        description: "Pay per animal, billed yearly. Amount = rate × animal count at renewal.",
        price: 0, currency: "PKR", billing_cycle: "yearly",
        pricing_model: "per_animal", per_animal_rate: 250, is_trial_plan: false,
        trial_days: 0, max_animals: null, max_employees: null,
        features: ["herd", "milking", "feeding", "stock", "employee", "finance", "breeding", "reports"],
    },
];

export async function seedSoftwareAdmin() {
    // 1. Permissions
    for (const p of ADMIN_PERMISSIONS) {
        await Permissions.findOrCreate({
            where: { uuid: p.uuid },
            defaults: { uuid: p.uuid, name: p.name, description: p.name, resource: p.resource, type: "system_admin" },
        });
    }

    // 2. Super-admin role
    const [role] = await AdminRoles.findOrCreate({
        where: { name: "superadmin" },
        defaults: { name: "superadmin", description: "Full software-admin access", createdBy: "00000000-0000-0000-0000-000000000000" },
    });

    // 3. Grant every permission to the super-admin role.
    for (const p of ADMIN_PERMISSIONS) {
        await AdminRoleAndPermission.findOrCreate({
            where: { roleId: role.uuid, permissionId: p.uuid },
            defaults: { roleId: role.uuid, permissionId: p.uuid },
        });
    }

    // 4. Super-admin account (only if none with this email exists).
    const email = keys.SUPER_ADMIN.EMAIL.toLowerCase();
    const existing = await Admin.findOne({ where: { email } });
    if (!existing) {
        const hashed = await bcrypt.hash(keys.SUPER_ADMIN.PASSWORD, 10);
        await Admin.create({
            firstname: keys.SUPER_ADMIN.FIRSTNAME,
            lastname: keys.SUPER_ADMIN.LASTNAME,
            email,
            password: hashed,
            roleId: role.uuid,
            role_name: "superadmin",
            must_reset_password: true, // force a password change on first login
        });
        logger.info(`Seeded software-admin account: ${email}`);
    } else if (!existing.roleId) {
        await existing.update({ roleId: role.uuid, role_name: "superadmin" });
    }

    // 5. Default subscription plans.
    for (const plan of DEFAULT_PLANS) {
        await SubscriptionPlan.findOrCreate({
            where: { name: plan.name, isDeleted: false },
            defaults: { ...plan, is_active: true },
        });
    }

    logger.info("Software-admin seeding complete.");
}

// Allow running directly: node src/seeders/seedSoftwareAdmin.js
if (import.meta.url === `file://${process.argv[1]}`) {
    seedSoftwareAdmin()
        .then(() => { logger.info("Seeder finished."); return sequelize.close(); })
        .then(() => process.exit(0))
        .catch((err) => { logger.error(`Seeder failed: ${err.message}`); process.exit(1); });
}

export default seedSoftwareAdmin;
