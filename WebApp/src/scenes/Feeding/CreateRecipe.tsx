/* src/pages/recipes/CreateRecipe.tsx */
import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import {
  ANIMAL_CATEGORIES,
  FeedIngredient,
  RecipeGroup,
  RecipeGroupsListData,
  FeedIngredientsListData,
  createRecipe,
  createRecipeGroup,
  getFeedIngredients,
  getRecipeGroups,
} from '../../shared/services/feedModule.services';

/* ---------- types ---------- */
interface IngredientRow {
  id: number;
  ingredientId: string;
  quantity: number;
}

/* ---------- component ---------- */
const CreateRecipe: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const [recipeName, setRecipeName] = useState('');
  const [groupId, setGroupId] = useState<string>('');
  const [groups, setGroups] = useState<RecipeGroup[]>([]);
  const [ingredientOptions, setIngredientOptions] = useState<FeedIngredient[]>([]);
  const [rows, setRows] = useState<IngredientRow[]>([
    { id: 1, ingredientId: '', quantity: 1 },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  /* ----- data loading ----- */
  const loadGroups = async () => {
    try {
      const res = await getRecipeGroups({ limit: 100, page: 1 });
      const data: RecipeGroupsListData = res?.data?.data;
      setGroups(data?.groups || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Can't load recipe groups");
    }
  };

  const loadIngredients = async () => {
    try {
      const res = await getFeedIngredients({ limit: 200, page: 1 });
      const data: FeedIngredientsListData = res?.data?.data;
      setIngredientOptions(data?.ingredients || []);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Can't load ingredients");
    }
  };

  useEffect(() => {
    const loadAll = async () => {
      setIsFetching(true);
      await Promise.all([loadGroups(), loadIngredients()]);
      setIsFetching(false);
    };
    loadAll();
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
    setRecipeName('');
    setGroupId('');
    setRows([{ id: 1, ingredientId: '', quantity: 1 }]);
  };

  const totalQtyKg = rows.reduce((s, r) => s + Number(r.quantity || 0), 0);

  /* ----- save handler ----- */
  const handleSaveRecipe = async () => {
    if (isLoading) return;

    // basic validation
    if (!recipeName.trim()) {
      toast.warn('Please enter a recipe name');
      return;
    }
    if (!groupId) {
      toast.warn('Please select a recipe group');
      return;
    }
    if (rows.some((r) => !r.ingredientId || !(Number(r.quantity) > 0))) {
      toast.warn('Please fill all ingredient rows');
      return;
    }

    try {
      setIsLoading(true);
      await createRecipe({
        name: recipeName.trim(),
        recipeGroupId: groupId,
        ingredients: rows.map((r) => ({
          stockItemId: r.ingredientId,
          quantity: Number(r.quantity),
        })),
      });

      toast.success('Recipe saved successfully!');
      handleReset();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Failed to save recipe');
    } finally {
      setIsLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <PageContainer title="Make Recipe" maxWidth="1050px">
      {/* global loading overlay */}
      {isFetching && (
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

      {/* Recipe name + Recipe group dropdown */}
       <Paper

              sx={{
                mb: 4,
                p: 0,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                gap: 2,
              }}
            >
      <TextField
        fullWidth
        label="Recipe Name"
        value={recipeName}
        onChange={(e) => setRecipeName(e.target.value)}
        disabled={isLoading}
        sx={{ boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
      />
      <TextField
        fullWidth
        select
        label="Choose Recipe Group"
        value={groupId}
        onChange={(e) => setGroupId(e.target.value)}
        disabled={isLoading}
      sx={{    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",}}
      >
        {groups.map((g) => (
          <MenuItem key={g.uuid} value={g.uuid}>
            {g.name}
          </MenuItem>
        ))}
        <Divider />
        <MenuItem
          onClick={() => setGroupModalOpen(true)}
          sx={{ fontWeight: 'bold', color: 'primary.main' }}
        >
          ➕ Add Recipe Group
        </MenuItem>
      </TextField>
      </Paper>

      {/* Ingredients Card */}

        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={5}

        >
          <Typography variant="h6" fontWeight={600}>
            Select Ingredients
          </Typography>
          <Button
            startIcon={<AddIcon />}
            variant="contained"
            sx={{ bgcolor: '#0F677C' }}
            onClick={handleAddRow}
            disabled={isLoading}
          >
            Add Ingredient
          </Button>
        </Box>

        {/* Header */}
         <Paper sx={{    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",}}  >
           <Box sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA', px: 3, pt: -9,mt:3,pb:2, }}>
        <Grid container spacing={2} sx={{ fontWeight: 600, mb: 1,

 }}>
          <Grid item xs={0}>
            #Sr
          </Grid>
          <Grid item xs={7} sx={{textAlign:'center'}}>
            Ingredients
          </Grid>
          <Grid item xs={3}>
            Quantity (Kg)
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
                    {` — stock: ${ing.currentStock}`}
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
                aria-label="delete"
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
               {isLoading ? (
                    <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> // Show spinner
                  ) : (
                    "Save Receipe"
                   )}
            </Button>

            <Button
              variant="outlined"
              sx={{ ml: {xs:3,md:2} }}
              onClick={handleReset}
              disabled={isLoading}
            >
              Reset
            </Button>
          </Box>

          <Box
            mt={{ xs: 3, md: 0 }}
            sx={{
              px: 4,
              py: 1,
              backgroundColor: '#EEF7F7',
              borderRadius: 2,
              fontWeight: 600,
            }}
          >
            TOTAL:&nbsp;&nbsp;{totalQtyKg || 0} KG
          </Box>
          </Box>
        </Box>
      </Paper>

      {/* Add recipe group dialog */}
      <AddRecipeGroupModal
        open={groupModalOpen}
        onClose={() => setGroupModalOpen(false)}
        onCreated={(createdGroupId) => {
          loadGroups();
          if (createdGroupId) setGroupId(createdGroupId);
        }}
      />

      {/* Toasts */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
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

export default CreateRecipe;

/* ---------- add recipe group dialog ---------- */
interface AddRecipeGroupModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (groupId?: string) => void;
}

const AddRecipeGroupModal: React.FC<AddRecipeGroupModalProps> = ({
  open,
  onClose,
  onCreated,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [animalCategory, setAnimalCategory] = useState('');
  const [saving, setSaving] = useState(false);

  const handleCancel = () => {
    setName('');
    setDescription('');
    setAnimalCategory('');
    onClose();
  };

  const handleAdd = async () => {
    if (!name.trim() || !animalCategory) {
      toast.warning('Group name and animal category are required!');
      return;
    }
    try {
      setSaving(true);
      const res = await createRecipeGroup({
        name: name.trim(),
        description: description.trim() || undefined,
        animal_category: animalCategory,
      });
      toast.success('Recipe group added successfully!');
      onCreated(res?.data?.data?.uuid);
      handleCancel();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Can't add recipe group!");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Add Recipe Group</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 1, mt: 2 }}>
          <TextField
            label="Group Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
          />
          <TextField
            select
            label="Animal Category"
            value={animalCategory}
            onChange={(e) => setAnimalCategory(e.target.value)}
            fullWidth
          >
            {ANIMAL_CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c.replace(/_/g, ' ')}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
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
          Cancel
        </Button>
        <Button
          onClick={handleAdd}
          variant="contained"
          disabled={saving}
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none',
          }}
        >
          {saving ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : 'Add'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
