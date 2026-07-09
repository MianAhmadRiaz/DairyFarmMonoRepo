import React, { useState, useEffect } from 'react';
import GlobalStockInventory, { StockItem } from '../../../shared/components/GlobalStockInventory';
import {
  getStockItems,
  findStockCategoryByName,
  StockItemRow,
  DEFAULT_STOCK_CATEGORY_NAMES
} from '../../../shared/services/stockModule.services';
import { fetchStockCategories, fetchUnits } from '../../../shared/services/stock.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

interface CategoryStockInventoryProps {
  title: string;
  subtitle: string;
  /** Backend category name, e.g. 'feeding' | 'medicine' | 'semen'. */
  categoryName?: string;
  /** When true, shows items from every non-default category instead. */
  otherCategories?: boolean;
}

const toRow = (item: StockItemRow, unitNames: Map<string, string>): StockItem => {
  const quantity = Number(item.stockLevel?.quantity) || 0;
  const price = Number(item.stockLevel?.price) || 0;
  return {
    itemName: item.name,
    unit: unitNames.get(item.unit_of_measure || '') || item.unit_of_measure || '-',
    purchaseRate: price,
    unitPrice: price,
    quantity,
    reorderLevel: Number(item.reorder_level) || 0,
    amount: Number((quantity * price).toFixed(2))
  };
};

const CategoryStockInventory: React.FC<CategoryStockInventoryProps> = ({
  title,
  subtitle,
  categoryName,
  otherCategories = false
}) => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<StockItem[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const units = await fetchUnits().catch(() => []);
        const unitNames = new Map<string, string>(
          (units as any[]).map(u => [u.uuid, u.name])
        );

        let items: StockItemRow[] = [];
        if (otherCategories) {
          const categories = await fetchStockCategories();
          const remaining = (categories || []).filter(
            c =>
              !DEFAULT_STOCK_CATEGORY_NAMES.includes(
                (c.name || '').toLowerCase() as (typeof DEFAULT_STOCK_CATEGORY_NAMES)[number]
              )
          );
          const lists = await Promise.all(
            remaining.map(c => getStockItems({ page: 1, limit: 500, categoryId: c.uuid }))
          );
          items = lists.flatMap(l => l.items || []);
        } else if (categoryName) {
          const category = await findStockCategoryByName(categoryName);
          if (!category) {
            if (!cancelled) setRows([]);
            return;
          }
          const list = await getStockItems({ page: 1, limit: 500, categoryId: category.uuid });
          items = list.items || [];
        }

        if (!cancelled) setRows(items.map(item => toRow(item, unitNames)));
      } catch (error: any) {
        if (!cancelled) {
          toast.error(error?.response?.data?.message || t('stock.common.fetchItemsError'));
        }
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [categoryName, otherCategories, t]);

  return (
    <>
      <GlobalStockInventory title={title} subtitle={subtitle} data={rows} />
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

export default CategoryStockInventory;
