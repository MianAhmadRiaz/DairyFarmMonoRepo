import KEYS from "../config/keys.js";

const HttpStatusCode = {
    OK: 200,
    BAD_REQUEST: 400,
    NOT_FOUND: 404,
    INTERNAL_SERVER: 500,
};

const customLevels = {
    levels: {
        trace: 5,
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        fatal: 0,
    },
    colors: {
        trace: "white",
        debug: "green",
        info: "green",
        warn: "yellow",
        error: "red",
        fatal: "red",
    },
};

const RoleTypes = Object.freeze({
    ADMIN: "admin",
    SUPER_ADMIN: "superadmin",
});


const RateLimitTypes = Object.freeze({
    SIGNUP: "Signup",
    LOGIN: "Login",
    FORGOT_PASSWORD: "Forgot Password",
    RESET_PASSWORD: "Reset Password",
    VERIFY_EMAIL: "Verify Email",
    RESEND_EMAIL: "Resend Email",
    CHANGE_PASSWORD: "Change Password",
    NORMAL_API: "API",
});

const RateLimit = Object.freeze({
    ONE: 1000,
    THREE: 3000,
    FIVE: 5000,
    TEN: 10000,
    FIFTY: 50000,
    HUNDRED: 100000,
});

const RateLimitTimeFrame = Object.freeze({
    ONE_MINUTE: 60 * 1000,
    FIFTEEN_MINUTES: 15 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
});



const TokenTypes = Object.freeze({
    ResetPassword: "reset-password",
    verifyOtp: "verify-otp",
    verifyEmail: "verify-email",
    PasswordReset: "password-reset",
});

const OtpTypes = Object.freeze({
    ForgetPassword: "forgetPassword",
    VerifyEmail: "verifyEmail",
    VerifyMobile: "verifyMobile",
    Signin: "signin",
});

const HeatEventReason = Object.freeze({
    BeingRidden: "being ridden",
    Bellowing: "bellowing",
    BloodyDischarge: "bloody discharge",
    Other: "other",
    Kop: "kop",
    AiNotDoneDueToSmallSizeOfFollicles: "ai not doen due to small size of follicles",
});

const UnitOfMeasure = Object.freeze({
    KG: "kg",
    Liters: "liters",
    Bags: "bags",
});

const TransactionTypes = Object.freeze({
    PURCHASE: "purchase",
    USAGE: "usage",
    SALE: "sale"
});

const DefaultStockCategories = Object.freeze({
    Medicine: "medicine",
    Feeding: "feeding",
    Semen: "semen"
});

const PregnancyStatuses = Object.freeze({
    OPEN: "open",
    INSAMINATED: "inseminated",
    PREGNANT: "pregnant",
});

const MilkingSessions = Object.freeze({
    MORNING: "morning",
    AFTERNOON: "afternoon",
    EVENING: "evening",
});

const MilkOutTypes = Object.freeze({
    SELL: "sell",
    SUCKLER: "suckler",
    EMPLOYEE: "employee",
    DUMPED: "dumped",
    OTHER: "other",
});
const MilkQualities = Object.freeze({
    A: "a",
    B: "b",
    c: "c",
});
const LactationStatuses = Object.freeze({
    DRY: "dry",
    MILKING: "milking",
});

const AnimalEvents = Object.freeze({
    PROTOCOL: "protocol",
    HEAT_DETECTION: "heat detection",
    AI_BREEDING: "ai breeding",
    BULL_BREEDING: "bull breeding",
    PREGNANCY_CHECK: "pregnancy check",
    ABORTION: "abortion",
    CALVING: "calving",
    DRY_OFF: "dry off",
});

const SmtpServerCredentials = Object.freeze({
    host: KEYS.SMTP.HOST,
    port: KEYS.SMTP.PORT,
    secure: false,
    auth: {
        user: KEYS.SMTP.USER,
        pass: KEYS.SMTP.PASSWORD
    }
});

const Permissions = Object.freeze({
    superAdmin: "bb0bb45b-578f-4677-a376-c4cda59cda90", // it not exist in database so we add in front of those apis who only acces superadmin
    // roles management
    viewRoles: "4b6a680b-9f33-40d9-8623-6f729d39383c",
    editRoles: "aceea165-7289-47c5-a0d9-ee01357468dc",
    deleteRoles: "0f110f34-f437-47fc-b7c1-0d90081148ac",
    createRoles: "698241d3-836f-4bd3-bdbe-ad079d00d454",

    // permission management
    viewPermissions: "98322cee-cc46-4c1a-b9e9-bcb68bf7518a",
    createPermissions: "fb926a38-f633-4aab-a12c-def3a715c004",
});

