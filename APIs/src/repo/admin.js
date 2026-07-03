import sequelize from "../config/db.js";
import { AnimalEvents, PregnancyStatuses } from "../constants/index.js";
import convertToRequiredDecimalPlaces from "../utils/convertToRequiredDecimalPlaces.js";

function transformArrayToObject(data) {
    return data.reduce((acc, item) => {
        acc[item.animalCategory] = parseInt(item.totalanimals, 10);
        return acc;
    }, {});
}
async function getHerdInfo(farmId) {
    const [results] = await sequelize.query(`
        SELECT 
            COUNT(*) AS total_animals,
            SUM(CASE WHEN ispregnant = false THEN 1 ELSE 0 END) AS total_non_pregnant,
            SUM(CASE WHEN ispregnant = true THEN 1 ELSE 0 END) AS total_pregnant,
            SUM(CASE WHEN  pregnancy_status = ? THEN 1 ELSE 0 END) AS total_insaminated,
            SUM(CASE WHEN last_event = ? THEN 1 ELSE 0 END) AS total_heated,
            SUM(CASE WHEN (ispregnant = true AND "animalCategory" = ?) THEN 1 ELSE 0 END) AS total_pregnant_heifers,
            SUM(CASE WHEN (ispregnant = false AND "animalCategory" = ?) THEN 1 ELSE 0 END) AS total_non_pregnant_heifers
        FROM animals
        WHERE "isDeleted" = false AND "farmId" = ?;
    `,
        {
            replacements: [PregnancyStatuses.INSAMINATED, AnimalEvents.HEAT_DETECTION, "heifers", "heifers", farmId],
            type: sequelize.QueryTypes.SELECT,
        }
    );
    const { total_pregnant, total_animals, total_non_pregnant, total_pregnant_heifers, total_non_pregnant_heifers, total_insaminated, total_heated } = results;
    const animalCategory = await sequelize.query(`
        SELECT 
        "animalCategory",
        COUNT(*) AS totalAnimals
        FROM animals
        WHERE "isDeleted" = false AND "farmId" = :farmId
        GROUP BY "animalCategory";
    `,
        {
            replacements: { farmId },
            type: sequelize.QueryTypes.SELECT,
        });

    const animalCategoryObject = transformArrayToObject(animalCategory);
    const pregnantPercentage = (Number(total_pregnant) / Number(total_animals)) * 100;
    const responseData = {
        pregnantPercentage: convertToRequiredDecimalPlaces(pregnantPercentage, 2),
        totalAnimals: Number(total_animals),
        total_heated: Number(total_heated),
        totalPregnant: Number(total_pregnant),
        totalNonPregnant: Number(total_non_pregnant - Number(total_insaminated)),
        totalPregnantCows: Number(Number(total_pregnant) - Number(total_pregnant_heifers)),
        totalNonPregnantCows: Number(Number(total_non_pregnant) - Number(total_non_pregnant_heifers)),
        totalPregnantHeifers: Number(total_pregnant_heifers),
        totalNonPregnantHeifers: Number(total_non_pregnant_heifers),
        total_insaminated: Number(total_insaminated),
        ...animalCategoryObject
    };
    return responseData
}

async function getMilkChartInfo(filter, fromDate, toDate, farmId) {
    try {
        let groupByClause;
        let interval;

        switch (filter) {
            case "week":
                groupByClause = `DATE_TRUNC('week', "date")`;
                interval = '1 week';
                break;
            case "month":
                groupByClause = `DATE_TRUNC('month', "date")`;
                interval = '1 month';
                break;
            case "year":
                groupByClause = `DATE_TRUNC('year', "date")`;
                interval = '1 year';
                break;
            default:
                groupByClause = `DATE_TRUNC('week', "date")`;
                interval = '1 week';
        }
        const [results] = await sequelize.query(`
            WITH RECURSIVE date_series AS (
                SELECT 
                    DATE_TRUNC('${filter}', :fromDate::DATE) AS period
                UNION ALL
                SELECT 
                    period + INTERVAL '${interval}'
                FROM date_series
                WHERE period + INTERVAL '${interval}' <= DATE_TRUNC('${filter}', :toDate::DATE)
            )
            SELECT
                ds.period,
                COALESCE(SUM("milk1" + "milk2" + "milk3"), 0) AS total_milk
            FROM date_series ds
            LEFT JOIN milk_in m ON ${groupByClause} = ds.period AND m."farmId" = :farmId
            GROUP BY ds.period
            ORDER BY ds.period;
        `, {
            replacements: { fromDate, toDate, farmId },
        });

        return results;
    } catch (error) {
        console.error("Error fetching milk_in data:", error);
        throw error;
    }
};


