/* src/pages/reports/ViewConductedProcess.tsx */
   import React, { useEffect, useMemo, useState } from 'react';
   import {
     ArrowDropDown   as ArrowIcon,
     ContentCopy      as CopyIcon,
     GridOn           as ExcelIcon,
     TableChart       as CsvIcon,
     PictureAsPdf     as PdfIcon,
     Print            as PrintIcon,
     Search           as SearchIcon,
   } from '@mui/icons-material';
   import {
     Box, Button, Checkbox, CircularProgress, InputAdornment, ListItemText, Menu,
     MenuItem, Paper, Select, Table, TableBody, TableCell,
     TableContainer, TableHead, TableRow, TextField, Typography, useTheme,
   } from '@mui/material';
   import { ToastContainer, toast } from 'react-toastify';
   import { useTranslation } from 'react-i18next';
   import 'react-toastify/dist/ReactToastify.css';
   import CustomPagination from '../../shared/components/Custom Pagination/CustomPagination';
  import PageContainer from '../../shared/components/Layout/PageContainer';
  import useLayoutShift from '../../shared/components/Hooks/useLayoutShift';
  import { tokens } from '../../shared/theme/theme';
  import {
    FeedUsageHistoryRow,
    FeedUsageListData,
    getFeedUsage,
  } from '../../shared/services/feedModule.services';

   /* ------------------------------------------------------------------ */
   interface Row {
     id: string;
     date: string;
     vanda: string;
     qty: number;
     pen: string;
     remarks: string;
   }

   /* ------------------------------------------------------------------ */
   type ColKey = 'sr'|'date'|'vanda'|'qty'|'pen'|'remarks';
   const COL_KEYS: ColKey[] = ['sr','date','vanda','qty','pen','remarks'];

   const ExportBtn = (lbl:string, ico:React.ReactNode, arrow=false)=>(
     <Paper component={Button} key={lbl} elevation={3}
       startIcon={ico} endIcon={arrow?<ArrowIcon/>:undefined}
       sx={{px:2.2,py:1,fontWeight:600,borderRadius:2,fontSize:'0.9rem',
            textTransform:'none',boxShadow:2,whiteSpace:'nowrap',
            '&:hover':{bgcolor:'#f4f4f4'}}}>{lbl}</Paper>);

   const ROWS_PER_PAGE = 8;

   /* ================================================================== */
   const ViewConductedProcess:React.FC = () =>{
     const theme = useTheme();
     const colors = tokens(theme.palette.mode);
     const { t } = useTranslation();

     const COLS: Record<ColKey,string> = useMemo(()=>({
       sr: t('feeding.viewConductedVandaFormulation.columns.sr'),
       date: t('feeding.common.date'),
       vanda: t('feeding.viewConductedVandaFormulation.columns.vanda'),
       qty: t('feeding.viewConductedVandaFormulation.columns.qtyBatches'),
       pen: t('feeding.common.pen'),
       remarks: t('feeding.viewConductedVandaFormulation.columns.remarks'),
     }),[t]);

     /* filters */
     const [brand,setBrand]=useState<string>('All');
     const [from,setFrom]=useState(''); const [to,setTo]=useState('');
     /* table state */
     const [rows,setRows]=useState<Row[]>([]);
     const [loading,setLoading]=useState(false);
     const [page,setPage]=useState(1); const [searchQ,setSearchQ]=useState('');
     const { isMobile } = useLayoutShift();

     /* fetch usage history */
     const handleGet=async()=>{
       try {
         setLoading(true);
         setRows([]);
         const res = await getFeedUsage({ limit: 500, page: 1 });
         const data: FeedUsageListData = res?.data?.data;
         const mapped: Row[] = (data?.usageHistory || []).map(
           (u: FeedUsageHistoryRow) => ({
             id: u.uuid,
             date: u.date,
             vanda: u.formulation_name,
             qty: Number(u.quantity || 0),
             pen: u.penId || '-',
             remarks: u.remarks || '-',
           })
         );
         setRows(mapped);
         setPage(1);
       } catch (error: any) {
         toast.error(error?.response?.data?.message || t('feeding.viewConductedVandaFormulation.cantLoadUsageHistory'));
       } finally {
         setLoading(false);
       }
     };

     useEffect(() => { handleGet(); }, []);

     /* column visibility */
     const [filterAnchor,setFilterAnchor]=useState<null|HTMLElement>(null);
     const [visible,setVisible]=useState<Record<ColKey,boolean>>(
       Object.fromEntries(COL_KEYS.map(k=>[k,true])) as Record<ColKey,boolean>);
     const toggleCol=(k:ColKey)=>setVisible(p=>({...p,[k]:!p[k]}));

     /* distinct vanda names for the brand filter */
     const brandOptions = useMemo(
       () => Array.from(new Set(rows.map(r => r.vanda))).sort(),
       [rows]
     );

     /* derived data */
     const filtered=useMemo(()=>rows.filter(r=>{
       if (!r.vanda.toLowerCase().includes(searchQ.toLowerCase())) return false;
       if (brand !== 'All' && r.vanda !== brand) return false;
       if (from && r.date < from) return false;
       if (to && r.date > to) return false;
       return true;
     }),[rows,searchQ,brand,from,to]);
     const paged=useMemo(()=>filtered.slice((page-1)*ROWS_PER_PAGE,page*ROWS_PER_PAGE),[filtered,page]);
     const totalQty=filtered.reduce((s,r)=>s+r.qty,0);

     /* ------------------------------------------------------------ */
     return(
     <PageContainer title={t('feeding.viewConductedVandaFormulation.title')} maxWidth="1200px">
       {/* top card */}
       <Paper elevation={1} sx={{p:3,mb:3,borderRadius:2,display:'flex',flexWrap:'wrap',gap:3,alignItems:'flex-end',
         boxShadow: "0 4px 12px rgba(0,0,0,0.1)",}}>
         <Box sx={{minWidth:220}}>
           <Typography fontWeight={600} mb={.5}>{t('feeding.viewConductedVandaFormulation.chooseVanda')}</Typography>
           <Select size="small" fullWidth value={brand} onChange={e=>setBrand(e.target.value)}>
             <MenuItem value="All">{t('feeding.viewConductedVandaFormulation.all')}</MenuItem>
             {brandOptions.map(b=>(
               <MenuItem key={b} value={b}>{b}</MenuItem>
             ))}
           </Select>
         </Box>
         {([[t('feeding.common.startDate'),from,setFrom],[t('feeding.common.endDate'),to,setTo]] as
           [string,string,React.Dispatch<React.SetStateAction<string>>][]).map(([l,v,s])=>(
           <Box key={l} sx={{minWidth:200}}>
             <Typography fontWeight={600} mb={.5}>{l}</Typography>
             <TextField size="small" fullWidth type="date" value={v} onChange={e=>s(e.target.value)}/>
           </Box>
         ))}
         <Button variant="contained" sx={{bgcolor:'#005f73',ml:{xs:0,md:'auto'},px:5,mt:{xs:2,md:0}}}
           onClick={handleGet}>{t('feeding.common.get')}</Button>
       </Paper>

       {/* search/export */}
       <Box sx={{display:'flex',flexWrap:'wrap',gap:1.5,mb:2,alignItems:'center'}}>
         <TextField size="small" placeholder={t('common.search')} value={searchQ}
           onChange={e=>{setSearchQ(e.target.value);setPage(1);}}
           sx={{flexGrow:1,maxWidth:760, backgroundColor: theme.palette.background.paper,
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}}
           InputProps={{startAdornment:<InputAdornment position="start"><SearchIcon/></InputAdornment>}}/>
         <Button endIcon={<ArrowIcon/>}
           onClick={e=>setFilterAnchor(e.currentTarget)}
           sx={{textTransform:'none',p:1,px:2, backgroundColor: theme.palette.background.paper,
    borderRadius: "4px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}}>{t('feeding.common.filter')}</Button>
         <Box sx={{ml:'auto',display:'flex',gap:2,flexWrap:'wrap'}}>
           {ExportBtn(t('feeding.viewConductedVandaFormulation.export.copy'),<CopyIcon/>)}
           {ExportBtn(t('feeding.viewConductedVandaFormulation.export.excel'),<ExcelIcon/>)}
           {ExportBtn(t('feeding.viewConductedVandaFormulation.export.csv'),<CsvIcon/>)}
           {ExportBtn(t('feeding.viewConductedVandaFormulation.export.pdf'),<PdfIcon/>)}
           {ExportBtn(t('feeding.viewConductedVandaFormulation.export.print'),<PrintIcon/>,true)}
         </Box>
       </Box>

       <Menu anchorEl={filterAnchor} open={!!filterAnchor} onClose={()=>setFilterAnchor(null)}>
         {COL_KEYS.map(k=>(
           <MenuItem key={k} onClick={()=>toggleCol(k)}>
             <Checkbox checked={visible[k]}/><ListItemText primary={COLS[k]}/>
           </MenuItem>
         ))}
       </Menu>

       {/* main table */}
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
       ) : rows.length===0 ? (
         <Typography align="center" sx={{mt:6,fontWeight:600}}>{t('feeding.common.noResultFound')}</Typography>
       ) : (
         <Paper elevation={1} sx={{borderRadius:2}}>
           <TableContainer sx={{maxHeight:520}}>
             <Table stickyHeader size="small">
               <TableHead>
                 <TableRow sx={{'& th':{bgcolor: theme.palette.mode === 'dark' ? colors.primary[400] : "#F8F9FA", fontWeight:600}}}>
                   {visible.sr&&<TableCell>{COLS.sr}</TableCell>}
                   {visible.date&&<TableCell>{COLS.date}</TableCell>}
                   {visible.vanda&&<TableCell>{COLS.vanda}</TableCell>}
                   {visible.qty&&<TableCell>{COLS.qty}</TableCell>}
                   {visible.pen&&<TableCell>{COLS.pen}</TableCell>}
                   {visible.remarks&&<TableCell>{COLS.remarks}</TableCell>}
                 </TableRow>
               </TableHead>
               <TableBody>
                 {paged.map((r,i)=>(
                   <TableRow key={r.id}>
                     {visible.sr&&<TableCell>{(page-1)*ROWS_PER_PAGE+i+1}</TableCell>}
                     {visible.date&&<TableCell>{r.date}</TableCell>}
                     {visible.vanda&&<TableCell>{r.vanda}</TableCell>}
                     {visible.qty&&<TableCell>{r.qty}</TableCell>}
                     {visible.pen&&<TableCell>{r.pen}</TableCell>}
                     {visible.remarks&&<TableCell>{r.remarks}</TableCell>}
                   </TableRow>
                 ))}

                 {/* totals */}
                 <TableRow sx={{'& td':{fontWeight:700}}}>
                   {visible.sr&&<TableCell/>}
                   {visible.date&&<TableCell/>}
                   {visible.vanda&&<TableCell align="right">{t('feeding.viewConductedVandaFormulation.totalUpper')}</TableCell>}
                   {visible.qty&&<TableCell>{totalQty.toLocaleString()}</TableCell>}
                   {visible.pen&&<TableCell/>}
                   {visible.remarks&&<TableCell/>}
                 </TableRow>
               </TableBody>
             </Table>
           </TableContainer>
           <Box display="flex" justifyContent="flex-end" p={2} >
             <CustomPagination totalItems={filtered.length} itemsPerPage={ROWS_PER_PAGE}
               currentPage={page} onPageChange={(_,p)=>setPage(p)}/>
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
     </PageContainer>);
   };

   export default ViewConductedProcess;
