/* src/pages/reports/ShedFeedStockPrint.tsx */
import React, { useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { Print as PrintIcon } from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';
import useLayoutShift from '../../shared/components/Hooks/useLayoutShift';
import {
  MEAL_TIMES,
  Shed,
  ShedFeedStockPrintData,
  ShedsListData,
  getShedFeedStockPrint,
  getSheds
} from '../../shared/services/feedModule.services';

const fmt = (n: number | string | undefined | null) => {
  const num = Number(n);
  return n === undefined || n === null || Number.isNaN(num)
    ? String(n ?? '-')
    : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

/* ===== COMPONENT ============================================= */
const ShedFeedStockPrint: React.FC = () => {
  const [date, setDate] = useState('');
  const [shedId, setShedId] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [printData, setPrintData] = useState<ShedFeedStockPrintData | null>(null);
  const [loading, setLoading] = useState(false);
  const { isMobile } = useLayoutShift();

  /* load sheds for the dropdown */
  React.useEffect(() => {
    const loadSheds = async () => {
      try {
        const res = await getSheds({ limit: 200, page: 1 });
        const data: ShedsListData = res?.data?.data;
        setSheds(data?.sheds || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Can't load sheds");
      }
    };
    loadSheds();
  }, []);

  const handleGet = async () => {
    if (!shedId || !date) {
      toast.warning('Shed and feeding date are required');
      return;
    }
    try {
      setLoading(true);
      setPrintData(null);
      const res = await getShedFeedStockPrint({
        shedId,
        feeding_date: date,
        meal_time: mealTime || undefined,
        includeIngredients: 'true'
      });
      const data: ShedFeedStockPrintData = res?.data?.data;
      setPrintData(data || null);
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Can't load shed feed stock print data"
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    if (!printData) {
      toast.warning('Load the print sheet first');
      return;
    }
    window.print();
  };

  return (
    <PageContainer title="Shed Feed Stock Print Sheet" maxWidth="1200px">
      {/* ---------- control bar ---------- */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 3,
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        {/* shed picker */}
        <Box sx={{ minWidth: 220 }}>
          <Typography fontWeight={600} mb={0.5}>
            Shed
          </Typography>
          <TextField
            select
            size="small"
            fullWidth
            value={shedId}
            onChange={e => setShedId(e.target.value)}
          >
            {sheds.map(s => (
              <MenuItem key={s.uuid} value={s.uuid}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* date picker */}
        <Box sx={{ minWidth: 220 }}>
          <Typography fontWeight={600} mb={0.5}>
            Date
          </Typography>
          <TextField
            size="small"
            fullWidth
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </Box>

        {/* meal time */}
        <Box sx={{ minWidth: 220 }}>
          <Typography fontWeight={600} mb={0.5}>
            Meal Time
          </Typography>
          <TextField
            select
            size="small"
            fullWidth
            value={mealTime}
            onChange={e => setMealTime(e.target.value)}
          >
            <MenuItem value="">All</MenuItem>
            {MEAL_TIMES.map(m => (
              <MenuItem key={m} value={m}>
                {m.charAt(0).toUpperCase() + m.slice(1)}
              </MenuItem>
            ))}
          </TextField>
        </Box>

        {/* GET */}
        <Button
          variant="contained"
          onClick={handleGet}
          sx={{
            ml: 'auto',
            height: 36,
            px: 6,
            bgcolor: '#005f73',
            '&:hover': { bgcolor: '#004a5a' }
          }}
        >
          Get
        </Button>

        {/* PRINT  */}
        <Button
          sx={{
            ml: 2,
            border: '1px solid #cfd8dc',
            textTransform: 'none',
            bgcolor: '#fff',
            height: 36,
            px: 3,
            fontWeight: 600
          }}
          startIcon={<PrintIcon />}
          onClick={handlePrint}
        >
          Print
        </Button>
      </Paper>

      {/* ---------- content ---------- */}
      {loading && (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: '40px', md: '300px' },
            width: '100%'
          }}
        >
          <CircularProgress size={isMobile ? 30 : 50} sx={{ color: '#0F7C8F' }} />
        </Box>
      )}

      {!loading && !printData && (
        <Typography align="center" sx={{ mt: 6, fontWeight: 600 }}>
          Choose a shed and a date, then press “Get”.
        </Typography>
      )}

      {!loading && printData && (
        <>
          {/* ---------- summary ---------- */}
          <Paper elevation={1} sx={{ borderRadius: 2, p: 2.5, mb: 3 }}>
            <Typography fontWeight={700} fontSize={18} mb={1}>
              {printData.summary.shedInfo.name} — {printData.summary.feedingDate}
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              <Typography variant="body2">
                Pens: <b>{printData.summary.pensCount}</b>
              </Typography>
              <Typography variant="body2">
                Recipes used: <b>{printData.summary.recipesUsed}</b>
              </Typography>
              <Typography variant="body2">
                Total animals: <b>{printData.summary.totalAnimals}</b>
              </Typography>
              <Typography variant="body2">
                Planned qty: <b>{printData.summary.totalPlannedQuantity} Kg</b>
              </Typography>
              <Typography variant="body2">
                Avg / animal: <b>{printData.summary.averagePerAnimal} Kg</b>
              </Typography>
              <Typography variant="body2">
                Estimated cost: <b>{printData.summary.totalEstimatedCost}</b>
              </Typography>
            </Box>
          </Paper>

          {/* ---------- meal time groups ---------- */}
          {printData.mealTimeGroups.map(group => (
            <Paper key={group.meal_time} elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
              <Typography
                fontWeight={700}
                sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FA', borderRadius: '8px 8px 0 0' }}
              >
                Meal: {group.meal_time.charAt(0).toUpperCase() + group.meal_time.slice(1)}
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow sx={{ '& th': { fontWeight: 700, bgcolor: '#F4FAFD' } }}>
                      <TableCell>Pen</TableCell>
                      <TableCell>Recipe</TableCell>
                      <TableCell>Animals</TableCell>
                      <TableCell>Scheduled (Kg)</TableCell>
                      <TableCell>Actual (Kg)</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Est. Cost</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {group.schedules.map(s => (
                      <TableRow key={s.uuid}>
                        <TableCell>{s.pen?.name || '-'}</TableCell>
                        <TableCell>{s.recipe?.name || '-'}</TableCell>
                        <TableCell>{fmt(s.animals_count)}</TableCell>
                        <TableCell>{fmt(s.scheduled_quantity)}</TableCell>
                        <TableCell>{fmt(s.actual_quantity)}</TableCell>
                        <TableCell>{s.feeding_status.replace(/_/g, ' ')}</TableCell>
                        <TableCell>{fmt(s.estimatedCost)}</TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ '& td': { fontWeight: 700, bgcolor: '#F4FAFD' } }}>
                      <TableCell colSpan={2}>Subtotal:</TableCell>
                      <TableCell>{fmt(group.subtotal.animals)}</TableCell>
                      <TableCell>{fmt(group.subtotal.plannedQuantity)}</TableCell>
                      <TableCell>{fmt(group.subtotal.actualQuantity)}</TableCell>
                      <TableCell />
                      <TableCell>{fmt(group.subtotal.estimatedCost)}</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          ))}

          {/* ---------- ingredient requirements ---------- */}
          {printData.ingredientRequirements.length > 0 && (
            <Paper elevation={1} sx={{ borderRadius: 2 }}>
              <Typography
                fontWeight={700}
                sx={{ px: 2, py: 1.5, bgcolor: '#F8F9FA', borderRadius: '8px 8px 0 0' }}
              >
                Ingredient Requirements
              </Typography>
              <TableContainer sx={{ maxHeight: 'calc(100vh - 270px)' }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          backgroundColor: '#F8F9FA',
                          fontWeight: 700,
                          whiteSpace: 'nowrap'
                        }
                      }}
                    >
                      <TableCell sx={{ px: 1 }}>Sr#</TableCell>
                      <TableCell sx={{ px: 1 }}>Ingredient</TableCell>
                      {printData.summary.mealTimes.map(m => (
                        <TableCell key={m} sx={{ px: 1, textAlign: 'center' }}>
                          {m.charAt(0).toUpperCase() + m.slice(1)}
                        </TableCell>
                      ))}
                      <TableCell
                        sx={{
                          position: 'sticky',
                          right: 0,
                          bgcolor: '#e8f8f8',
                          fontWeight: 800
                        }}
                      >
                        TOTAL
                      </TableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {printData.ingredientRequirements.map((r, idx) => (
                      <TableRow key={r.stockItemId || idx}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell sx={{ textAlign: 'left' }}>
                          {r.name}
                          {r.description && (
                            <Typography
                              component="div"
                              fontSize="0.8rem"
                              color="text.secondary"
                            >
                              {r.description}
                            </Typography>
                          )}
                        </TableCell>

                        {printData.summary.mealTimes.map(m => {
                          const entry = r.mealBreakdown.find(
                            b => b.meal_time === m
                          );
                          return (
                            <TableCell key={m} sx={{ textAlign: 'center' }}>
                              {entry ? `${fmt(entry.quantity)} ${r.unit || ''}`.trim() : '-'}
                            </TableCell>
                          );
                        })}

                        <TableCell
                          sx={{
                            position: 'sticky',
                            right: 0,
                            bgcolor: '#e8f8f8',
                            fontWeight: 600
                          }}
                        >
                          {`${fmt(r.totalQuantity)} ${r.unit || ''}`.trim()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          )}

          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
            Generated at {new Date(printData.printMetadata.generatedAt).toLocaleString()} by{' '}
            {printData.printMetadata.generatedBy}
          </Typography>
        </>
      )}

      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </PageContainer>
  );
};

export default ShedFeedStockPrint;
