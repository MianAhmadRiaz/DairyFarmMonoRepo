import { QueryTypes } from "sequelize";
import sequelize from "../config/db.js";

async function getReportData({ farmId, startDate, endDate, categoryId }) {
    const query = `SELECT
    si.uuid AS itemId,
    si.name AS itemName,
    sl.uuid AS stockLevel_uuid,
    sl.price AS price,
    sl."itemId" AS stockLevel_itemId,
    -- Consumption: SUM quantity of usage within date range
    SUM(
        CASE
            WHEN st.transaction_type = 'usage' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity
            ELSE 0
        END
    ) AS consumption_quantity,
    -- Purchase
    SUM(
        CASE
            WHEN st.transaction_type = 'purchase' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity
            ELSE 0
        END
    ) AS purchase_quantity,
    -- Sale
    SUM(
        CASE
            WHEN st.transaction_type = 'sale' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity
            ELSE 0
        END
    ) AS sale_quantity,
     COALESCE(
     ROUND(
            SUM(CASE WHEN st.transaction_type = 'usage' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity * st.price ELSE 0 END)::numeric
            / NULLIF(SUM(CASE WHEN st.transaction_type = 'usage' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity ELSE 0 END)::numeric, 0),
            2
        ),
        0
        ) AS usage_price,
    COALESCE(
        ROUND(
            SUM(CASE WHEN st.transaction_type = 'purchase' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity * st.price ELSE 0 END)::numeric
            / NULLIF(SUM(CASE WHEN st.transaction_type = 'purchase' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity ELSE 0 END)::numeric, 0),
            2
        ),
        0
        ) AS purchase_price,
    COALESCE(
        ROUND(
            SUM(CASE WHEN st.transaction_type = 'sale' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity * st.price ELSE 0 END)::numeric
            / NULLIF(SUM(CASE WHEN st.transaction_type = 'sale' AND st.date BETWEEN :startDate AND :endDate THEN st.quantity ELSE 0 END)::numeric, 0),
            2
        ),
        0
        ) AS sale_price
FROM stock_transactions st
LEFT JOIN stock_items si ON si.uuid = st."itemId"
LEFT JOIN stock_level sl ON sl."itemId" = si.uuid
WHERE
    st."farmId" = :farmId
    AND st."isDeleted" = false
    -- Item filter (if applicable)
    AND (
        :categoryFilterIsActive = false
        OR st."itemId" IN (
            SELECT si2.uuid
            FROM stock_items si2
            WHERE si2."categoryId" = :categoryId AND si2."farmId" = :farmId AND si2."isDeleted" = false
        )
    )
GROUP BY st."itemId", si.name, si.uuid, sl.uuid, sl.price, sl."itemId"
`;
    const replacements = {
        farmId,
        startDate,
        endDate,
        categoryFilterIsActive: !!categoryId,
        categoryId: categoryId || null,
    };

    const result = await sequelize.query(query, {
        replacements,
        type: sequelize.QueryTypes.SELECT,
    });

    return result
}

