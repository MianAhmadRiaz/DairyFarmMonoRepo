// Helpers for subscription billing period math.

const CYCLE_MONTHS = {
    monthly: 1,
    quarterly: 3,
    half_yearly: 6,
    yearly: 12,
};

/**
 * Returns a new Date advanced by one billing cycle from the given date.
 * @param {Date|string} from
 * @param {string} billingCycle
 * @returns {Date}
 */
export function addBillingCycle(from, billingCycle) {
    const date = new Date(from);
    const months = CYCLE_MONTHS[billingCycle] || 1;
    date.setMonth(date.getMonth() + months);
    return date;
}

/**
 * Formats a Date as an ISO date-only string (YYYY-MM-DD).
 * @param {Date|string} date
 * @returns {string}
 */
export function toDateOnly(date) {
    return new Date(date).toISOString().split("T")[0];
}

/**
 * Generates a unique-ish invoice number, e.g. INV-20260530-7F3A.
 * @returns {string}
 */
export function generateInvoiceNumber() {
    const stamp = toDateOnly(new Date()).replace(/-/g, "");
    const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
    return `INV-${stamp}-${rand}`;
}

/**
 * Applies a discount to a gross amount.
 * @param {number} gross
 * @param {"none"|"percentage"|"flat"} type
 * @param {number} value  percent (0-100) when percentage, currency amount when flat
 * @returns {number} net amount (never below 0)
 */
export function applyDiscount(gross, type, value) {
    const g = Number(gross) || 0;
    const v = Number(value) || 0;
    if (type === "percentage") return Math.max(g - (g * v) / 100, 0);
    if (type === "flat") return Math.max(g - v, 0);
    return g;
}

/**
 * Computes the gross (pre-discount) subscription amount for a plan + animal count.
 * @param {object} plan  { pricing_model, price, per_animal_rate }
 * @param {number} animalCount
 * @returns {number}
 */
export function computeGrossAmount(plan, animalCount = 0) {
    if (plan.pricing_model === "per_animal") {
        return Number(plan.per_animal_rate || 0) * Number(animalCount || 0);
    }
    return Number(plan.price || 0);
}

/**
 * Days between two dates (b - a), floored at 0.
 */
export function daysBetween(a, b) {
    const ms = new Date(b).getTime() - new Date(a).getTime();
    return Math.max(Math.floor(ms / (1000 * 60 * 60 * 24)), 0);
}

/**
 * Number of days in one billing cycle (approximate months × 30 for proration).
 */
export function cycleDays(billingCycle) {
    return (CYCLE_MONTHS[billingCycle] || 1) * 30;
}

export default {
    addBillingCycle,
    toDateOnly,
    generateInvoiceNumber,
    applyDiscount,
    computeGrossAmount,
    daysBetween,
    cycleDays,
};
