/* src/pages/recipes/CreateFeedFormulation.tsx */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Grid,
  IconButton,
  MenuItem,
  TextField,
  Typography,
  Paper,
  Divider,
  CircularProgress,
  useTheme,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import AddIcon from '@mui/icons-material/Add';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import {
  FeedIngredient,
  FeedIngredientsListData,
  createFeedFormulation,
  getFeedIngredients,
} from '../../shared/services/feedModule.services';

/* ---------- types ---------- */
interface IngredientRow {
  id: number;
  ingredientId: string;
  quantity: number;
}

/* ---------- component ---------- */
const CreateFeedFormulation: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [name, setName] = useState<string>('');
  const [ingredientOptions, setIngredientOptions] = useState<FeedIngredient[]>([]);
  const [rows, setRows] = useState<IngredientRow[]>([
    { id: 1, ingredientId: '', quantity: 1 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);

  /* ----- load ingredients ----- */
  useEffect(() => {
    const loadIngredients = async () => {
      try {
        setIsFetching(true);
        const res = await getFeedIngredients({ limit: 200, page: 1 });
        const data: FeedIngredientsListData = res?.data?.data;
        setIngredientOptions(data?.ingredients || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('feeding.common.cantLoadIngredients'));
      } finally {
        setIsFetching(false);
      }
    };
    loadIngredients();
  }, []);

  /* ----- helpers ----- */
  const handleAddRow = () =>
    setRows((prev) => [
      ...prev,
      { id: (prev[prev.length - 1]?.id || 0) + 1, ingredientId: '', quantity: 1 },
    ]);

  const handleDeleteRow = (id: number) =>
    setRows((prev) => prev.filter((row) => row.id !== id));

  const updateRow = (
    id: number,
    field: keyof IngredientRow,
    value: string | number,
  ) =>
    setRows((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );

  const handleReset = () => {
    if (isLoading) return;
    setName('');
    setRows([{ id: 1, ingredientId: '', quantity: 1 }]);
  };

  const totalQtyKg = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);

  /* ----- save handler ----- */
  const handleSaveRecipe = async () => {
    if (isLoading) return;

    // basic validation
    if (!name.trim()) {
      toast.warn(t('feeding.createFeedFormulation.nameWarning'));
      return;
    }
    if (rows.some((r) => !r.ingredientId || !(Number(r.quantity) > 0))) {
      toast.warn(t('feeding.common.fillAllIngredientRows'));
      return;
    }

    try {
      setIsLoading(true);
      await createFeedFormulation({
        name: name.trim(),
        items: rows.map((r) => ({
          itemId: r.ingredientId,
          quantity: Number(r.quantity),
        })),
      });

      toast.success(t('feeding.createFeedFormulation.savedSuccess'));
      handleReset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || t('feeding.createFeedFormulation.saveFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <PageContainer title={t('feeding.createFeedFormulation.title')} maxWidth="1050px">
      {/* global loading overlay */}
      {(isLoading || isFetching) && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(255,255,255,0.6)',
            zIndex: 2000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CircularProgress size={70} />
        </Box>
      )}

      {/* Formulation name */}
      <TextField
        fullWidth
        label={t('feeding.createFeedFormulation.nameLabel')}
        value={name}
        onChange={(e) => setName(e.target.value)}
        sx={{ mb: 4, backgroundColor: theme.palette.background.paper,
            borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",

         }}
        disabled={isLoading}
      />

      {/* Ingredients Card */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          sx={{
              mb:{xs:2,md:4},
          }}

        >
          <Typography variant="h6" fontWeight={600}>
            {t('feeding.common.selectIngredients')}
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{ bgcolor: '#0F677C' }}
            onClick={handleAddRow}
            disabled={isLoading}
          >
            {t('feeding.common.addIngredient')}
          </Button>
        </Box>

        {/* Header */}
          <Paper elevation={1}>
            <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : "#F8F9FA", px: 3, pt: -9,mt:3,pb:2
}}>
        <Grid container spacing={2} sx={{ fontWeight: 600, mb: 1, }}>
          <Grid item xs={1}>
            {t('feeding.common.srNo')}
          </Grid>
          <Grid item xs={7}>
            {t('feeding.common.ingredients')}
          </Grid>
          <Grid item xs={3}>
            {t('feeding.common.quantityKg')}
          </Grid>
          <Grid item xs={1} />
        </Grid>
        </Box>
        <Divider />

        {/* Rows */}
          <Box sx={{p:3}}>
        {rows.map((row, idx) => (
          <Grid
            container
            spacing={2}
            alignItems="center"
            key={row.id}

          >
            <Grid item xs={1}>
              {idx + 1}
            </Grid>

            {/* Ingredient dropdown */}
            <Grid item xs={7}>
              <TextField
                fullWidth
                select
                size="small"
                value={row.ingredientId}
                disabled={isLoading}
                onChange={(e) =>
                  updateRow(row.id, 'ingredientId', e.target.value)
                }
              >
                {ingredientOptions.map((ing) => (
                  <MenuItem key={ing.uuid} value={ing.uuid}>
                    {ing.name}
                    {ing.unit_of_measure ? ` (${ing.unit_of_measure})` : ''}
                    {` — ${t('feeding.common.stockLabel', { stock: ing.currentStock })}`}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* Quantity selector */}
            <Grid item xs={3}>
              <TextField
                fullWidth
                type="number"
                size="small"
                inputProps={{ min: 0, step: 0.01 }}
                value={row.quantity}
                disabled={isLoading}
                onChange={(e) =>
                  updateRow(row.id, 'quantity', Number(e.target.value))
                }
              />
            </Grid>

            {/* Delete */}
            <Grid item xs={1}>
              <IconButton
                aria-label={t('common.delete')}
                onClick={() => handleDeleteRow(row.id)}
                disabled={isLoading || rows.length === 1}
              >
                <DeleteOutlineIcon />
              </IconButton>
            </Grid>
          </Grid>
        ))}

        <Divider sx={{ mt: 3, mb: 2 }} />

        {/* Footer */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
        >
          <Box>
            <Button
              variant="contained"
              sx={{
                bgcolor: '#005f73',
                '&:hover': { bgcolor: '#004954' },
              }}
              onClick={handleSaveRecipe}
              disabled={isLoading}
            >
              {isLoading ? t('feeding.common.saving') : t('feeding.createFeedFormulation.saveFormulation')}
            </Button>

            <Button
              variant="outlined"
              sx={{ ml: 2 }}
              onClick={handleReset}
              disabled={isLoading}
            >
              {t('feeding.common.reset')}
            </Button>
          </Box>

          <Box
            mt={{ xs: 2, md: 0 }}
            sx={{
              px: 4,
              py: 1,
              backgroundColor: '#EEF7F7',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            {t('feeding.common.totalColon')}&nbsp;&nbsp;{totalQtyKg || 0} {t('feeding.common.kgUpper')}
          </Box>
        </Box>
        </Box>
      </Paper>

      {/* Toasts */}
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
        theme="colored"
      />
    </PageContainer>

  );
};

export default CreateFeedFormulation;
