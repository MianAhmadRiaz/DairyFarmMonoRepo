import React, { useState, useEffect, useCallback } from 'react';
import GlobalSummaryTable from '../../../shared/components/GlobalSummaryTable';
import {
  getStockSummaryReport,
  findStockCategoryByName,
  StockSummaryReportRow
} from '../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

interface SummaryRow {
  id: number;
  code: string;
  products: string;
  type: string;
  opening: { qty: number; amount: number };
  purchase: { qty: number; rate: number; amount: number };
  consumption: { qty: number; rate: number; amount: number };
  saleReturn: { qty: number; amount: number };
  closing: { qty: number; amount: number };
}

interface CategorySummaryReportProps {
  title: string;
  /** Backend category name ('feeding' | 'medicine' | 'semen'). Omit for non-default categories. */
  categoryName?: string;
  /** Label shown in the Type column. */
  typeLabel: string;
}

const formatDate = (d: Date) => d.toISOString().split('T')[0];

const round2 = (n: number) => Number(n.toFixed(2));

const toSummaryRow = (row: StockSummaryReportRow, index: number, typeLabel: string): SummaryRow => {
  const openingQty = Number(row.opening_quantity) || 0;
  const openingPrice = Number(row.opening_price) || 0;
  const purchaseQty = Number(row.purchase_quantity) || 0;
  const purchaseRate = Number(row.purchase_price) || 0;
  const consumptionQty = Number(row.consumption_quantity) || 0;
  const consumptionRate = Number(row.usage_price) || 0;
  const saleQty = Number(row.sale_quantity) || 0;
  const salePrice = Number(row.sale_price) || 0;
  const closingQty = Number(row.closing_quantity) || 0;
  const closingPrice = Number(row.closing_price) || 0;
  return {
    id: index + 1,
    code: '-',
    products: row.itemname,
    type: typeLabel,
    opening: { qty: openingQty, amount: round2(openingQty * openingPrice) },
    purchase: { qty: purchaseQty, rate: purchaseRate, amount: round2(purchaseQty * purchaseRate) },
    consumption: {
      qty: consumptionQty,
      rate: consumptionRate,
      amount: round2(consumptionQty * consumptionRate)
    },
    saleReturn: { qty: saleQty, amount: round2(saleQty * salePrice) },
    closing: { qty: closingQty, amount: round2(closingQty * closingPrice) }
  };
};

const CategorySummaryReport: React.FC<CategorySummaryReportProps> = ({
  title,
  categoryName,
  typeLabel
}) => {
  const { t } = useTranslation();
  const defaultEnd = formatDate(new Date());
  const defaultStartDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return formatDate(d);
  };
  const [startDate, setStartDate] = useState(defaultStartDate());
  const [endDate, setEndDate] = useState(defaultEnd);
  const [rows, setRows] = useState<SummaryRow[]>([]);

  const loadReport = useCallback(
    async (start: string, end: string) => {
      try {
        let categoryId: string | undefined;
        if (categoryName) {
          const category = await findStockCategoryByName(categoryName);
          if (!category) {
            setRows([]);
            return;
          }
          categoryId = category.uuid;
        }
        const result = await getStockSummaryReport({
          startDate: start,
          endDate: end,
          categoryId
        });
        setRows(result.map((row, index) => toSummaryRow(row, index, typeLabel)));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('stock.categorySummaryReport.fetchError'));
      }
    },
    [categoryName, typeLabel, t]
  );

  useEffect(() => {
    loadReport(startDate, endDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadReport]);

  const handleDateChange = (newStartDate: string, newEndDate: string) => {
    setStartDate(newStartDate);
    setEndDate(newEndDate);
    loadReport(newStartDate, newEndDate);
  };

  return (
    <>
      <GlobalSummaryTable
        title={title}
        startDate={startDate}
        endDate={endDate}
        data={rows}
        onDateChange={handleDateChange}
      />
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  );
};

export default CategorySummaryReport;
