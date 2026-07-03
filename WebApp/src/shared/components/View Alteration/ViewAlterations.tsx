// src/components/RecipeAlterationsTable.tsx
import React, { useMemo, useState, useEffect } from 'react';
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
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
import { tokens } from '../../theme/theme.jsx';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CustomPagination from '../Custom Pagination/CustomPagination';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';  
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CircularProgress from '@mui/material/CircularProgress';     // NEW
import { ToastContainer, toast } from 'react-toastify';            // NEW
import 'react-toastify/dist/ReactToastify.css';      
import { useNavigate } from 'react-router-dom';   

/* ─────────────── data types ─────────────── */
export interface AlterationRow {
  id: number;
  name: string;
  weight: number;
  createdAt: string;                // yyyy-mm-dd
  status: 'active' | 'inactive';
  usedInFeeding: boolean;
}

interface Props {
  title: string;
  rows: AlterationRow[];
}

/* Dummy ingredient list for the edit form */
const INGREDIENT_OPTIONS = [
  'DCP (Kg) [25kg] (ڈی سی پی)',
  'Canola Meal (Kg) (کنولا)',
  'Soybean Meal (Kg) (سویا بین)',
];

/* ─────────────── component ─────────────── */
const ViewAlterations: React.FC<Props> = ({ title, rows }) => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const navigate = useNavigate();  
    const [isLoading, setIsLoading] = useState(false);   
  const [tableRows, setTableRows] = useState<AlterationRow[]>(rows);
  useEffect(() => setTableRows(rows), [rows]);

  /* search + paging */
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const ROWS_PER_PAGE = 10;

  const filtered = useMemo(
    () =>
      tableRows.filter((r) =>
        r.name.toLowerCase().includes(query.toLowerCase()),
      ),
    [tableRows, query],
  );
  const paged = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return filtered.slice(start, start + ROWS_PER_PAGE);
  }, [filtered, page]);

  /* ─── Delete flow ─── */
  const [rowToDelete, setRowToDelete] = useState<AlterationRow | null>(null);
  const [showDeleteDone, setShowDeleteDone] = useState(false);
  const [showUpdateDone, setShowUpdateDone] = useState(false);

  const confirmDelete = async () => {            // NEW async
    if (!rowToDelete) return;
    try {
      setIsLoading(true);
      /* TODO: call your DELETE endpoint here */
      await new Promise((res) => setTimeout(res, 800)); // demo delay

      setTableRows((prev) => prev.filter((r) => r.id !== rowToDelete.id));
      toast.success('Recipe deleted successfully!');
      setRowToDelete(null);
      setShowDeleteDone(true);   // keep your success dialog
    } catch (err: any) {
      toast.error('Failed to delete recipe');
    } finally {
      setIsLoading(false);
    }
  };

