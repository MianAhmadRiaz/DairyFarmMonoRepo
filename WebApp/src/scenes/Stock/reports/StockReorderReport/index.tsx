import React, { useState, useEffect } from 'react';
import StockReorderTable from '../../../../shared/components/StockReorderTable';
import { Box } from '@mui/material';
import { getReorderReport } from '../../../../shared/services/stockModule.services';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';

interface StockReorderRow {
  id: number;
  products: string;
  head: string;
  priority: string;
  currentQty: number;
  reorderQty: number;
  differenceQty: number;
}

const StockReorderReport: React.FC = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<StockReorderRow[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const items = await getReorderReport();
        setRows(
          items.map((item, index) => {
            const currentQty = Number(item.quantity) || 0;
            const reorderQty = Number(item.reorder_level) || 0;
            return {
              id: index + 1,
              products: item.name,
              head: item.category_name || '-',
              priority: currentQty <= 0 ? 'High' : 'Medium',
              currentQty,
              reorderQty,
              differenceQty: Number((reorderQty - currentQty).toFixed(2))
            };
          })
        );
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('stock.stockReorderReport.fetchError'));
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box
      sx={{
        ml: { xs: '6px', sm: '6px', md: '320px' },
        mr: { xs: 2, sm: 4 },
        mt: 2,
        mb: 4,
        width: { xs: 'calc(100% - 12px)', sm: 'auto' }
      }}
    >
      <StockReorderTable data={rows} />
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
    </Box>
  );
};

export default StockReorderReport;
