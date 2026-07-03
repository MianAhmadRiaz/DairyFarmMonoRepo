// ─── Dairy Farm RBAC ──────────────────────────────────────────────────────────
// Permissions are `module:action` strings. They are stored in the `permissions`
// table by NAME (the string itself), and roles reference them. The middleware
// checks the permission NAME carried in the JWT — no hardcoded UUIDs.

// The full permission catalog, grouped by module. Each entry becomes a row in
// the permissions table (type = "farm").
export const PERMISSIONS = Object.freeze({
    // Herd / animals
    HERD_VIEW: "herd:view",
    HERD_CREATE: "herd:create",
    HERD_EDIT: "herd:edit",
    HERD_DELETE: "herd:delete",
    ANIMAL_REMOVE: "herd:remove_animal",     // sensitive: culling/sale/mortality

    // Breeding
    BREEDING_VIEW: "breeding:view",
    BREEDING_MANAGE: "breeding:manage",      // record heat/AI/pregnancy/calving/dry-off

    // Health / treatments
    HEALTH_VIEW: "health:view",
    HEALTH_MANAGE: "health:manage",          // treatments, vaccinations, withdrawal

    // Milk
    MILK_VIEW: "milk:view",
    MILK_RECORD: "milk:record",              // record milking sessions
    MILK_APPROVE: "milk:approve",            // sensitive: approve milk into the tank
    MILK_DISPATCH: "milk:dispatch",          // sensitive: milk out / sale

    // Feeding
    FEED_VIEW: "feeding:view",
    FEED_MANAGE: "feeding:manage",           // recipes, formulations, apply feed

    // Stock / inventory
    STOCK_VIEW: "stock:view",
    STOCK_MANAGE: "stock:manage",            // items, categories, consumption
    STOCK_PURCHASE: "stock:purchase",        // sensitive: purchases + supplier ledger

    // Employees / HR
    EMPLOYEE_VIEW: "employee:view",
    EMPLOYEE_MANAGE: "employee:manage",      // onboard, attendance, tasks
    SALARY_MANAGE: "employee:salary",        // sensitive: generate salary
    SALARY_PAY: "employee:salary_pay",       // sensitive: mark salary paid / advances

    // Finance
    FINANCE_VIEW: "finance:view",
    FINANCE_MANAGE: "finance:manage",        // sensitive: post transactions, journal entries

    // Admin (farm-level): users, roles, settings
    USER_VIEW: "admin:user_view",
    USER_MANAGE: "admin:user_manage",        // create/deactivate farm users
    ROLE_MANAGE: "admin:role_manage",        // create/edit roles + permissions
    FARM_SETTINGS: "admin:farm_settings",    // farm details, config

    // Reports & dashboard
    REPORTS_VIEW: "reports:view",
    DASHBOARD_VIEW: "dashboard:view",
});

const ALL = Object.values(PERMISSIONS);

// Human-readable metadata for each permission (used by the seeder + role UI).
export const PERMISSION_META = Object.freeze({
    [PERMISSIONS.HERD_VIEW]: { module: "herd", description: "View animals" },
    [PERMISSIONS.HERD_CREATE]: { module: "herd", description: "Register animals" },
    [PERMISSIONS.HERD_EDIT]: { module: "herd", description: "Edit animals, pens, tags" },
    [PERMISSIONS.HERD_DELETE]: { module: "herd", description: "Delete animals" },
    [PERMISSIONS.ANIMAL_REMOVE]: { module: "herd", description: "Cull / sell / remove animals (sensitive)" },
    [PERMISSIONS.BREEDING_VIEW]: { module: "breeding", description: "View breeding events" },
    [PERMISSIONS.BREEDING_MANAGE]: { module: "breeding", description: "Record breeding events" },
    [PERMISSIONS.HEALTH_VIEW]: { module: "health", description: "View treatments & health" },
    [PERMISSIONS.HEALTH_MANAGE]: { module: "health", description: "Record treatments & vaccinations" },
    [PERMISSIONS.MILK_VIEW]: { module: "milking", description: "View milk records" },
    [PERMISSIONS.MILK_RECORD]: { module: "milking", description: "Record milking sessions" },
    [PERMISSIONS.MILK_APPROVE]: { module: "milking", description: "Approve milk into the tank (sensitive)" },
    [PERMISSIONS.MILK_DISPATCH]: { module: "milking", description: "Dispatch / sell milk (sensitive)" },
    [PERMISSIONS.FEED_VIEW]: { module: "feeding", description: "View feeding" },
    [PERMISSIONS.FEED_MANAGE]: { module: "feeding", description: "Manage recipes & apply feed" },
    [PERMISSIONS.STOCK_VIEW]: { module: "stock", description: "View stock" },
    [PERMISSIONS.STOCK_MANAGE]: { module: "stock", description: "Manage stock items & consumption" },
    [PERMISSIONS.STOCK_PURCHASE]: { module: "stock", description: "Record purchases & suppliers (sensitive)" },
    [PERMISSIONS.EMPLOYEE_VIEW]: { module: "employee", description: "View employees" },
    [PERMISSIONS.EMPLOYEE_MANAGE]: { module: "employee", description: "Manage employees, attendance, tasks" },
    [PERMISSIONS.SALARY_MANAGE]: { module: "employee", description: "Generate salaries (sensitive)" },
    [PERMISSIONS.SALARY_PAY]: { module: "employee", description: "Pay salaries & advances (sensitive)" },
    [PERMISSIONS.FINANCE_VIEW]: { module: "finance", description: "View finance" },
    [PERMISSIONS.FINANCE_MANAGE]: { module: "finance", description: "Post transactions & journal entries (sensitive)" },
    [PERMISSIONS.USER_VIEW]: { module: "admin", description: "View farm users" },
    [PERMISSIONS.USER_MANAGE]: { module: "admin", description: "Create / deactivate farm users" },
    [PERMISSIONS.ROLE_MANAGE]: { module: "admin", description: "Create / edit roles & permissions" },
    [PERMISSIONS.FARM_SETTINGS]: { module: "admin", description: "Manage farm settings" },
    [PERMISSIONS.REPORTS_VIEW]: { module: "reports", description: "View reports" },
    [PERMISSIONS.DASHBOARD_VIEW]: { module: "dashboard", description: "View dashboard" },
});

