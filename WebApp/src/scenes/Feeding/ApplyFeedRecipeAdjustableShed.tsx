/* src/pages/reports/ApplyFeedRecipeAdjustableShed.tsx */

import React, { useEffect, useMemo, useState } from 'react';
import {
  Search        as SearchIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import CheckCircle from '@mui/icons-material/CheckCircle';
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
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
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
import PageContainer from '../../shared/components/Layout/PageContainer';
import {
  MEAL_TIMES,
  AdjustableFeedingApplicationResult,
  PenWithAnimals,
  PensWithAnimalsListData,
  Recipe,
  RecipesListData,
  Shed,
  ShedsListData,
  applyFeedRecipeAdjustableShed,
  getPensWithAnimals,
  getRecipes,
  getSheds,
} from '../../shared/services/feedModule.services';

const ROWS_PER_PAGE = 16;

/* quick formatter so 30.5 shows as 30.5, 78 as 78 */
const fmt = (n: number) =>
  Number.isInteger(n) ? n : n.toLocaleString(undefined, { maximumFractionDigits: 1 });

const todayStr = () => new Date().toISOString().split('T')[0];

/* =============================================================== */
const ApplyFeedRecipeAdjustableShed: React.FC = () => {
  /* filters */
  const [query, setQuery] = useState('');
  const [date, setDate] = useState(todayStr());
  const [page, setPage] = useState(1);

  /* data */
  const [sheds, setSheds] = useState<Shed[]>([]);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [pens, setPens] = useState<PenWithAnimals[]>([]);
  const [loading, setLoading] = useState(false);

  /* apply dialog state */
  const [applyShed, setApplyShed] = useState<Shed | null>(null);
  const [selectedRecipe, setSelectedRecipe] = useState('');
  const [mealTime, setMealTime] = useState('morning');
  const [notes, setNotes] = useState('');
  /* per-pen adjustable quantities / animal counts */
  const [penQty, setPenQty] = useState<Record<string, string>>({});
  const [penCount, setPenCount] = useState<Record<string, string>>({});
  const [applying, setApplying] = useState(false);

  /* result modal */
  const [result, setResult] =
    useState<AdjustableFeedingApplicationResult | null>(null);

  /* ───── data loading ───── */
  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      try {
        const [shedRes, recipeRes, penRes] = await Promise.all([
          getSheds({ limit: 200, page: 1 }),
          getRecipes({ limit: 500, page: 1 }),
          getPensWithAnimals({ limit: 500, page: 1 }),
        ]);
        const shedData: ShedsListData = shedRes?.data?.data;
        const recipeData: RecipesListData = recipeRes?.data?.data;
        const penData: PensWithAnimalsListData = penRes?.data?.data;
        setSheds(shedData?.sheds || []);
        setRecipes(recipeData?.recipes || []);
        setPens(penData?.pens || []);
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Can't load feeding data");
      } finally {
        setLoading(false);
      }
    };
    loadAll();
  }, []);

  const shedAnimalCount = useMemo(() => {
    const counts = new Map<string, number>();
    pens.forEach(p => {
      if (p.shedId) {
        counts.set(p.shedId, (counts.get(p.shedId) || 0) + (p.animalCount || 0));
      }
    });
    return counts;
  }, [pens]);

  const filtered = useMemo(
    () => sheds.filter(s => s.name.toLowerCase().includes(query.toLowerCase())),
    [sheds, query]
  );
  const paged = useMemo(
    () => filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE),
    [filtered, page]
  );

  /* pens of the shed selected for applying */
  const applyPens = useMemo(
    () => (applyShed ? pens.filter(p => p.shedId === applyShed.uuid) : []),
    [applyShed, pens]
  );

  const openApply = (shed: Shed) => {
    const shedPens = pens.filter(p => p.shedId === shed.uuid);
    setSelectedRecipe('');
    setMealTime('morning');
    setNotes('');
    setPenQty(
      Object.fromEntries(
        shedPens.map(p => [p.uuid, String((p.animalCount || 0) * 5 || '')])
      )
    );
    setPenCount(
      Object.fromEntries(shedPens.map(p => [p.uuid, String(p.animalCount || 0)]))
    );
    setApplyShed(shed);
  };

  /* handlers */
  const handleApply = async () => {
    if (!applyShed) return;
    if (!selectedRecipe) {
      toast.warning('Please select a recipe');
      return;
    }
    if (!date) {
      toast.warning('Please select a feeding date');
      return;
    }
    const adjustments = applyPens
      .filter(p => Number(penQty[p.uuid]) > 0)
      .map(p => ({
        penId: p.uuid,
        custom_quantity: Number(penQty[p.uuid]),
        ...(Number(penCount[p.uuid]) > 0
          ? { custom_animal_count: Number(penCount[p.uuid]) }
          : {}),
      }));
    if (adjustments.length === 0) {
      toast.warning('Please enter a feed quantity greater than 0 for at least one pen');
      return;
    }

    try {
      setApplying(true);
      const res = await applyFeedRecipeAdjustableShed({
        shedId: applyShed.uuid,
        recipeId: selectedRecipe,
        feeding_date: date,
        meal_time: mealTime,
        pen_adjustments: adjustments,
        notes: notes.trim() || undefined,
      });
      const data: AdjustableFeedingApplicationResult = res?.data?.data;
      setApplyShed(null);
      setResult(data);
      toast.success(`Recipe applied! Total feed: ${data?.totalFeedRequired} Kg`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Can't apply recipe!");
    } finally {
      setApplying(false);
    }
  };

  /* ─────────────────────────── UI ─────────────────────────── */
  return (
    <PageContainer title="Apply Feed Recipe Adjustable (Shed)" maxWidth="1200px">
      {/* search row */}
      <Box sx={{display:'flex',flexDirection:{xs:'column',sm:'row'},gap:2,mb:2,

     }}>
        <TextField
          fullWidth
          placeholder="Search"
          value={query}
          onChange={e=>{setQuery(e.target.value);setPage(1);}}
          sx={{bgcolor:'#ffffff' ,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
'& .MuiInputBase-input::placeholder':{fontSize:'0.875rem',color:'#666'}}}
          InputProps={{startAdornment:(<InputAdornment position="start"><SearchIcon/></InputAdornment>)}}
        />
        <TextField
          label="Feeding Date"
          type="date"
          size="medium"
          value={date}
          onChange={e=>setDate(e.target.value)}
          sx={{minWidth:220,
            bgcolor:'#ffffff' ,
             boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
          }}
          InputProps={{startAdornment:(<InputAdornment position="start"><CalendarIcon fontSize="small"/></InputAdornment>)}}
        />
      </Box>

      {/* table */}
      <Paper elevation={1} sx={{borderRadius:2,  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",}}>
        <TableContainer sx={{maxHeight:520}}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow sx={{'& th':{fontWeight:600,bgcolor:'#f8f9fA'}}}>
                <TableCell>#Sr</TableCell>
                <TableCell>Shed</TableCell>
                <TableCell>Pens</TableCell>
                <TableCell>No&nbsp;of&nbsp;Animals</TableCell>
                <TableCell/>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <CircularProgress size={40} sx={{ color: '#0F7C8F' }} />
                  </TableCell>
                </TableRow>
              )}
              {!loading && paged.map((s,idx)=>(
                <TableRow key={s.uuid}>
                  <TableCell>{(page-1)*ROWS_PER_PAGE+idx+1}</TableCell>
                  <TableCell>{s.name}</TableCell>
                  <TableCell>{s.pens?.length || 0}</TableCell>
                  <TableCell>{fmt(shedAnimalCount.get(s.uuid) || 0)}</TableCell>
                  <TableCell>
                    <Button size="small" variant="contained"
                            sx={{bgcolor:'#5aaa2b',fontSize:11}}
                            onClick={()=>openApply(s)}>
                      Apply Recipe
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && paged.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 3 }}>
                    No sheds found.
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
            onPageChange={(_,p)=>setPage(p)}
          />
        </Box>
      </Paper>

      {/* Apply recipe dialog with per-pen adjustments */}
      <Dialog open={!!applyShed} onClose={()=>setApplyShed(null)} maxWidth="md" fullWidth>
        <DialogTitle sx={{textAlign:'center',fontWeight:700,pt:3}}>
          Apply Adjustable Recipe — {applyShed?.name}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2, mt: 1, mb: 2 }}>
            <TextField
              select
              fullWidth
              label="Recipe"
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
              label="Meal Time"
              value={mealTime}
              onChange={e => setMealTime(e.target.value)}
            >
              {MEAL_TIMES.map(m => (
                <MenuItem key={m} value={m}>
                  {m.charAt(0).toUpperCase() + m.slice(1)}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          <Table size="small">
            <TableHead>
              <TableRow sx={{'& th':{fontWeight:600,bgcolor:'#f4fafd'}}}>
                <TableCell>Pen</TableCell>
                <TableCell>Actual&nbsp;Animals</TableCell>
                <TableCell width={140}>Adjusted&nbsp;Animals</TableCell>
                <TableCell width={140}>Feed&nbsp;Qty&nbsp;(Kg)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {applyPens.map(p => (
                <TableRow key={p.uuid}>
                  <TableCell>{p.name}</TableCell>
                  <TableCell>{p.animalCount}</TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={penCount[p.uuid] ?? ''}
                      onChange={e =>
                        setPenCount(prev => ({ ...prev, [p.uuid]: e.target.value }))
                      }
                      sx={{ width: 110 }}
                    />
                  </TableCell>
                  <TableCell>
                    <TextField
                      size="small"
                      type="number"
                      inputProps={{ min: 0, step: 0.1 }}
                      value={penQty[p.uuid] ?? ''}
                      onChange={e =>
                        setPenQty(prev => ({ ...prev, [p.uuid]: e.target.value }))
                      }
                      sx={{ width: 110 }}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {applyPens.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No pens assigned to this shed yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          <TextField
            fullWidth
            label="Notes (optional)"
            multiline
            rows={2}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions sx={{justifyContent:'center',pb:3,gap:3}}>
          <Button variant="outlined" sx={{bgcolor:'#C4C4C4',px:6}}
                  onClick={()=>setApplyShed(null)} disabled={applying}>Cancel</Button>
          <Button variant="contained" sx={{bgcolor:'#005f73',px:{xs:1.9,md:5}}}
                  onClick={handleApply} disabled={applying || applyPens.length === 0}>
            {applying ? <CircularProgress size={22} sx={{ color: '#fff' }} /> : 'Apply Recipe'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success / result modal */}
      <Dialog open={!!result} onClose={()=>setResult(null)} maxWidth="sm" fullWidth>
        {result && (
          <DialogContent sx={{display:'flex',flexDirection:'column',alignItems:'center',py:4,gap:2}}>
            <CheckCircle sx={{fontSize:60,color:'#18B66F'}}/>
            <Typography fontWeight={700} fontSize={18}>
              Recipe “{result.recipeName}” applied to {result.shedName}!
            </Typography>
            <Box sx={{ width: '100%' }}>
              <Typography variant="body2">
                Feeding date: <b>{result.feeding_date}</b> ({result.meal_time})
              </Typography>
              <Typography variant="body2">
                Total feed required: <b>{result.totalFeedRequired} Kg</b> — Pens
                affected: <b>{result.pensAffected}</b>
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Table size="small">
                <TableHead>
                  <TableRow sx={{'& th':{fontWeight:600,bgcolor:'#f4fafd'}}}>
                    <TableCell>Pen</TableCell>
                    <TableCell>Animals</TableCell>
                    <TableCell>Feed Qty (Kg)</TableCell>
                    <TableCell>Per Animal</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.penAdjustments.map(p => (
                    <TableRow key={p.penId}>
                      <TableCell>{p.penName}</TableCell>
                      <TableCell>{p.adjustedAnimals}</TableCell>
                      <TableCell>{fmt(p.feedQuantity)}</TableCell>
                      <TableCell>{p.quantityPerAnimal}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider sx={{ my: 1.5 }} />
              <Typography fontWeight={600} variant="body2" mb={0.5}>
                Ingredient consumption
              </Typography>
              <Table size="small">
                <TableBody>
                  {result.ingredientConsumption.map((ing, i) => (
                    <TableRow key={i}>
                      <TableCell>{ing.ingredient}</TableCell>
                      <TableCell>
                        {ing.quantityUsed} {ing.unit}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
            <Button variant="contained" sx={{bgcolor:'#005f73',px:6}}
                    onClick={()=>setResult(null)}>Close</Button>
          </DialogContent>
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

export default ApplyFeedRecipeAdjustableShed;
