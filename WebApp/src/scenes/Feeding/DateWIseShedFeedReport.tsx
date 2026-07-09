/* src/pages/reports/DateWiseFeedReport.tsx */
import React, { useMemo, useState } from 'react';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  InputAdornment,
  ListItemText,
  Menu,
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
  ArrowDropDown as ArrowIcon,
} from '@mui/icons-material';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
import PageContainer from '../../shared/components/Layout/PageContainer';
import useLayoutShift from '../../shared/components/Hooks/useLayoutShift';

import {
  DateWiseFeedReportData,
  DateWiseGroup,
  getDateWiseFeedReport,
} from '../../shared/services/feedModule.services';

/* ------------------------------------------------------------------ */
type ColKey = 'sr' | 'group' | 'schedules' | 'animals' | 'planned' | 'actual' | 'totalCost';
const ROWS_PER_PAGE = 10;

const fmt = (n: number | string) => {
  const num = Number(n);
  return Number.isNaN(num)
    ? String(n)
    : num.toLocaleString(undefined, { maximumFractionDigits: 2 });
};

/* ================================================================== */
const DateWiseFeedReport: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();

  const colTitles = useMemo<Record<ColKey, string>>(
    () => ({
      sr: t('feeding.dateWiseFeedReport.columns.sr'),
      group: t('feeding.dateWiseFeedReport.columns.group'),
      schedules: t('feeding.dateWiseFeedReport.columns.schedules'),
      animals: t('feeding.common.animals'),
      planned: t('feeding.dateWiseFeedReport.columns.plannedQty'),
      actual: t('feeding.dateWiseFeedReport.columns.actualQty'),
      totalCost: t('feeding.dateWiseFeedReport.columns.totalFeedCost'),
    }),
    [t],
  );

  /* ---------------- filters & fetch ------------------ */
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [groupBy, setGroupBy] = useState<'date' | 'shed' | 'recipe'>('date');
  const [report, setReport] = useState<DateWiseFeedReportData | null>(null);
  const [loading, setLoading] = useState(false);
  const { isMobile } = useLayoutShift();

  const handleGet = async () => {
    if (!from || !to) {
      toast.warning(t('feeding.common.datesRequired'));
      return;
    }
    try {
      setLoading(true);
      setReport(null);
      const res = await getDateWiseFeedReport({
        start_date: from,
        end_date: to,
        groupBy,
      });
      const data: DateWiseFeedReportData = res?.data?.data;
      setReport(data || null);
      setPage(1);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.dateWiseFeedReport.cantLoad'));
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- table helpers ----------------------------- */
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const [colVisible, setColVisible] = useState<Record<ColKey, boolean>>({
    sr: true,
    group: true,
    schedules: true,
    animals: true,
    planned: true,
    actual: true,
    totalCost: true,
  });
  const toggleCol = (k: ColKey) =>
    setColVisible(p => ({ ...p, [k]: !p[k] }));

  const [filterAnchor, setFilterAnchor] =
    useState<null | HTMLElement>(null);

  const groups: DateWiseGroup[] = report?.groups || [];

  const filtered = useMemo(
    () =>
      groups.filter(g =>
        (g.groupName || '').toLowerCase().includes(search.toLowerCase()),
      ),
    [groups, search],
  );
  const paged = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  /* ---------------- modal (group schedule detail) ---------------- */
  const [openRow, setOpenRow] = useState<DateWiseGroup | null>(null);

  /* ============================================================= */
  return (
    <PageContainer title={t('feeding.dateWiseFeedReport.title')} maxWidth="1100px">
      {/* ================= TOP CARD (dates + GET) ================= */}
      <Paper
        elevation={1}
        sx={{
          p: 3,
          borderRadius: 2,
          mb: 3,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 2.5,
          alignItems: 'center',
        }}
      >
        {[
          { label: t('feeding.common.startDate'), val: from, set: setFrom },
          { label: t('feeding.common.endDate'),   val: to,   set: setTo   },
        ].map(({ label, val, set }) => (
          <Box key={label} sx={{ minWidth: 190 }}>
            <Typography variant="body2" fontWeight={600} mb={0.5}>
              {label}
            </Typography>
            <TextField
              fullWidth
              size="small"
              type="date"
              value={val}
              onChange={e => set(e.target.value)}
            />
          </Box>
        ))}

        <Box sx={{ minWidth: 160 }}>
          <Typography variant="body2" fontWeight={600} mb={0.5}>
            {t('feeding.dateWiseFeedReport.groupBy')}
          </Typography>
          <TextField
            select
            fullWidth
            size="small"
            value={groupBy}
            onChange={e =>
              setGroupBy(e.target.value as 'date' | 'shed' | 'recipe')
            }
          >
            <MenuItem value="date">{t('feeding.common.date')}</MenuItem>
            <MenuItem value="shed">{t('feeding.common.shed')}</MenuItem>
            <MenuItem value="recipe">{t('feeding.common.recipe')}</MenuItem>
          </TextField>
        </Box>

        <Button
          variant="contained"
          sx={{
            bgcolor: '#005f73',
            mt: { xs: 2, md: 0 },
            ml: 'auto',
            px: 5,
          }}
          onClick={handleGet}
        >
          {t('feeding.common.get')}
        </Button>
      </Paper>

      {/* ========== SEARCH / FILTER BAR ========== */}
      <Box
        mb={1.5}
        display="flex"
        gap={1.5}
        flexWrap="wrap"
        alignItems="center"

      >
        <TextField
          placeholder={t('common.search')}
          size="small"
          sx={{ flexGrow: 1, maxWidth: 260, backgroundColor: theme.palette.background.paper,
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
 }}
          value={search}
          onChange={e => {
            setSearch(e.target.value);
            setPage(1);
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />

        <Button
          endIcon={<ArrowIcon />}
          onClick={e => setFilterAnchor(e.currentTarget)}
          sx={{ textTransform: 'none', px: 3, backgroundColor: theme.palette.background.paper,
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
        >
          {t('feeding.common.filter')}
        </Button>
      </Box>

      {/* ------------- filter dropdown ------------- */}
      <Menu
        anchorEl={filterAnchor}
        open={Boolean(filterAnchor)}
        onClose={() => setFilterAnchor(null)}
      >
        {(Object.keys(colTitles) as ColKey[]).map(k => (
          <MenuItem key={k} onClick={() => toggleCol(k)}>
            <Checkbox checked={colVisible[k]} />
            <ListItemText primary={colTitles[k]} />
          </MenuItem>
        ))}
      </Menu>

      {/* ========== TABLE / EMPTY / LOADING ========== */}

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
          <CircularProgress
size={isMobile ? 30 : 50}
sx={{
    color: "#0F7C8F",
       }} />
       </Box>
      ) : !report || filtered.length === 0 ? (
        <Typography align="center" sx={{ mt: 6, fontWeight: 600 }}>
          {t('feeding.common.noResultFound')}
        </Typography>
      ) : (
        <>
        <Paper elevation={1} sx={{ borderRadius: 2 ,mb:{xs:1,md:2}}} >
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader size="small">
              <TableHead sx={{  backgroundColor: "#F8F9FA"}}>
                <TableRow
                  sx={{
                    '& th': {
                      fontWeight: 600,
                      backgroundColor: "#F8F9FA",
                      fontSize: '1.05rem',
                    },
                  }}
                >
                  {colVisible.sr        && <TableCell>{colTitles.sr}</TableCell>}
                  {colVisible.group     && <TableCell>{colTitles.group}</TableCell>}
                  {colVisible.schedules && <TableCell>{colTitles.schedules}</TableCell>}
                  {colVisible.animals   && <TableCell>{colTitles.animals}</TableCell>}
                  {colVisible.planned   && <TableCell>{colTitles.planned}</TableCell>}
                  {colVisible.actual    && <TableCell>{colTitles.actual}</TableCell>}
                  {colVisible.totalCost && (
                    <TableCell>{colTitles.totalCost}</TableCell>
                  )}
                  <TableCell align="center">{t('feeding.dateWiseFeedReport.details')}</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {paged.map((g, idx) => (
                  <TableRow key={g.groupKey}>
                    {colVisible.sr && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {(page - 1) * ROWS_PER_PAGE + idx + 1}
                      </TableCell>
                    )}
                    {colVisible.group && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {g.groupName}
                      </TableCell>
                    )}
                    {colVisible.schedules && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {g.summary.schedulesCount}
                      </TableCell>
                    )}
                    {colVisible.animals && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {fmt(g.summary.totalAnimals)}
                      </TableCell>
                    )}
                    {colVisible.planned && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {fmt(g.summary.totalPlannedQuantity)}
                      </TableCell>
                    )}
                    {colVisible.actual && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {fmt(g.summary.totalActualQuantity)}
                      </TableCell>
                    )}
                    {colVisible.totalCost && (
                      <TableCell sx={{ fontSize: '0.98rem' }}>
                        {fmt(g.summary.totalCost)}
                      </TableCell>
                    )}
                    <TableCell align="center">
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setOpenRow(g)}
                        sx={{
                          bgcolor: '#005f73',
                          textTransform: 'none',
                          fontSize: 11,
                          '&:hover': { bgcolor: '#004a5a' },
                        }}
                      >
                        {t('feeding.dateWiseFeedReport.scheduleDetails')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

                {/* total row */}
                <TableRow>
                  <TableCell
                    colSpan={
                      (colVisible.sr ? 1 : 0) + (colVisible.group ? 1 : 0)
                    }
                    sx={{ fontWeight: 700, fontSize: '1.05rem' }}
                  >
                    {t('feeding.common.totalColon')}
                  </TableCell>
                  {colVisible.schedules && (
                    <TableCell sx={{ fontWeight: 700 }}>
                      {fmt(report.summary.totalSchedules)}
                    </TableCell>
                  )}
                  {colVisible.animals && (
                    <TableCell sx={{ fontWeight: 700 }}>
                      {fmt(report.summary.totalAnimals)}
                    </TableCell>
                  )}
                  {colVisible.planned && (
                    <TableCell sx={{ fontWeight: 700 }}>
                      {fmt(report.summary.totalPlannedQuantity)}
                    </TableCell>
                  )}
                  {colVisible.actual && (
                    <TableCell sx={{ fontWeight: 700 }}>
                      {fmt(report.summary.totalActualQuantity)}
                    </TableCell>
                  )}
                  {colVisible.totalCost && (
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        color: '#0F6AAE',
                        fontSize: '0.98rem',
                      }}
                    >
                      {fmt(report.summary.totalCost)}
                    </TableCell>
                  )}
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>

          {/* pagination */}
          <Box display="flex" justifyContent="flex-end" p={2}>
            <CustomPagination
              totalItems={filtered.length}
              itemsPerPage={ROWS_PER_PAGE}
              currentPage={page}
              onPageChange={(_, p) => setPage(p)}
            />
          </Box>
        </Paper>

        {/* ========== TOP INGREDIENTS ========== */}
        {report.summary.topIngredients.length > 0 && (
          <Paper elevation={1} sx={{ borderRadius: 2, p: 2, mb: { xs: 1, md: 2 } }}>
            <Typography fontWeight={700} mb={1}>
              {t('feeding.dateWiseFeedReport.topIngredientsUsed', {
                startDate: report.summary.dateRange.start_date,
                endDate: report.summary.dateRange.end_date,
              })}
            </Typography>
            <Grid container spacing={1}>
              {report.summary.topIngredients.map(ing => (
                <Grid item xs={12} sm={6} md={4} key={ing.name}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 1.2,
                      display: 'flex',
                      justifyContent: 'space-between',
                      borderRadius: 2,
                    }}
                  >
                    <Typography variant="body2">{ing.name}</Typography>
                    <Typography variant="body2" fontWeight={700}>
                      {fmt(ing.totalQuantity)} {t('feeding.common.kg')}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        )}
        </>
      )}

      {/* ========== GROUP SCHEDULE DETAILS MODAL ========== */}
      <Dialog
        open={!!openRow}
        onClose={() => setOpenRow(null)}
        maxWidth="md"
        fullWidth
      >
        {openRow && (
          <>
            <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pb: 1 }}>
              {t('feeding.dateWiseFeedReport.groupSchedules', { name: openRow.groupName })}
            </DialogTitle>

            <DialogContent sx={{ pt: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{ '& th': { fontWeight: 600,   backgroundColor: "#F8F9FA" } }}
                  >
                    <TableCell>{t('feeding.common.srNo')}</TableCell>
                    <TableCell>{t('feeding.common.date')}</TableCell>
                    <TableCell>{t('feeding.dateWiseFeedReport.meal')}</TableCell>
                    <TableCell>{t('feeding.common.shed')}</TableCell>
                    <TableCell>{t('feeding.common.pen')}</TableCell>
                    <TableCell>{t('feeding.common.recipe')}</TableCell>
                    <TableCell>{t('feeding.common.animals')}</TableCell>
                    <TableCell>{t('feeding.dateWiseFeedReport.planned')}</TableCell>
                    <TableCell>{t('feeding.dateWiseFeedReport.actual')}</TableCell>
                    <TableCell>{t('feeding.common.status')}</TableCell>
                    <TableCell>{t('feeding.dateWiseFeedReport.cost')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {openRow.schedules.map((s, idx) => (
                    <TableRow key={s.uuid}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {s.feeding_date}
                      </TableCell>
                      <TableCell>{t(`feeding.common.mealTimes.${s.meal_time}`, s.meal_time)}</TableCell>
                      <TableCell>{s.shed?.name || '-'}</TableCell>
                      <TableCell>{s.pen?.name || '-'}</TableCell>
                      <TableCell>{s.recipe?.name || '-'}</TableCell>
                      <TableCell>{fmt(s.animals_count)}</TableCell>
                      <TableCell>{fmt(s.scheduled_quantity)}</TableCell>
                      <TableCell>{fmt(s.actual_quantity)}</TableCell>
                      <TableCell>{t(`feeding.common.feedingStatuses.${s.feeding_status}`, s.feeding_status.replace(/_/g, ' '))}</TableCell>
                      <TableCell>{fmt(s.estimatedCost)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </DialogContent>

            <DialogActions sx={{ justifyContent: 'center', pb: 3 }}>
              <Button
                variant="contained"
                onClick={() => setOpenRow(null)}
                sx={{ bgcolor: '#005f73', width: 110 }}
              >
                {t('common.close')}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

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

export default DateWiseFeedReport;