async function getMilkDetails(filter, farmId) {
    const includeWeek = filter === 'week';
    const includeMonth = filter === 'month';
    const includeYear = filter === 'year';

    const [results] = await sequelize.query(`
        WITH daily_milk AS (
          SELECT
            DATE("date") AS milk_date,
            SUM("milk1" + "milk2" + "milk3") AS total_milk,
            COUNT(DISTINCT "uuid") AS total_cows
          FROM milk_in
          WHERE "date" >= CURRENT_DATE - INTERVAL '1 day' AND "farmId" = :farmId
          GROUP BY milk_date
        ),
        week_milk AS (
            SELECT SUM("milk1" + "milk2" + "milk3") AS week_total
            FROM milk_in
            WHERE DATE_TRUNC('week', "date") = DATE_TRUNC('week', CURRENT_DATE) AND "farmId" = :farmId
        ),
         month_milk AS (
            SELECT SUM("milk1" + "milk2" + "milk3") AS month_total
            FROM milk_in
            WHERE DATE_TRUNC('month', "date") = DATE_TRUNC('month', CURRENT_DATE) AND "farmId" = :farmId
        ),
        year_milk AS (
            SELECT SUM("milk1" + "milk2" + "milk3") AS year_total
            FROM milk_in
            WHERE DATE_TRUNC('year', "date") = DATE_TRUNC('year', CURRENT_DATE) AND "farmId" = :farmId
        )
        SELECT
          COALESCE(MAX(CASE WHEN milk_date = CURRENT_DATE THEN total_milk END), 0) AS today_total_milk,
          COALESCE(MAX(CASE WHEN milk_date = CURRENT_DATE - INTERVAL '1 day' THEN total_milk END), 0) AS yesterday_total_milk,
          COALESCE(SUM(total_milk) / NULLIF(SUM(total_cows), 0), 0) AS avg_milk_per_cow
          ${includeWeek ? ', COALESCE((SELECT week_total FROM week_milk), 0) AS current_week_total_milk' : ''}
          ${includeMonth ? ', COALESCE((SELECT month_total FROM month_milk), 0) AS current_month_total_milk' : ''}
          ${includeYear ? ', COALESCE((SELECT year_total FROM year_milk), 0) AS current_year_total_milk' : ''}
        FROM daily_milk;
    `, {
        replacements: { farmId },
    });

    return results[0];
}