/* ─── Edit flow ─── */
interface IngredientRow {
  id: number;
  ingredient: string;
  qty: number;
}
  const [editRow, setEditRow] = useState<AlterationRow | null>(null);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);

  /* populate ingredient editor with 1 row by default */
  const openEdit = (row: AlterationRow) => {
    setEditRow(row);
    setIngredients([{ id: 1, ingredient: '', qty: 1 }]);
  };

  const addIngredientRow = () =>
    setIngredients((prev) => [
      ...prev,
      { id: prev.length + 1, ingredient: '', qty: 1 },
    ]);

  const updateIng = (
    id: number,
    field: keyof IngredientRow,
    value: string | number,
  ) =>
    setIngredients((prev) =>
      prev.map((row) =>
        row.id === id ? { ...row, [field]: value } : row,
      ),
    );

  const removeIng = (id: number) =>
    setIngredients((prev) => prev.filter((row) => row.id !== id));

  const totalQty = ingredients.reduce((sum, r) => sum + Number(r.qty || 0), 0);

  const saveEditedRecipe = async () => {
    try {
              setIsLoading(true);
              /* TODO: call your UPDATE endpoint here */
              await new Promise((res) => setTimeout(res, 800)); // demo delay
        
              if (editRow) {
                setTableRows((prev) =>
                  prev.map((r) =>
                    r.id === editRow.id ? { ...r, weight: totalQty } : r,
                  ),
                );
              }
              toast.success('Recipe updated successfully!');
              setEditRow(null);
              setShowUpdateDone(true);
            } catch (err: any) {
              toast.error('Failed to update recipe');
            } finally {
              setIsLoading(false);
            }
  };

  return (
    <Box>
         {isLoading && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(255,255,255,0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
          }}
        >
          <CircularProgress size={70} />
        </Box>
      )}
     <Box display="flex" alignItems="center" mb={3} gap={1}>
      <IconButton
          size="small"
          sx={{ bgcolor: '#EEF3F4', borderRadius: 2 }}
        >
          <ArrowBackIosNewIcon />
        </IconButton>

        <Typography
          variant="h4"
          fontWeight={700}
          sx={{ fontSize: { xs: 26, md: 30 } }}
        >
          {title}
        </Typography>
      </Box>


      {/* Search */}
      <Paper
        elevation={1}
        sx={{
          mb: 4,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
        }}
      >
        <TextField
          placeholder="Search"
          variant="standard"
          fullWidth
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setPage(1);
          }}
          InputProps={{
            disableUnderline: true,
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
            sx: { fontSize: 16 },
          }}
        />
      </Paper>

      {/* Table */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F7FAFC' }}>
                {['Sr#', 'Recipe Name', 'Weight', 'Creation Date', 'Status', 'Edit'].map(
                  (h) => (
                    <TableCell key={h} sx={{ fontWeight: 600, fontSize: 16 }}>
                      {h}
                    </TableCell>
                  ),
                )}
              </TableRow>
            </TableHead>

            <TableBody>
              {paged.map((row, idx) => (
                <TableRow key={row.id}>
                  <TableCell sx={{ fontSize: 15 }}>
                    {(page - 1) * ROWS_PER_PAGE + idx + 1}
                  </TableCell>
                  <TableCell sx={{ fontSize: 15 }}>{row.name}</TableCell>
                  <TableCell sx={{ fontSize: 15 }}>{row.weight}</TableCell>
                  <TableCell sx={{ fontSize: 15 }}>
                    {new Date(row.createdAt).toLocaleDateString('en-GB', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        row.status === 'active' ? 'Active' : 'In-Active'
                      }
                      size="small"
                      sx={{
                        fontWeight: 600,
                        backgroundColor:
                          row.status === 'active'
                            ? '#D8EEB4'
                            : '#FCE9E1',
                        borderRadius: '12px',
                      }}
                    />
                  </TableCell>

                  <TableCell>
                    {row.status === 'active' ? (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => openEdit(row)}
                        >
                          <EditOutlinedIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => setRowToDelete(row)}
                        >
                          <DeleteOutlineIcon />
                        </IconButton>
                      </>
                    ) : (
                      <Chip
                        label="Recipe Used In Feeding"
                        size="small"
                        sx={{
                          backgroundColor: '#FCE9E1',
                          color: '#FF6F6F',
                          fontWeight: 600,
                          borderRadius: '12px',
                        }}
                      />
                    )}
                  </TableCell>
                </TableRow>
              ))}

              {paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ fontSize: 15 }}>
                    No recipes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <CustomPagination
          totalItems={filtered.length}
          itemsPerPage={ROWS_PER_PAGE}
          currentPage={page}
          onPageChange={(_, p) => setPage(p)}
        />
      </Paper>

      {/* ───────── Delete confirmation ───────── */}
      <Dialog
        open={Boolean(rowToDelete)}
        onClose={() => setRowToDelete(null)}
        maxWidth='sm'
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete Recipe
        </DialogTitle>
        <DialogContent sx={{ pt: 5, textAlign: 'center' }}>
          Do you want to delete shed feed recipe?
        </DialogContent>
        <DialogActions sx={{ pb: 3, justifyContent: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => setRowToDelete(null)}
            sx={{ minWidth: 100, bgcolor: '#CECECE' }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={confirmDelete}
            sx={{ minWidth: 120 }}
          >
            Delete Recipe
          </Button>
        </DialogActions>
      </Dialog>

      {/* ───────── Delete success ───────── */}
      <Dialog
        open={showDeleteDone}
        onClose={() => setShowDeleteDone(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogContent
          sx={{
            textAlign: 'center',
            py: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <DeleteRoundedIcon
            sx={{ fontSize: 64, color: '#ff4d4f', mb: 2 }}
          />
          <Typography variant="h6" fontWeight={700} mb="20px" gutterBottom>
            Recipe Deleted!
          </Typography>
          <Button
            variant="contained"
            onClick={() => setShowDeleteDone(false)}
            sx={{
              bgcolor: '#005f73',
              color: '#fff',
              '&:hover': { bgcolor: '#004954' },
              borderRadius: 2,
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>

<Dialog
  open={showUpdateDone}
  onClose={() => setShowUpdateDone(false)}
  maxWidth="xs"
  fullWidth
>
  <DialogContent
    sx={{
      textAlign: 'center',
      py: 4,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}
  >
    <CheckCircleOutlineIcon
      sx={{ fontSize: 64, color: '#12B76A', mb: 2 }}
    />
    <Typography variant="h6" fontWeight={700} mb="20px" gutterBottom>
      Recipe Updated!
    </Typography>
    <Button
      variant="contained"
      onClick={() => setShowUpdateDone(false)}
      sx={{ bgcolor: '#005f73' }}
    >
      Close
    </Button>
  </DialogContent>
</Dialog>

      {/* ───────── Edit recipe ───────── */}
      <Dialog
        open={Boolean(editRow)}
        onClose={() => setEditRow(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 700, textAlign: 'center' }}>
          Edit Recipe
        </DialogTitle>
        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          {/* header row */}
          <Box
            display="flex"
            justifyContent="space-between"
            sx={{ fontWeight: 600, mb: 1 ,bgcolor:"#CECECE" }}
          >
            <Typography>Ingredients</Typography>
            <Typography sx={{marginRight:{xs:"110px",md:"150px"}}}>Quantity</Typography>
          </Box>

          {/* ingredient rows */}
          {ingredients.map((ing) => (
            <Box
              key={ing.id}
              display="flex"
              alignItems="center"
              gap={2}
              sx={{ mb: 1 }}
            >
              <TextField
                select
                fullWidth
                size="small"
                value={ing.ingredient}
                onChange={(e) =>
                  updateIng(ing.id, 'ingredient', e.target.value)
                }
              >
                {INGREDIENT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </TextField>

              <TextField
                type="number"
                size="small"
                value={ing.qty}
                onChange={(e) =>
                  updateIng(ing.id, 'qty', Number(e.target.value))
                }
                sx={{ width:{md:'120'} }}
              />

              <IconButton size="small" onClick={() => removeIng(ing.id)}>
                <DeleteOutlineIcon fontSize="small" />
              </IconButton>
              <Button
            startIcon={<AddIcon />}
            variant="contained"
            onClick={addIngredientRow}
            sx={{backgroundColor:"#005f73" ,
                borderRadius:"5px"
            }}
          >
            Add
          </Button>
            </Box>
          ))}
          {/* total weight */}
          <Paper
            elevation={0}
            sx={{
              backgroundColor: '#EEF7F7',
              px: 3,
              py: 1,
              borderRadius: 2,
              fontWeight: 600,
              display: 'inline-block',
              marginLeft:{xs:0,md:'320px'}
            }}
          >
            TOTAL: {totalQty} Kg
          </Paper>

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


          {/* action buttons */}
          <Box mt={4} display="flex" justifyContent="center" gap={2}>
            <Button variant="outlined" onClick={() => setEditRow(null)}
                sx={{bgcolor:"#CECECE"}}>
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<CheckCircleIcon />}
              onClick={saveEditedRecipe}
              sx={{bgcolor:"#005f73"}}
            >
              Save Recipe
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ViewAlterations;
