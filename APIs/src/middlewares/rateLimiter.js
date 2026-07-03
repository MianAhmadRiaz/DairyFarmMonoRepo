import { ApiError } from "../utils/ApiError.js";

// Minimal in-memory fixed-window rate limiter (no external dependency).
// Suitable for the single-process deployment this app runs as; swap for a
// store-backed limiter (e.g. express-rate-limit + redis) when clustering.
const buckets = new Map();

// Periodically drop expired windows so the map can't grow unbounded.
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
        if (bucket.resetAt <= now) buckets.delete(key);
    }
}, 60 * 1000).unref();

/**
 * @param {number} max      allowed requests per window
 * @param {number} windowMs window length in ms
 * @param {string} name     bucket namespace (per route group)
 */
const rateLimiter = (max, windowMs, name = "default") => (req, res, next) => {
    try {
        const ip = req.headers["x-forwarded-for"]?.split(",")[0]?.trim() || req.ip || req.connection?.remoteAddress || "unknown";
        const key = `${name}:${ip}`;
        const now = Date.now();
        let bucket = buckets.get(key);
        if (!bucket || bucket.resetAt <= now) {
            bucket = { count: 0, resetAt: now + windowMs };
            buckets.set(key, bucket);
        }
        bucket.count += 1;
        if (bucket.count > max) {
            const retryAfter = Math.ceil((bucket.resetAt - now) / 1000);
            res.set("Retry-After", String(retryAfter));
            throw new ApiError("Too Many Requests", 429, `Too many attempts. Try again in ${retryAfter} seconds.`, true);
        }
        next();
    } catch (error) {
        next(error);
    }
};

export default rateLimiter;