// This-year vs last-year herd comparison. Current animal-category counts are
// always live (no historical headcount snapshot table exists), everything else
// is bucketed by DATE_TRUNC('year', date) for `year` and `year - 1`.
async function getHerdComparison(farmId, year) {
    const [milkRows] = await sequelize.query(`
        SELECT
            EXTRACT(YEAR FROM "date")::int AS year,
            COALESCE(SUM("milk1" + "milk2" + "milk3"), 0) AS total_milk,
            COUNT(DISTINCT "animalId") AS distinct_cows
        FROM milk_in
        WHERE "farmId" = :farmId AND EXTRACT(YEAR FROM "date") IN (:year, :prevYear)
        GROUP BY year;
    `, { replacements: { farmId, year, prevYear: year - 1 } });

    const [monthlyMilkRows] = await sequelize.query(`
        SELECT
            EXTRACT(YEAR FROM "date")::int AS year,
            EXTRACT(MONTH FROM "date")::int AS month,
            COALESCE(SUM("milk1" + "milk2" + "milk3"), 0) AS total_milk
        FROM milk_in
        WHERE "farmId" = :farmId AND EXTRACT(YEAR FROM "date") IN (:year, :prevYear)
        GROUP BY year, month
        ORDER BY month;
    `, { replacements: { farmId, year, prevYear: year - 1 } });

    const [calvingRows] = await sequelize.query(`
        SELECT EXTRACT(YEAR FROM "date")::int AS year, COUNT(*) AS calving_count
        FROM calving_events
        WHERE "farmId" = :farmId AND EXTRACT(YEAR FROM "date") IN (:year, :prevYear)
        GROUP BY year;
    `, { replacements: { farmId, year, prevYear: year - 1 } });

    const [treatmentRows] = await sequelize.query(`
        SELECT EXTRACT(YEAR FROM "date")::int AS year, COUNT(*) AS treatment_count, COALESCE(SUM(cost), 0) AS treatment_cost
        FROM animal_treatments
        WHERE "farmId" = :farmId AND "isDeleted" = false AND EXTRACT(YEAR FROM "date") IN (:year, :prevYear)
        GROUP BY year;
    `, { replacements: { farmId, year, prevYear: year - 1 } });

    const [mortalityRows] = await sequelize.query(`
        SELECT EXTRACT(YEAR FROM "date")::int AS year, COUNT(*) AS mortality_count
        FROM animal_removal_history
        WHERE "farmId" = :farmId AND "removalCategory" = 'mortality' AND EXTRACT(YEAR FROM "date") IN (:year, :prevYear)
        GROUP BY year;
    `, { replacements: { farmId, year, prevYear: year - 1 } });

    const pick = (rows, y) => rows.find(r => r.year === y) || {};
    const buildYearTotals = (y) => {
        const m = pick(milkRows, y);
        const totalMilk = Number(m.total_milk || 0);
        const distinctCows = Number(m.distinct_cows || 0);
        return {
            totalMilk: convertToRequiredDecimalPlaces(totalMilk, 2),
            avgMilkPerCow: distinctCows ? convertToRequiredDecimalPlaces(totalMilk / distinctCows, 2) : 0,
            calvingCount: Number(pick(calvingRows, y).calving_count || 0),
            treatmentCount: Number(pick(treatmentRows, y).treatment_count || 0),
            treatmentCost: convertToRequiredDecimalPlaces(Number(pick(treatmentRows, y).treatment_cost || 0), 2),
            mortalityCount: Number(pick(mortalityRows, y).mortality_count || 0),
        };
    };

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyMilkTrend = monthNames.map((label, idx) => {
        const monthNum = idx + 1;
        const current = monthlyMilkRows.find(r => r.year === year && r.month === monthNum);
        const previous = monthlyMilkRows.find(r => r.year === year - 1 && r.month === monthNum);
        return {
            month: label,
            [year]: convertToRequiredDecimalPlaces(Number(current?.total_milk || 0), 2),
            [year - 1]: convertToRequiredDecimalPlaces(Number(previous?.total_milk || 0), 2),
        };
    });

    const animalCategoryRows = await sequelize.query(`
        SELECT "animalCategory", COUNT(*) AS totalanimals
        FROM animals
        WHERE "isDeleted" = false AND "farmId" = :farmId
        GROUP BY "animalCategory";
    `, { replacements: { farmId }, type: sequelize.QueryTypes.SELECT });

    return {
        currentYear: year,
        compareYear: year - 1,
        totals: {
            [year]: buildYearTotals(year),
            [year - 1]: buildYearTotals(year - 1),
        },
        monthlyMilkTrend,
        currentAnimalCounts: transformArrayToObject(animalCategoryRows),
        currentAnimalCountsNote: "Animal counts reflect the herd right now, not a historical year-end snapshot (no such snapshot is stored).",
    };
}

export {
    getMilkDetails,
    getHerdInfo,
    getMilkChartInfo,
    getHerdComparison,
};
