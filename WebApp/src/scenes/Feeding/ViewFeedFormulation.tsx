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
  Typography,
  useTheme
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
import { AlterationRow } from '../../shared/components/View Alteration/ViewAlterations';
import ViewAlterations from '../../shared/components/View Alteration/ViewAlterations';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import {
  FeedFormulation,
  FeedFormulationsListData,
  FeedIngredient,
  FeedIngredientsListData,
  getFeedFormulations,
  getFeedIngredients
} from '../../shared/services/feedModule.services';

interface FormulationView {
  id: string;
  name: string;
  alterations: AlterationRow[]; // ingredient rows for the child table
}

const ViewFeedFormulation: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  /* search + paging for the **group** table */
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;

  /* data */
  const [formulations, setFormulations] = useState<FormulationView[]>([]);
  const [loading, setLoading] = useState(false);

  /* dialog state */
  const [openGroup, setOpenGroup] = useState<FormulationView | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [formulationRes, ingredientRes] = await Promise.all([
          getFeedFormulations({ limit: 200, page: 1 }),
          getFeedIngredients({ limit: 500, page: 1 })
        ]);

        const formulationData: FeedFormulationsListData =
          formulationRes?.data?.data;
        const ingredientData: FeedIngredientsListData =
          ingredientRes?.data?.data;

        const ingredientNames = new Map<string, string>(
          (ingredientData?.ingredients || []).map((ing: FeedIngredient) => [
            ing.uuid,
            ing.name
          ])
        );

        const mapped: FormulationView[] = (
          formulationData?.formulations || []
        ).map((f: FeedFormulation) => ({
          id: f.uuid,
          name: f.name,
          alterations: (f.items || []).map((item, idx) => ({
            id: idx + 1,
            name: ingredientNames.get(item.itemId) || 'Unknown ingredient',
            weight: Number(item.quantity || 0),
            createdAt: f.createdAt || new Date().toISOString(),
            status: 'inactive' as const,
            usedInFeeding: true
          }))
        }));

        setFormulations(mapped);
      } catch (error: any) {
        toast.error(
          error?.response?.data?.message || "Can't load feed formulations"
        );
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const filteredGroups = useMemo(
    () =>
      formulations.filter(g =>
        g.name.toLowerCase().includes(query.toLowerCase())
      ),
    [formulations, query]
  );

  const pagedGroups = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    return filteredGroups.slice(start, start + rowsPerPage);
  }, [filteredGroups, page]);

  /* handlers */
  const handlePageChange = (_: React.ChangeEvent<unknown>, p: number) =>
    setPage(p);

  const handleOpen = (group: FormulationView) => setOpenGroup(group);
  const handleClose = () => setOpenGroup(null);

  /* render */
  return (
    <PageContainer title="Feeding Formulation Vanda" maxWidth="1100px">
      {/* Search bar */}
      <Paper
        elevation={1}
        sx={{
          mb: 4,
          p: 1,
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
        }}
      >
        <TextField
          placeholder="Search"
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
      <Paper
        elevation={1}
        sx={{ borderRadius: 2, boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor:
                    theme.palette.mode === 'dark'
                      ? colors.primary[400]
                      : '#F8F9FA'
                }}
              >
                <TableCell width={80} sx={{ fontWeight: 600, fontSize: 16 }}>
                  Sr#
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>
                  Vanda Name
                </TableCell>
                <TableCell sx={{ fontWeight: 600, fontSize: 16 }}>
                  Formulation Alteration
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
                        View Alterations
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && pagedGroups.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ fontSize: 15 }}>
                    No recipes found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* your custom paginator for the **group** list */}
        <Box sx={{ p: 2 }}>
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
              title={`${openGroup.name}`}
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

export default ViewFeedFormulation;
