/* src/pages/recipes/FeedingRecipeList.tsx */
import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
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
  Typography
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ToastContainer, toast } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
import { AlterationRow } from '../../shared/components/View Alteration/ViewAlterations';
import ViewAlterations from '../../shared/components/View Alteration/ViewAlterations';
import PageContainer from '../../shared/components/Layout/PageContainer';
import {
  Recipe,
  RecipesListData,
  getRecipes
} from '../../shared/services/feedModule.services';

interface RecipeGroupView {
  id: string;
  name: string;
  alterations: AlterationRow[]; // full rows for the child table
}

const ViewRecipe: React.FC = () => {
  const { t } = useTranslation();
  /* search + paging for the **group** table */
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  /* data */
  const [groups, setGroups] = useState<RecipeGroupView[]>([]);
  const [loading, setLoading] = useState(false);

  /* dialog state */
  const [openGroup, setOpenGroup] = useState<RecipeGroupView | null>(null);

  /* fetch recipes and group them by recipe group */
  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const res = await getRecipes({ limit: 500, page: 1 });
        const data: RecipesListData = res?.data?.data;
        const recipes: Recipe[] = data?.recipes || [];

        const grouped = new Map<string, RecipeGroupView>();
        recipes.forEach(recipe => {
          const groupId = recipe.recipeGroup?.uuid || 'ungrouped';
          const groupName = recipe.recipeGroup?.name || t('feeding.viewRecipe.ungrouped');
          if (!grouped.has(groupId)) {
            grouped.set(groupId, { id: groupId, name: groupName, alterations: [] });
          }
          const group = grouped.get(groupId)!;
          group.alterations.push({
            id: group.alterations.length + 1,
            name: recipe.name,
            weight: Number(recipe.ingredientsCount || 0),
            createdAt: recipe.createdAt || new Date().toISOString(),
            status: recipe.is_default ? 'active' : 'inactive',
            usedInFeeding: !!recipe.is_default
          });
        });
        setGroups(Array.from(grouped.values()));
      } catch (error: any) {
        toast.error(error?.response?.data?.message || t('feeding.common.cantLoadRecipes'));
      } finally {
        setLoading(false);
      }
    };
    loadRecipes();
  }, []);

  const filteredGroups = useMemo(
    () =>
      groups.filter(g => g.name.toLowerCase().includes(query.toLowerCase())),
    [groups, query]
  );

  const pagedGroups = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredGroups.slice(start, start + rowsPerPage);
  }, [filteredGroups, page]);

  /* handlers */
  const handlePageChange = (_: React.ChangeEvent<unknown>, p: number) =>
    setPage(p);

  const handleOpen = (group: RecipeGroupView) => setOpenGroup(group);
  const handleClose = () => setOpenGroup(null);

  /* render */
  return (
    <PageContainer title={t('feeding.viewRecipe.title')} maxWidth="1100px">
      {/* Search bar */}
      <Paper
        elevation={1}
        sx={{
          mb: 4,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2
        }}
      >
        <TextField
          placeholder={t('common.search')}
          variant="standard"
          fullWidth
          value={query}
          onChange={e => {
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
            sx: { fontSize: 16 }
          }}
        />
        <IconButton sx={{ ml: 1 }}>
          <MoreHorizIcon />
        </IconButton>
      </Paper>

      {/* Group table */}
      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: '#F8F9FA' }}>
                <TableCell width={80} sx={{ fontWeight: 600, fontSize: 16 }}>
                  {t('feeding.viewRecipe.columns.sr')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>
                  {t('feeding.viewRecipe.columns.recipeName')}
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>
                  {t('feeding.viewRecipe.columns.recipeAlteration')}
                </TableCell>
                <TableCell width={180} />
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

              {!loading &&
                pagedGroups.map((g, idx) => (
                  <TableRow key={g.id}>
                    <TableCell sx={{ fontSize: 15 }}>
                      {(page - 1) * rowsPerPage + idx + 1}
                    </TableCell>

                    <TableCell sx={{ fontSize: 15, whiteSpace: 'nowrap' }}>
                      {g.name}
                    </TableCell>

                    <TableCell sx={{ fontSize: 15 }}>
                      {g.alterations.length}
                    </TableCell>

                    <TableCell>
                      <Button
                        variant="contained"
                        size="small"
                        sx={{
                          bgcolor: '#0F677C',
                          '&:hover': { bgcolor: '#0c5465' },
                          textTransform: 'none',
                          fontSize: 14
                        }}
                        onClick={() => handleOpen(g)}
                      >
                        {t('feeding.common.viewAlterations')}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && pagedGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ fontSize: 15 }}>
                    {t('feeding.common.noRecipesFound')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* your custom paginator for the **group** list */}
        <Box sx={{ pb: 2, pr: 2 }}>
          <CustomPagination
            totalItems={filteredGroups.length}
            itemsPerPage={rowsPerPage}
            currentPage={page}
            onPageChange={handlePageChange}
          />
        </Box>
      </Paper>

      {/* ───────────────── dialog with the selected group's rows ─────────────── */}
      <Dialog
        fullWidth
        maxWidth="lg"
        open={Boolean(openGroup)}
        onClose={handleClose}
      >
        <DialogContent sx={{ p: { xs: 2, md: 4 } }}>
          {openGroup && (
            <ViewAlterations
              title={t('feeding.viewRecipe.recipesDialogTitle', { name: openGroup.name })}
              rows={openGroup.alterations}
            />
          )}
        </DialogContent>
      </Dialog>

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

export default ViewRecipe;
