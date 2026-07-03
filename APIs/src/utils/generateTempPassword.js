import crypto from "crypto";

// Generates a strong, human-typable temporary password that satisfies the
// app's password policy (min 8, upper, lower, digit, special). Shown once to
// the creator; the recipient must reset it on first login.
const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ";   // no I, O, L to avoid confusion
const LOWER = "abcdefghijkmnpqrstuvwxyz";
const DIGITS = "23456789";                  // no 0, 1
const SPECIAL = "@#$%&*!";

const pick = (set) => set[crypto.randomInt(set.length)];

const generateTempPassword = (length = 12) => {
    // Guarantee at least one of each required class.
    const required = [pick(UPPER), pick(LOWER), pick(DIGITS), pick(SPECIAL)];
    const all = UPPER + LOWER + DIGITS + SPECIAL;
    const rest = Array.from({ length: Math.max(length - required.length, 0) }, () => pick(all));
    const chars = [...required, ...rest];
    // Fisher–Yates shuffle so the required chars aren't always first.
    for (let i = chars.length - 1; i > 0; i--) {
        const j = crypto.randomInt(i + 1);
        [chars[i], chars[j]] = [chars[j], chars[i]];
    }
    return chars.join("");
};

export default generateTempPassword;
