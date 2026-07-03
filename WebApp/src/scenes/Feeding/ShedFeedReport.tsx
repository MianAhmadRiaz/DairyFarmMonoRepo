/* src/pages/reports/ShedFeedReport.tsx */
import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from '@mui/material';
import {
  Search as SearchIcon,
  SaveOutlined as SaveIcon,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
import PageContainer from '../../shared/components/Layout/PageContainer';
import useLayoutShift from '../../shared/components/Hooks/useLayoutShift';
import { tokens } from '../../shared/theme/theme';
import {
  MEAL_TIMES,
  FeedScheduleRow,
  Shed,
  ShedFeedReportData,
  ShedFeedReportSummary,
  ShedsListData,
  getShedFeedReport,
  getSheds,
  recordFeedingActual,
} from '../../shared/services/feedModule.services';

/* ───────── helpers ───────── */
const fmt = (n: number | string) => {
  const num = Number(n);
  return Number.isNaN(num)
    ? String(n)
    : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const statusColors: Record<string, { bg: string; fg: string }> = {
  scheduled: { bg: '#E3F2FD', fg: '#1565C0' },
  in_progress: { bg: '#FFF8E1', fg: '#F9A825' },
  completed: { bg: '#D8EEB4', fg: '#33691E' },
  skipped: { bg: '#FCE9E1', fg: '#D84315' },
  partially_completed: { bg: '#FFF3E0', fg: '#EF6C00' },
};

/* ================================================================== */
const ShedFeedReport: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  /* filters */
  const [shedId, setShedId] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [mealTime, setMealTime] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 15;
  const { isMobile } = useLayoutShift();

  /* data */
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [schedules, setSchedules] = useState<FeedScheduleRow[]>([]);
  const [summary, setSummary] = useState<ShedFeedReportSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [fetchedOnce, setFetchedOnce] = useState(false);

  /* record actual state */
  const [actuals, setActuals] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);

  /* load sheds once */
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

  const loadReport = async () => {
    try {
      setLoading(true);
      const res = await getShedFeedReport({
        shedId: shedId || undefined,
        start_date: startDate || undefined,
        end_date: endDate || undefined,
        meal_time: mealTime || undefined,
        limit: 500,
        page: 1,
      });
      const data: ShedFeedReportData = res?.data?.data;
      setSchedules(data?.schedules || []);
      setSummary(data?.summary || null);
      setActuals(
        Object.fromEntries(
          (data?.schedules || []).map(s => [s.uuid, String(s.actual_quantity ?? '')])
        )
      );
      setPage(1);
      setFetchedOnce(true);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Can't load shed feed report");
    } finally {
      setLoading(false);
    }
  };

  /* record actual for a schedule row */
  const handleRecordActual = async (row: FeedScheduleRow) => {
    const value = Number(actuals[row.uuid]);
    if (!(value >= 0)) {
      toast.warning('Actual quantity must be a number >= 0');
      return;
    }
    try {
      setSavingId(row.uuid);
      await recordFeedingActual({
        scheduleId: row.uuid,
        actual_quantity: value,
      });
      toast.success('Feeding actuals recorded!');
      await loadReport();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Can't record feeding actuals");
    } finally {
      setSavingId(null);
    }
  };

  /* filter + paging */
  const filtered = useMemo(
    () =>
      schedules.filter(r => {
        const haystack = `${r.shed?.name || ''} ${r.pen?.name || ''} ${
          r.recipe?.name || ''
        }`.toLowerCase();
        return haystack.includes(query.toLowerCase());
      }),
    [schedules, query],
  );
  const paged = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filtered.slice(start, start + rowsPerPage);
  }, [filtered, page]);

  const summaryCards = summary
    ? [
        { label: 'Schedules', value: fmt(summary.totalSchedules) },
        { label: 'Animals', value: fmt(summary.totalAnimals) },
        { label: 'Planned Qty (Kg)', value: fmt(summary.totalPlannedQuantity) },
        { label: 'Actual Qty (Kg)', value: fmt(summary.totalActualQuantity) },
        { label: 'Total Cost', value: fmt(summary.totalCost) },
        { label: 'Completion', value: `${summary.completionRate}%` },
      ]
    : [];

  return (
    <PageContainer title="Shed Feeding Report" maxWidth="1100px">
      {/* ───────── filter bar ───────── */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          mb: 3,
          borderRadius: 2,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2,
          alignItems: 'flex-end',
        }}
      >
        <Box sx={{ minWidth: 220 }}>
          <Typography fontWeight={600} mb={0.5}>Shed</Typography>
          <TextField
            select
            size="small"
            fullWidth
            value={shedId}
            onChange={e => setShedId(e.target.value)}
          >
            <MenuItem value="">All sheds</MenuItem>
            {sheds.map(s => (
              <MenuItem key={s.uuid} value={s.uuid}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Typography fontWeight={600} mb={0.5}>Start Date</Typography>
          <TextField
            size="small"
            fullWidth
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 180 }}>
          <Typography fontWeight={600} mb={0.5}>End Date</Typography>
          <TextField
            size="small"
            fullWidth
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
          />
        </Box>
        <Box sx={{ minWidth: 160 }}>
          <Typography fontWeight={600} mb={0.5}>Meal Time</Typography>
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
        <Button
          variant="contained"
          sx={{ bgcolor: '#005f73', px: 5, ml: { xs: 0, md: 'auto' } }}
          onClick={loadReport}
        >
          Get
        </Button>
      </Paper>

      {/* ───────── summary cards ───────── */}
      {summary && (
        <Grid container spacing={2} mb={3}>
          {summaryCards.map(card => (
            <Grid item xs={6} sm={4} md={2} key={card.label}>
              <Paper elevation={1} sx={{ p: 1.5, borderRadius: 2, height: '100%' }}>
                <Typography variant="h6" fontWeight={700}>
                  {card.value}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {card.label}
                </Typography>
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {/* ───────── search ───────── */}
      <Box mb={3} display="flex" gap={2} alignItems="center" flexWrap="wrap">
        <Paper
          elevation={1}
          sx={{
            px: 2,
            py: 1,
            borderRadius: 2,
            flexGrow: 1,
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <SearchIcon sx={{ mr: 1.2 }} />
          <TextField
            placeholder="Search shed / pen / recipe"
            variant="standard"
            fullWidth
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setPage(1);
            }}
            InputProps={{ disableUnderline: true }}
          />
        </Paper>
      </Box>

      {/* ───────── table ───────── */}
      {loading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: { xs: '40px', md: '300px' },
            width: '100%',
          }}
        >
          <CircularProgress size={isMobile ? 30 : 50} sx={{ color: '#0F7C8F' }} />
        </Box>
      ) : !fetchedOnce ? (
        <Typography align="center" sx={{ mt: 6, fontWeight: 600 }}>
          Choose filters and press “Get” to load the report.
        </Typography>
      ) : filtered.length === 0 ? (
        <Typography align="center" sx={{ mt: 6, fontWeight: 600 }}>
          No&nbsp;Result&nbsp;Found&nbsp;!
        </Typography>
      ) : (
        <Paper elevation={1} sx={{ borderRadius: 2 }}>
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow
                  sx={{
                    '& th': {
                      fontWeight: 600,
                      backgroundColor:
                        theme.palette.mode === 'dark'
                          ? colors.primary[400]
                          : '#F8F9FA',
                    },
                  }}
                >
                  <TableCell>#Sr</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Meal</TableCell>
                  <TableCell>Shed</TableCell>
                  <TableCell>Pen</TableCell>
                  <TableCell>Recipe</TableCell>
                  <TableCell>Animals</TableCell>
                  <TableCell>Scheduled&nbsp;(Kg)</TableCell>
                  <TableCell>Cost</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell width={190}>Actual&nbsp;(Kg)</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paged.map((row, idx) => {
                  const chip = statusColors[row.feeding_status] || {
                    bg: '#EEEEEE',
                    fg: '#424242',
                  };
                  return (
                    <TableRow hover key={row.uuid}>
                      <TableCell>{(page - 1) * rowsPerPage + idx + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.feeding_date}
                      </TableCell>
                      <TableCell>{row.meal_time}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.shed?.name || '-'}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.pen?.name || '-'}
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {row.recipe?.name || '-'}
                      </TableCell>
                      <TableCell>{fmt(row.animals_count)}</TableCell>
                      <TableCell>{fmt(row.scheduled_quantity)}</TableCell>
                      <TableCell>{fmt(row.estimatedCost)}</TableCell>
                      <TableCell>
                        <Chip
                          label={row.feeding_status.replace(/_/g, ' ')}
                          size="small"
                          sx={{
                            fontWeight: 600,
                            backgroundColor: chip.bg,
                            color: chip.fg,
                            borderRadius: '12px',
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <TextField
                            size="small"
                            type="number"
                            inputProps={{ min: 0, step: 0.1 }}
                            value={actuals[row.uuid] ?? ''}
                            onChange={e =>
                              setActuals(prev => ({
                                ...prev,
                                [row.uuid]: e.target.value,
                              }))
                            }
                            sx={{ width: 100 }}
                          />
                          <IconButton
                            size="small"
                            color="primary"
                            disabled={savingId === row.uuid}
                            onClick={() => handleRecordActual(row)}
                          >
                            {savingId === row.uuid ? (
                              <CircularProgress size={18} />
                            ) : (
                              <SaveIcon fontSize="small" />
                            )}
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}

                {/* ───────── summary row ───────── */}
                {summary && (
                  <TableRow sx={{ '& td': { fontWeight: 700 }, bgcolor: '#F9F9F9' }}>
                    <TableCell colSpan={6}>TOTAL:</TableCell>
                    <TableCell>{fmt(summary.totalAnimals)}</TableCell>
                    <TableCell>{fmt(summary.totalPlannedQuantity)}</TableCell>
                    <TableCell>{fmt(summary.totalCost)}</TableCell>
                    <TableCell />
                    <TableCell>{fmt(summary.totalActualQuantity)}</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box display="flex" justifyContent="flex-end" p={1}>
            <CustomPagination
              totalItems={filtered.length}
              itemsPerPage={rowsPerPage}
              currentPage={page}
              onPageChange={(_, p) => setPage(p)}
            />
          </Box>
        </Paper>
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

export default ShedFeedReport;