const SystemAdminPermissions = Object.freeze({
    superAdmin: "bb0bb45b-578f-4677-a376-c4cda59cda90", // it not exist in database so we add in front of those apis who only acces superadmin
    // roles management
    viewRoles: "5f27d9da-6d93-4c7c-a070-71b4fc96c358",
    editRoles: "56564579-13d8-4893-912d-cb432df2bfdc",
    deleteRoles: "dc9c716f-1f12-4863-917a-d60311796fe6",
    createRoles: "7e846f42-4ad0-4c65-a803-c84809356bc1",

    // permission management
    viewPermissions: "1d428b88-559d-48d4-a317-befb888c3ab3",
    createPermissions: "e64880b9-ceb1-4c58-9547-48deabc16648",

    // billing / subscription management (admin & superadmin bypass via role)
    viewBilling: "a1f2c3d4-1111-4a2b-9c3d-0000000000b1",
    manageBilling: "a1f2c3d4-2222-4a2b-9c3d-0000000000b2",

    // farm control (block, revoke, impersonate, feature flags)
    viewFarms: "a1f2c3d4-3333-4a2b-9c3d-0000000000c1",
    manageFarms: "a1f2c3d4-4444-4a2b-9c3d-0000000000c2",
    impersonateFarm: "a1f2c3d4-5555-4a2b-9c3d-0000000000c3",

    // revenue / finance dashboard
    viewRevenue: "a1f2c3d4-6666-4a2b-9c3d-0000000000d1",
});

// Discount types for per-farm subscription discounts.
const DiscountTypes = Object.freeze({
    NONE: "none",
    PERCENTAGE: "percentage",
    FLAT: "flat",
});

// How a plan's charge is computed.
const PricingModels = Object.freeze({
    FLAT: "flat",
    PER_ANIMAL: "per_animal",
});

// Application modules that can be toggled on/off per farm.
const AppModules = Object.freeze({
    HERD: "herd",
    MILKING: "milking",
    FEEDING: "feeding",
    STOCK: "stock",
    EMPLOYEE: "employee",
    FINANCE: "finance",
    BREEDING: "breeding",
    REPORTS: "reports",
});

const SubscriptionStatus = Object.freeze({
    TRIALING: "trialing",
    ACTIVE: "active",
    PAST_DUE: "past_due",
    SUSPENDED: "suspended",
    CANCELLED: "cancelled",
});

const PaymentStatus = Object.freeze({
    PAID: "paid",
    PENDING: "pending",
    FAILED: "failed",
    REFUNDED: "refunded",
});

const BillingCycle = Object.freeze({
    monthly: "monthly",
    quarterly: "quarterly",
    half_yearly: "half_yearly",
    yearly: "yearly",
});
const EventTypes = Object.freeze({
    UpdateUserRole: "update-user-role",
    AddLactationHistory: "add-lactation-history",
    AddDefaultCategories: "add-default-categories",
    AddFarmConfig: "AddFarmConfig",
    Logs: "logs",
});

const DefaultFarmConfiguration = Object.freeze({
    allowed_employees: 10,
    allowed_animals: 10,
});

const RequestsStatus = Object.freeze({
    COMPLETED: "completed",
    REVIEW: "review",
    PENDING: "pending",
    REJECTED: "rejected",
    HOLD: "hold",
});

export {
    OtpTypes,
    RateLimit,
    RoleTypes,
    TokenTypes,
    EventTypes,
    Permissions,
    MilkOutTypes,
    customLevels,
    AnimalEvents,
    UnitOfMeasure,
    MilkQualities,
    RequestsStatus,
    HttpStatusCode,
    MilkingSessions,
    RateLimitTypes,
    HeatEventReason,
    TransactionTypes,
    PregnancyStatuses,
    LactationStatuses,
    RateLimitTimeFrame,
    SmtpServerCredentials,
    SystemAdminPermissions,
    DefaultStockCategories,
    DefaultFarmConfiguration,
    AppModules,
    SubscriptionStatus,
    PaymentStatus,
    BillingCycle,
    DiscountTypes,
    PricingModels,
};