const P = PERMISSIONS;

// The default dairy roles seeded per farm. The Owner role gets ALL permissions
// and is the account owner's role. `isOwner` marks the non-deletable owner role.
export const DAIRY_ROLES = Object.freeze([
    {
        name: "Owner",
        description: "Full access to everything, including users, roles and finance. The farm account owner.",
        isOwner: true,
        permissions: ALL,
    },
    {
        name: "Farm Manager",
        description: "Runs day-to-day operations across all modules, but cannot manage users/roles or pay salaries.",
        permissions: [
            P.HERD_VIEW, P.HERD_CREATE, P.HERD_EDIT, P.ANIMAL_REMOVE,
            P.BREEDING_VIEW, P.BREEDING_MANAGE,
            P.HEALTH_VIEW, P.HEALTH_MANAGE,
            P.MILK_VIEW, P.MILK_RECORD, P.MILK_APPROVE, P.MILK_DISPATCH,
            P.FEED_VIEW, P.FEED_MANAGE,
            P.STOCK_VIEW, P.STOCK_MANAGE, P.STOCK_PURCHASE,
            P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE, P.SALARY_MANAGE,
            P.FINANCE_VIEW,
            P.REPORTS_VIEW, P.DASHBOARD_VIEW,
        ],
    },
    {
        name: "Herdsman",
        description: "Manages the herd: animals, breeding and health. No milk approval, finance or HR.",
        permissions: [
            P.HERD_VIEW, P.HERD_CREATE, P.HERD_EDIT,
            P.BREEDING_VIEW, P.BREEDING_MANAGE,
            P.HEALTH_VIEW, P.HEALTH_MANAGE,
            P.MILK_VIEW,
            P.REPORTS_VIEW, P.DASHBOARD_VIEW,
        ],
    },
    {
        name: "Milker",
        description: "Records milking sessions. Cannot approve milk into the tank or dispatch it.",
        permissions: [
            P.HERD_VIEW,
            P.MILK_VIEW, P.MILK_RECORD,
            P.DASHBOARD_VIEW,
        ],
    },
    {
        name: "Feeder",
        description: "Handles feeding: recipes, rations and applying feed. Views stock.",
        permissions: [
            P.HERD_VIEW,
            P.FEED_VIEW, P.FEED_MANAGE,
            P.STOCK_VIEW,
            P.DASHBOARD_VIEW,
        ],
    },
    {
        name: "Storekeeper",
        description: "Manages stock, purchases and suppliers. No animals, milk or finance.",
        permissions: [
            P.STOCK_VIEW, P.STOCK_MANAGE, P.STOCK_PURCHASE,
            P.FEED_VIEW,
            P.REPORTS_VIEW, P.DASHBOARD_VIEW,
        ],
    },
    {
        name: "Accountant",
        description: "Finance, salaries and reports. Read-only on operations. Cannot alter the herd.",
        permissions: [
            P.FINANCE_VIEW, P.FINANCE_MANAGE,
            P.EMPLOYEE_VIEW, P.SALARY_MANAGE, P.SALARY_PAY,
            P.STOCK_VIEW, P.MILK_VIEW, P.HERD_VIEW,
            P.REPORTS_VIEW, P.DASHBOARD_VIEW,
        ],
    },
]);

export const OWNER_ROLE_NAME = "Owner";
export const ALL_PERMISSIONS = ALL;

export default { PERMISSIONS, PERMISSION_META, DAIRY_ROLES, OWNER_ROLE_NAME, ALL_PERMISSIONS };
