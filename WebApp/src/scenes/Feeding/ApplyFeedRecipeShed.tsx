/* src/pages/reports/ApplyFeedRecipeShed.tsx */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  CheckCircle as CheckIcon,
  Add as AddIcon,
  EditNoteOutlined as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  IconButton,
  InputAdornment,
  ListItemText,
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
  useTheme
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import {
  MEAL_TIMES,
  SHED_TYPES,
  FeedingApplicationResult,
  PenWithAnimals,
  PensWithAnimalsListData,
  Recipe,
  RecipesListData,
  Shed,
  ShedsListData,
  applyFeedRecipeShed,
  assignPensToShed,
  createShed,
  getPensWithAnimals,
  getRecipes,
  getSheds
} from '../../shared/services/feedModule.services';

/* ───── helpers ───── */
const ROWS_PER_PAGE = 12;
const fmt = (n: number) =>
  Number.isInteger(n)
    ? n
    : n.toLocaleString(undefined, { maximumFractionDigits: 1 });

const todayStr = () => new Date().toISOString().split('T')[0];

/* ================================================================ */
const ApplyFeedRecipeShed: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  /* top filters */
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(todayStr());
  const [page, setPage] = useState(1);

  /* data */
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pens, setPens] = useState<PenWithAnimals[]>([]);
  const [loading, setLoading] = useState(false);

  /* apply modal state */
  const [applyShed, setApplyShed] = useState<Shed | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [mealTime, setMealTime] = useState('morning');
  const [qtyPerAnimal, setQtyPerAnimal] = useState('5');
  const [notes, setNotes] = useState('');
  const [applying, setApplying] = useState(false);

  /* result panel */
  const [result, setResult] = useState<FeedingApplicationResult | null>(null);

  /* details / animals modal */
  const [detailShed, setDetailShed] = useState<Shed | null>(null);

  /* add shed & assign pens dialogs */
  const [addShedOpen, setAddShedOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);

  /* ───── data loading ───── */
  const loadSheds = async () => {
    try {
      const res = await getSheds({ limit: 200, page: 1 });
      const data: ShedsListData = res?.data?.data;
      setSheds(data?.sheds || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.common.cantLoadSheds'));
    }
  };

  const loadRecipes = async () => {
    try {
      const res = await getRecipes({ limit: 500, page: 1 });
      const data: RecipesListData = res?.data?.data;
      setRecipes(data?.recipes || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.common.cantLoadRecipes'));
    }
  };

  const loadPens = async () => {
    try {
      const res = await getPensWithAnimals({ limit: 500, page: 1 });
      const data: PensWithAnimalsListData = res?.data?.data;
      setPens(data?.pens || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.common.cantLoadPens'));
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadSheds(), loadRecipes(), loadPens()]);
      setLoading(false);
    };
    loadAll();
  }, []);

  /* animals per shed (from pens-with-animals) */
  const shedAnimalCount = useMemo(() => {
    const counts = new Map<string, number>();
    pens.forEach(p => {
      if (p.shedId) {
        counts.set(p.shedId, (counts.get(p.shedId) || 0) + (p.animalCount || 0));
      }
    });
    return counts;
  }, [pens]);

  /* filter table rows */
  const filtered = useMemo(
    () => sheds.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [sheds, query]
  );
  const paged = useMemo(
    () => filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filtered, page]
  );

  /* ───── apply recipe ───── */
  const openApply = (shed: Shed) => {
    setSelectedRecipe('');
    setMealTime('morning');
    setQtyPerAnimal('5');
    setNotes('');
    setApplyShed(shed);
  };

  const handleApply = async () => {
    if (!applyShed) return;
    if (!selectedRecipe) {
      toast.warning(t('feeding.common.selectRecipeWarning'));
      return;
    }
    if (!date) {
      toast.warning(t('feeding.common.selectFeedingDateWarning'));
      return;
    }
    if (!(Number(qtyPerAnimal) > 0)) {
      toast.warning(t('feeding.applyFeedRecipeShed.qtyPerAnimalWarning'));
      return;
    }

    try {
      setApplying(true);
      const res = await applyFeedRecipeShed({
        shedId: applyShed.uuid,
        recipeId: selectedRecipe,
        feeding_date: date,
        meal_time: mealTime,
        quantity_per_animal: Number(qtyPerAnimal),
        auto_calculate: true,
        notes: notes.trim() || undefined
      });
      const data: FeedingApplicationResult = res?.data?.data;
      setApplyRowClosed();
      setResult(data);
      toast.success(
        t('feeding.applyFeedRecipeShed.recipeAppliedTotalCost', {
          total: data?.totalFeedRequired,
          cost: data?.totalCost
        })
      );
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.common.cantApplyRecipe'));
    } finally {
      setApplying(false);
    }
  };

  const setApplyRowClosed = () => setApplyShed(null);

  /* pens of the shed shown in the details modal */
  const detailPens = useMemo(
    () => (detailShed ? pens.filter(p => p.shedId === detailShed.uuid) : []),
    [detailShed, pens]
  );

  /* ──────────────────────────────── */
  return (
    <PageContainer title={t('feeding.applyFeedRecipeShed.title')} maxWidth="1200px">
      {/* search + date + actions */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
          mb: 2
        }}
      >
        <TextField
          fullWidth
          placeholder={t('common.search')}
          value={query}
          onChange={e => {
            setQuery(e.target.value);
            setPage(1);
          }}
          sx={{
            bgcolor: theme.palette.background.paper,
             borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",

            '& .MuiInputBase-input::placeholder': {
              fontSize: '0.875rem',
              color: '#666'
            }
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            )
          }}
        />
        <TextField
          label={t('feeding.common.feedingDate')}
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          sx={{ minWidth: 220,
             bgcolor: theme.palette.background.paper,

    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
           }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarIcon fontSize="small" />
              </InputAdornment>
            )
          }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setAddShedOpen(true)}
          sx={{ bgcolor: '#0F677C', whiteSpace: 'nowrap', px: 3, textTransform: 'none' }}
        >
          {t('feeding.common.addShed')}
        </Button>
        <Button
          variant="contained"
          startIcon={<EditIcon />}
          onClick={() => setAssignOpen(true)}
          sx={{ bgcolor: '#005f73', whiteSpace: 'nowrap', px: 3, textTransform: 'none' }}
        >
          {t('feeding.common.assignPens')}
        </Button>
      </Box>

      {/* main shed table */}
      <Paper elevation={1} sx={{ borderRadius: 2 ,    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",}}>
        <TableContainer sx={{ maxHeight: 520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow
                sx={{ '& th': { fontWeight: 600, bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8f9fA',

                 } }}
              >
                <TableCell>{t('feeding.common.srNo')}</TableCell>
                <TableCell>{t('feeding.common.shed')}</TableCell>
                <TableCell>{t('feeding.common.pens')}</TableCell>
                <TableCell>{t('feeding.common.noOfAnimals')}</TableCell>
                <TableCell />
                <TableCell />
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} sx={{ color: '#0F7C8F' }} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && paged.map((s, idx) => (
                <TableRow key={s.uuid}>
                  <TableCell>{(page - 1) * ROWS_PER_PAGE + idx + 1}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.pens?.length || 0}</TableCell>
                  <TableCell>
                    <Typography
                      component="span"
                      sx={{
                        color: '#0F6AAE',
                        textDecoration: 'underline',
                        cursor: 'pointer'
                      }}
                      onClick={() => setDetailShed(s)}
                    >
                      {fmt(shedAnimalCount.get(s.uuid) || 0)}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ bgcolor: '#005f73', fontSize: 11 }}
                      onClick={() => setDetailShed(s)}
                    >
                      {t('feeding.common.viewDetails')}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="contained"
                      size="small"
                      sx={{ bgcolor: '#5aaa2b', fontSize: 11 }}
                      onClick={() => openApply(s)}
                    >
                      {t('feeding.common.applyRecipe')}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                    {t('feeding.applyFeedRecipeShed.noShedsFoundAdd')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <Box display="flex" justifyContent="flex-end" p={1}>
          <CustomPagination
            totalItems={filtered.length}
            itemsPerPage={ROWS_PER_PAGE}
            currentPage={page}
            onPageChange={(_, p) => setPage(p)}
          />
        </Box>
      </Paper>

      {/* ───────── APPLY RECIPE MODAL ───────── */}
      <Dialog
        open={!!applyShed}
        onClose={() => setApplyRowClosed()}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ textAlign: 'center', fontWeight: 700, pt: 3 }}>
          {t('feeding.applyFeedRecipeShed.dialogTitle', { name: applyShed?.name })}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
            <TextField
              select
              fullWidth
              label={t('feeding.common.recipe')}
              value={selectedRecipe}
              onChange={e => setSelectedRecipe(e.target.value)}
            >
              {recipes.map(r => (
                <MenuItem key={r.uuid} value={r.uuid}>
                  {r.name}
                  {r.recipeGroup?.name ? ` (${r.recipeGroup.name})` : ''}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              select
              fullWidth
              label={t('feeding.common.mealTime')}
              value={mealTime}
              onChange={e => setMealTime(e.target.value)}
            >
              {MEAL_TIMES.map(m => (
                <MenuItem key={m} value={m}>
                  {t(`feeding.common.mealTimes.${m}`, m.charAt(0).toUpperCase() + m.slice(1))}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              fullWidth
              type="number"
              label={t('feeding.applyFeedRecipeShed.qtyPerAnimalKg')}
              inputProps={{ min: 0, step: 0.1 }}
              value={qtyPerAnimal}
              onChange={e => setQtyPerAnimal(e.target.value)}
            />
            <TextField
              fullWidth
              label={t('feeding.common.notesOptional')}
              multiline
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
            <Typography variant="body2" color="text.secondary">
              {t('feeding.common.feedingDate')}: <b>{date}</b> — {t('feeding.applyFeedRecipeShed.stockDeductedNote')}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, gap: 3 }}>
          <Button
            variant="outlined"
            sx={{ bgcolor: '#C4C4C4', px: 6 }}
            onClick={() => setApplyRowClosed()}
            disabled={applying}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="contained"
            sx={{ bgcolor: '#005f73', px: 5 }}
            onClick={handleApply}
            disabled={applying}
          >
            {applying ? (
              <CircularProgress size={22} sx={{ color: '#fff' }} />
            ) : (
              t('feeding.common.applyRecipe')
            )}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───────── SHED DETAILS MODAL (pens + animals) ───────── */}
      <Dialog
        open={!!detailShed}
        onClose={() => setDetailShed(null)}
        maxWidth="md"
        fullWidth
      >
        {detailShed && (
          <>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                px: 3,
                pt: 3,
                pb: 1
              }}
            >
              <Typography fontWeight={700} fontSize={18}>
                {t('feeding.applyFeedRecipeShed.pensAndAnimals', { name: detailShed.name })}
              </Typography>
              <IconButton
                onClick={() => setDetailShed(null)}
                sx={{ ml: 'auto' }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <DialogContent sx={{ px: 0, pt: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{ '& th': { fontWeight: 700, bgcolor: '#F4FAFD' } }}
                  >
                    <TableCell sx={{ pl: 4 }}>{t('feeding.common.pen')}</TableCell>
                    <TableCell>{t('feeding.applyFeedRecipeShed.type')}</TableCell>
                    <TableCell>{t('feeding.common.animals')}</TableCell>
                    <TableCell sx={{ pr: 4 }}>{t('feeding.applyFeedRecipeShed.tags')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {detailPens.map(p => (
                    <TableRow key={p.uuid}>
                      <TableCell sx={{ pl: 4 }}>{p.name}</TableCell>
                      <TableCell>{p.pen_type || '-'}</TableCell>
                      <TableCell>{p.animalCount}</TableCell>
                      <TableCell sx={{ pr: 4 }}>
                        {(p.animals || [])
                          .map(a => a.tagName || a.name || '-')
                          .join(', ')}
                        {p.hasMoreAnimals ? ' …' : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                  {detailPens.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                        {t('feeding.applyFeedRecipeShed.noPensAssignedUse')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </DialogContent>
          </>
        )}
      </Dialog>

      {/* ───────── RESULT PANEL / SUCCESS MODAL ───────── */}
      <Dialog
        open={!!result}
        onClose={() => setResult(null)}
        maxWidth="sm"
        fullWidth
      >
        {result && (
          <DialogContent
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              py: 4,
              gap: 2
            }}
          >
            <CheckIcon sx={{ fontSize: 60, color: '#18B66F' }} />
            <Typography fontWeight={700} fontSize={18}>
              {t('feeding.common.recipeAppliedTo', { recipe: result.recipeName, shed: result.shedName })}
            </Typography>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2">
                {t('feeding.common.feedingDate')}: <b>{result.feeding_date}</b> ({t(`feeding.common.mealTimes.${result.meal_time}`, result.meal_time)})
              </Typography>
              <Typography variant="body2">
                {t('feeding.applyFeedRecipeShed.totalAnimals')}: <b>{result.totalAnimals}</b> — {t('feeding.applyFeedRecipeAdjustableShed.pensAffected')}:{' '}
                <b>{result.pensAffected}</b>
              </Typography>
              <Typography variant="body2">
                {t('feeding.common.totalFeedRequired')}: <b>{result.totalFeedRequired} {t('feeding.common.kg')}</b>
              </Typography>
              <Typography variant="body2">
                {t('feeding.applyFeedRecipeShed.totalCost')}: <b>{result.totalCost}</b>
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ '& th': { fontWeight: 600, bgcolor: '#f4fafd' } }}>
                    <TableCell>{t('feeding.common.pen')}</TableCell>
                    <TableCell>{t('feeding.common.animals')}</TableCell>
                    <TableCell>{t('feeding.common.feedQtyKg')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.penSummary.map(p => (
                    <TableRow key={p.penId}>
                      <TableCell>{p.penName}</TableCell>
                      <TableCell>{p.animalCount}</TableCell>
                      <TableCell>{fmt(p.feedQuantity)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Button
              variant="contained"
              sx={{ bgcolor: '#005f73', px: 6 }}
              onClick={() => setResult(null)}
            >
              {t('common.close')}
            </Button>
          </DialogContent>
        )}
      </Dialog>

      {/* ───────── ADD SHED DIALOG ───────── */}
      <AddShedDialog
        open={addShedOpen}
        onClose={() => setAddShedOpen(false)}
        onCreated={() => {
          loadSheds();
        }}
      />

      {/* ───────── ASSIGN PENS DIALOG ───────── */}
      <AssignPensDialog
        open={assignOpen}
        sheds={sheds}
        pens={pens}
        onClose={() => setAssignOpen(false)}
        onAssigned={() => {
          loadSheds();
          loadPens();
        }}
      />

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

export default ApplyFeedRecipeShed;

/* ================================================================
   Add Shed dialog
================================================================ */
interface AddShedDialogProps {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}

export const AddShedDialog: React.FC<AddShedDialogProps> = ({
  open,
  onClose,
  onCreated
}) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [capacity, setCapacity] = useState('');
  const [location, setLocation] = useState('');
  const [shedType, setShedType] = useState('mixed');
  const [saving, setSaving] = useState(false);

  const handleCancel = () => {
    setName('');
    setDescription('');
    setCapacity('');
    setLocation('');
    setShedType('mixed');
    onClose();
  };

  const handleSave = async () => {
    if (!name.trim()) {
      toast.warning(t('feeding.addShedDialog.nameRequired'));
      return;
    }
    try {
      setSaving(true);
      await createShed({
        name: name.trim(),
        description: description.trim() || undefined,
        capacity: capacity ? Number(capacity) : undefined,
        location: location.trim() || undefined,
        shed_type: shedType
      });
      toast.success(t('feeding.addShedDialog.created'));
      onCreated();
      handleCancel();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.addShedDialog.cantCreate'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('feeding.common.addShed')}</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label={t('feeding.addShedDialog.shedName')}
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label={t('feeding.addShedDialog.shedType')}
            value={shedType}
            onChange={e => setShedType(e.target.value)}
            fullWidth
          >
            {SHED_TYPES.map(st => (
              <MenuItem key={st} value={st}>
                {t(`feeding.common.shedTypes.${st}`, st.charAt(0).toUpperCase() + st.slice(1))}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={t('feeding.addShedDialog.capacityOptional')}
            type="number"
            inputProps={{ min: 0 }}
            value={capacity}
            onChange={e => setCapacity(e.target.value)}
            fullWidth
          />
          <TextField
            label={t('feeding.addShedDialog.locationOptional')}
            value={location}
            onChange={e => setLocation(e.target.value)}
            fullWidth
          />
          <TextField
            label={t('feeding.addShedDialog.descriptionOptional')}
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={2}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{ textTransform: 'none', mr: 2 }}
          disabled={saving}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={saving}
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none'
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : t('common.add')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/* ================================================================
   Assign Pens dialog
================================================================ */
interface AssignPensDialogProps {
  open: boolean;
  sheds: Shed[];
  pens: PenWithAnimals[];
  onClose: () => void;
  onAssigned: () => void;
}

export const AssignPensDialog: React.FC<AssignPensDialogProps> = ({
  open,
  sheds,
  pens,
  onClose,
  onAssigned
}) => {
  const { t } = useTranslation();
  const [shedId, setShedId] = useState('');
  const [selectedPens, setSelectedPens] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setShedId('');
      setSelectedPens([]);
    }
  }, [open]);

  const togglePen = (penId: string) =>
    setSelectedPens(prev =>
      prev.includes(penId) ? prev.filter(p => p !== penId) : [...prev, penId]
    );

  const handleAssign = async () => {
    if (!shedId) {
      toast.warning(t('feeding.assignPensDialog.selectShedWarning'));
      return;
    }
    if (selectedPens.length === 0) {
      toast.warning(t('feeding.assignPensDialog.selectPenWarning'));
      return;
    }
    try {
      setSaving(true);
      await assignPensToShed({ shedId, penIds: selectedPens });
      toast.success(t('feeding.assignPensDialog.assigned'));
      onAssigned();
      onClose();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.assignPensDialog.cantAssign'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('feeding.assignPensDialog.title')}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 2 }}>
          <TextField
            select
            fullWidth
            label={t('feeding.common.shed')}
            value={shedId}
            onChange={e => setShedId(e.target.value)}
            sx={{ mb: 2 }}
          >
            {sheds.map(s => (
              <MenuItem key={s.uuid} value={s.uuid}>
                {s.name}
              </MenuItem>
            ))}
          </TextField>

          <Typography fontWeight={600} mb={1}>
            {t('feeding.common.pens')}
          </Typography>
          <Paper variant="outlined" sx={{ maxHeight: 300, overflowY: 'auto' }}>
            {pens.map(p => (
              <MenuItem key={p.uuid} onClick={() => togglePen(p.uuid)} sx={{ py: 0.5 }}>
                <Checkbox checked={selectedPens.includes(p.uuid)} size="small" />
                <ListItemText
                  primary={p.name}
                  secondary={
                    p.shed?.name
                      ? t('feeding.assignPensDialog.penSummaryIn', {
                          count: p.animalCount,
                          shed: p.shed.name
                        })
                      : t('feeding.assignPensDialog.penSummaryUnassigned', {
                          count: p.animalCount
                        })
                  }
                />
              </MenuItem>
            ))}
            {pens.length === 0 && (
              <Typography sx={{ p: 2 }} color="text.secondary">
                {t('feeding.common.noPensFound')}
              </Typography>
            )}
          </Paper>
        </Box>
      </DialogContent>
      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{ textTransform: 'none', mr: 2 }}
          disabled={saving}
        >
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleAssign}
          variant="contained"
          disabled={saving}
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none'
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : t('feeding.assignPensDialog.assign')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