async function getOpeningSnapshots(farmId, categoryIds, startDate, endDate, isExclude = false) {
    const categoryCondition = isExclude
        ? `s."categoryId" NOT IN (:categoryIds)`
        : `s."categoryId" IN (:categoryIds)`;

    const query = `
        WITH latest_snapshots AS (
            SELECT s.*,
                   ROW_NUMBER() OVER (PARTITION BY "itemId" ORDER BY date DESC) AS rn
            FROM snapshots s
            WHERE s."farmId" = :farmId
              AND ${categoryCondition}
              AND s.date < :startDate
              AND s."isDeleted" = false
        ),
        filtered_snapshots AS (
            SELECT * FROM latest_snapshots WHERE rn = 1
        ),
        opening_transactions AS (
            SELECT 
                t."itemId",
                SUM(CASE WHEN t.transaction_type = 'purchase' THEN t.quantity ELSE 0 END) AS total_purchase,
                SUM(CASE WHEN t.transaction_type IN ('usage', 'sale') THEN t.quantity ELSE 0 END) AS total_usage,
                COALESCE(
                    ROUND(
                        SUM(CASE WHEN t.transaction_type = 'purchase' THEN t.quantity * t.price ELSE 0 END)::numeric /
                        NULLIF(SUM(CASE WHEN t.transaction_type = 'purchase' THEN t.quantity ELSE 0 END)::numeric, 0),
                        2
                    ),
                    0
                ) AS avg_purchase_price
            FROM stock_transactions t
            JOIN filtered_snapshots s ON s."itemId" = t."itemId"
            WHERE t."farmId" = :farmId
              AND t.date >= s.date AND t.date < :startDate
              AND t."isDeleted" = false
            GROUP BY t."itemId"
        ),
        closing_transactions AS (
            SELECT 
                t."itemId",
                SUM(CASE WHEN t.transaction_type = 'purchase' THEN t.quantity ELSE 0 END) AS total_purchase,
                SUM(CASE WHEN t.transaction_type IN ('usage', 'sale') THEN t.quantity ELSE 0 END) AS total_usage,
                COALESCE(
                    ROUND(
                        SUM(CASE WHEN t.transaction_type = 'purchase' THEN t.quantity * t.price ELSE 0 END)::numeric /
                        NULLIF(SUM(CASE WHEN t.transaction_type = 'purchase' THEN t.quantity ELSE 0 END)::numeric, 0),
                        2
                    ),
                    0
                ) AS avg_purchase_price
            FROM stock_transactions t
            JOIN filtered_snapshots s ON s."itemId" = t."itemId"
            WHERE t."farmId" = :farmId
              AND t.date >= s.date AND t.date < :endDate
              AND t."isDeleted" = false
            GROUP BY t."itemId"
        )

        SELECT 
            s."itemId",

            -- Opening Quantity
            s.quantity + COALESCE(ot.total_purchase, 0) - COALESCE(ot.total_usage, 0) AS opening_quantity,

            -- Opening Avg Price
            CASE
                WHEN ot.total_purchase > 0 THEN ROUND(
                    (
                        s.avg_price * s.quantity + ot.avg_purchase_price * ot.total_purchase
                    )::numeric / NULLIF((s.quantity + ot.total_purchase)::numeric, 0),
                    2
                )
                ELSE s.avg_price
            END AS opening_avg_price,

            -- Closing Quantity
            s.quantity + COALESCE(ct.total_purchase, 0) - COALESCE(ct.total_usage, 0) AS closing_quantity,

            -- Closing Avg Price
            CASE
                WHEN ct.total_purchase > 0 THEN ROUND(
                    (
                        s.avg_price * s.quantity + ct.avg_purchase_price * ct.total_purchase
                    )::numeric / NULLIF((s.quantity + ct.total_purchase)::numeric, 0),
                    2
                )
                ELSE s.avg_price
            END AS closing_avg_price,

            s.date AS snapshot_date

        FROM filtered_snapshots s
        LEFT JOIN opening_transactions ot ON ot."itemId" = s."itemId"
        LEFT JOIN closing_transactions ct ON ct."itemId" = s."itemId";
    `;

    const snapshots = await sequelize.query(query, {
        replacements: { farmId, categoryIds, startDate, endDate },
        type: QueryTypes.SELECT,
    });

    return snapshots;
}

async function getReOrderReport(farmId) {
    const query = `
  SELECT si. uuid, name, reorder_level, category_name, sl.quantity
  FROM stock_items si
  INNER JOIN stock_level sl ON si.uuid = sl."itemId"
  WHERE si."isDeleted" = false
    AND sl."isDeleted" = false
    AND si."farmId" = :farmId
    AND sl."farmId" = :farmId
    AND si."reorder_level" > sl."quantity";
`;

    const result = await sequelize.query(query, {
        replacements: { farmId },
        type: sequelize.QueryTypes.SELECT,
    });

    return result
}
export {
    getReportData,
    getReOrderReport,
    getOpeningSnapshots,
};