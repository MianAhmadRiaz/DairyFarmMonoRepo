// Pure reproduction-KPI calculations shared by the cow-profile endpoint and the
// herd-wide reproduction summary. None of these are stored fields — they are
// derived from real event dates (calvings, inseminations, pregnancy checks) so
// callers must pass in the already-fetched rows.

const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / (1000 * 60 * 60 * 24));

// Avg days between consecutive calvings, from a list of calving events (any order).
// Needs at least 2 calvings to produce an interval.
const calvingInterval = (calvingEvents = []) => {
    const dates = calvingEvents.map(c => new Date(c.date)).sort((a, b) => a - b);
    if (dates.length < 2) return null;
    const intervals = [];
    for (let i = 1; i < dates.length; i++) intervals.push(daysBetween(dates[i - 1], dates[i]));
    return Math.round(intervals.reduce((s, v) => s + v, 0) / intervals.length);
};

// Days from each calving to the next confirmed (positive) pregnancy check.
// Returns the average across cycles that have both a calving and a subsequent
// positive pregnancy result; open cycles (no confirmed pregnancy yet) are
// excluded from the average but reported separately as `openCycles`.
const daysOpen = (calvingEvents = [], positivePregnancyChecks = []) => {
    const calvings = calvingEvents.map(c => new Date(c.date)).sort((a, b) => a - b);
    const positives = positivePregnancyChecks.map(p => new Date(p.date)).sort((a, b) => a - b);
    const cycles = [];
    let openCycles = 0;
    calvings.forEach((calvingDate, i) => {
        const nextCalving = calvings[i + 1];
        const confirmedPregnancy = positives.find(
            p => p > calvingDate && (!nextCalving || p < nextCalving)
        );
        if (confirmedPregnancy) cycles.push(daysBetween(calvingDate, confirmedPregnancy));
        else if (!nextCalving) openCycles += 1;
    });
    if (!cycles.length) return { avgDaysOpen: null, openCycles };
    return { avgDaysOpen: Math.round(cycles.reduce((s, v) => s + v, 0) / cycles.length), openCycles };
};

// Number of AI/bull breeding attempts before each positive pregnancy result,
// averaged across all confirmed pregnancies.
const servicesPerConception = (breedingAttempts = [], positivePregnancyChecks = []) => {
    const attempts = breedingAttempts.map(a => new Date(a.date)).sort((a, b) => a - b);
    const positives = positivePregnancyChecks.map(p => new Date(p.date)).sort((a, b) => a - b);
    if (!positives.length) return null;
    const counts = [];
    let windowStart = new Date(0);
    positives.forEach(pDate => {
        const count = attempts.filter(a => a > windowStart && a <= pDate).length;
        if (count > 0) counts.push(count);
        windowStart = pDate;
    });
    if (!counts.length) return null;
    return Number((counts.reduce((s, v) => s + v, 0) / counts.length).toFixed(2));
};

// Peak yield / days-to-peak / 305-day yield for one lactation, from daily/periodic
// milk rows (each needs `date` and `totalMilk`) plus that lactation's calving date.
const lactationYieldStats = (milkRows = [], calvingDate) => {
    if (!milkRows.length) return { peakYield: null, daysToPeak: null, yield305: null };
    let peak = -Infinity;
    let peakDate = null;
    let sum305 = 0;
    const calving = calvingDate ? new Date(calvingDate) : null;
    milkRows.forEach(row => {
        const total = Number(row.totalMilk) || 0;
        if (total > peak) { peak = total; peakDate = row.date; }
        if (calving) {
            const dim = daysBetween(calving, row.date);
            if (dim >= 0 && dim <= 305) sum305 += total;
        }
    });
    return {
        peakYield: peak === -Infinity ? null : Number(peak.toFixed(2)),
        daysToPeak: calving && peakDate ? daysBetween(calving, peakDate) : null,
        yield305: calving ? Number(sum305.toFixed(2)) : null,
    };
};

export { calvingInterval, daysOpen, servicesPerConception, lactationYieldStats };
