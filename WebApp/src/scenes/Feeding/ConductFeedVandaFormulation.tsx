/* src/pages/reports/ConductFeedVandaFormulation.tsx */
import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle as CheckIcon } from '@mui/icons-material';
import PageContainer from '../../shared/components/Layout/PageContainer';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import {
  FeedFormulation,
  FeedFormulationsListData,
  FeedIngredient,
  FeedIngredientsListData,
  PenWithAnimals,
  PensWithAnimalsListData,
  createFeedUsage,
  getFeedFormulations,
  getFeedIngredients,
  getPensWithAnimals,
} from '../../shared/services/feedModule.services';

const todayStr = () => new Date().toISOString().split('T')[0];

/* =================================================================== */
const ConductFeedVandaFormulation: React.FC = () => {
  const { t } = useTranslation();
  /* ───── data ───── */
  const [formulations, setFormulations] = useState<FeedFormulation[]>([]);
  const [ingredientNames, setIngredientNames] = useState<Map<string, string>>(
    new Map()
  );
  const [pens, setPens] = useState<PenWithAnimals[]>([]);
  const [loading, setLoading] = useState(false);

  /* ───── top form ───── */
  const [formulationId, setFormulationId] = useState('');
  const [date, setDate] = useState(todayStr());
  const [qty, setQty] = useState(1);
  const [penId, setPenId] = useState('');
  const [remarks, setRemarks] = useState('');
  const [saving, setSaving] = useState(false);

  /* ───── success dialog ───── */
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  /* load formulations + ingredient names + pens */
  useEffect(() => {
    const loadAll = async () => {
      try {
        setLoading(true);
        const [formulationRes, ingredientRes, penRes] = await Promise.all([
          getFeedFormulations({ limit: 200, page: 1 }),
          getFeedIngredients({ limit: 500, page: 1 }),
          getPensWithAnimals({ limit: 500, page: 1 }),
        ]);
        const formulationData: FeedFormulationsListData =
          formulationRes?.data?.data;
        const ingredientData: FeedIngredientsListData =
          ingredientRes?.data?.data;
        const penData: PensWithAnimalsListData = penRes?.data?.data;

        setFormulations(formulationData?.formulations || []);
        setIngredientNames(
          new Map(
            (ingredientData?.ingredients || []).map((ing: FeedIngredient) => [
              ing.uuid,
              ing.name,
            ])
          )
        );
        setPens(penData?.pens || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('feeding.common.cantLoadFormulations'));
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const selectedFormulation = useMemo(
    () => formulations.find(f => f.uuid === formulationId) || null,
    [formulations, formulationId]
  );

  /* projected ingredient consumption = item quantity × batch quantity */
  const ingredients = useMemo(
    () =>
      (selectedFormulation?.items || []).map((item, idx) => ({
        id: idx + 1,
        name: ingredientNames.get(item.itemId) || t('feeding.common.unknownIngredient'),
        perUnit: Number(item.quantity || 0),
        total: Number(item.quantity || 0) * Number(qty || 0),
      })),
    [selectedFormulation, ingredientNames, qty]
  );

  const handleReset = () => {
    setFormulationId('');
    setDate(todayStr());
    setQty(1);
    setPenId('');
    setRemarks('');
  };

  const handleSave = async () => {
    if (!formulationId) {
      toast.warning(t('feeding.conductFeedVandaFormulation.chooseFormulationWarning'));
      return;
    }
    if (!(Number(qty) > 0)) {
      toast.warning(t('feeding.conductFeedVandaFormulation.qtyWarning'));
      return;
    }
    try {
      setSaving(true);
      await createFeedUsage({
        formulationId,
        quantity: Number(qty),
        date: date || undefined,
        penId: penId || undefined,
        remarks: remarks.trim() || undefined,
      });
      setSuccessMsg(t('feeding.conductFeedVandaFormulation.conductedSuccess'));
      handleReset();
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || t('feeding.conductFeedVandaFormulation.cantConduct')
      );
    } finally {
      setSaving(false);
    }
  };

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <PageContainer title={t('feeding.conductFeedVandaFormulation.title')} maxWidth="1200px">
      {/* =============== 1. TOP CARD =============== */}
      <Paper elevation={1} sx={{
        p:3, borderRadius:2, mb:4, display:'flex', flexWrap:'wrap', gap:3,
           boxShadow: "0 4px 12px rgba(0,0,0,0.1)",


      }}>
        {/* formulation */}
        <Box sx={{ minWidth: 260 }}>
          <Typography fontWeight={600} mb={0.5}>{t('feeding.conductFeedVandaFormulation.chooseVanda')}</Typography>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={formulationId}
            onChange={e => setFormulationId(e.target.value)}
          >
            <MenuItem value="">
              <em>{t('feeding.conductFeedVandaFormulation.selectFormulation')}</em>
            </MenuItem>
            {formulations.map(f => (
              <MenuItem key={f.uuid} value={f.uuid}>
                {f.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* date */}
        <Box sx={{ minWidth: 200 }}>
          <Typography fontWeight={600} mb={0.5}>{t('feeding.common.date')}</Typography>
          <TextField
            fullWidth
            size="small"
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </Box>

        {/* quantity (batch multiplier) */}
        <Box sx={{ minWidth: 180 }}>
          <Typography fontWeight={600} mb={0.5}>{t('feeding.conductFeedVandaFormulation.quantityBatches')}</Typography>
          <TextField
            fullWidth
            size="small"
            type="number"
            inputProps={{ min: 0, step: 0.1 }}
            value={qty}
            onChange={e => setQty(Number(e.target.value))}
          />
        </Box>

        {/* optional pen */}
        <Box sx={{ minWidth: 220 }}>
          <Typography fontWeight={600} mb={0.5}>{t('feeding.conductFeedVandaFormulation.penOptional')}</Typography>
          <Select
            fullWidth
            size="small"
            displayEmpty
            value={penId}
            onChange={e => setPenId(e.target.value)}
          >
            <MenuItem value="">
              <em>{t('feeding.conductFeedVandaFormulation.none')}</em>
            </MenuItem>
            {pens.map(p => (
              <MenuItem key={p.uuid} value={p.uuid}>
                {p.name}
              </MenuItem>
            ))}
          </Select>
        </Box>

        {/* remarks */}
        <Box sx={{ minWidth: 260, flexGrow: 1 }}>
          <Typography fontWeight={600} mb={0.5}>{t('feeding.conductFeedVandaFormulation.remarksOptional')}</Typography>
          <TextField
            fullWidth
            size="small"
            value={remarks}
            onChange={e => setRemarks(e.target.value)}
          />
        </Box>

        {/* Save & Reset */}
        <Box sx={{ mt:{xs:2,md:4}, display:'flex', gap:2 }}>
          <Button
            variant="contained"
            size="small"
            disabled={saving}
            onClick={handleSave}
            sx={{bgcolor:'#0F677C',px:3,textTransform:'none',padding:"7px 25px"}}
          >
            {saving ? (
              <CircularProgress size={20} sx={{ color: '#fff' }} />
            ) : (
              t('feeding.common.saveChanges')
            )}
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleReset}
            disabled={saving}
            sx={{bgcolor:'#d4d4d4',px:5,textTransform:'none'}}
          >
            {t('feeding.common.reset')}
          </Button>
        </Box>
      </Paper>

      {/* =============== 2. INGREDIENTS TABLE =============== */}
      <Paper elevation={1} sx={{ borderRadius:2,     boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  '& td, & th': { fontSize: '0.95rem', py: 1.25 }  ,
 }}>
        <TableContainer sx={{ maxHeight:520 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{'& th':{fontWeight:600,bgcolor: "#F8F9FA"}}}>
                <TableCell>{t('feeding.common.srNo')}</TableCell><TableCell>{t('feeding.common.ingredients')}</TableCell>
                <TableCell>{t('feeding.conductFeedVandaFormulation.qtyPerBatch')}</TableCell>
                <TableCell>{t('feeding.conductFeedVandaFormulation.totalQty')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} sx={{ color: '#0F7C8F' }} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && ingredients.map((row)=>(
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.name}</TableCell>
                  <TableCell>{row.perUnit}</TableCell>
                  <TableCell>{row.total.toLocaleString(undefined, { maximumFractionDigits: 2 })}</TableCell>
                </TableRow>
              ))}
              {!loading && ingredients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    {formulationId
                      ? t('feeding.conductFeedVandaFormulation.noIngredientsFound')
                      : t('feeding.conductFeedVandaFormulation.chooseToSeeIngredients')}
                  </TableCell>
                </TableRow>
              )}
              {!loading && ingredients.length > 0 && (
                <TableRow>
                  <TableCell colSpan={3} sx={{fontWeight:700}}>{t('feeding.common.totalColon')}</TableCell>
                  <TableCell sx={{fontWeight:700}}>
                    {ingredients
                      .reduce((s,r)=>s+r.total,0)
                      .toLocaleString(undefined, { maximumFractionDigits: 2 })}{t('feeding.common.kgUpper')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      {/* =====================================================
                     GENERIC SUCCESS  MODAL
      ===================================================== */}
      <Dialog open={!!successMsg} onClose={()=>setSuccessMsg(null)} maxWidth="xs" fullWidth>
        <DialogContent sx={{
          display:'flex',flexDirection:'column',alignItems:'center',py:6,gap:3,
        }}>
          <CheckIcon sx={{fontSize:72,color:'#18B66F'}}/>
          <Typography fontWeight={700}>{successMsg}</Typography>
          <Button variant="contained" sx={{bgcolor:'#005f73',px:6}}
                  onClick={()=>setSuccessMsg(null)}>{t('common.close')}</Button>
        </DialogContent>
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

export default ConductFeedVandaFormulation;
