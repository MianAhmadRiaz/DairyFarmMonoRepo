import React, { useMemo, useRef, useState } from 'react';
import {
  Box, Grid, Paper, Typography, TextField, MenuItem, Button,
  useTheme, Stack, IconButton, InputAdornment, Menu, MenuItem as MenuItemMUI,
  Checkbox, ListItemText, Tooltip
} from '@mui/material';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SearchIcon from '@mui/icons-material/Search';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';

type Num = number | '';
type Company = 'All' | 'Nestle (0A3400)' | 'Engro Pakistan (SU249000)' | 'Engro Pakistan (SU249900)';

interface Row {
  id: number;
  date: string;          // yyyy-mm-dd
  company: string;
  vol: number;
  fat: number;
  lr: number;
  snf: number;
  ts13: number;
  adjVol: number;
  deduct: number;
  baseRate: number;
  amount: number;
}

const COMPANY_OPTIONS: Company[] = [
  'All',
  'Nestle (0A3400)',
  'Engro Pakistan (SU249000)',
  'Engro Pakistan (SU249900)',
];

// ---------- helpers ----------
const fmt = (n: number) => n.toLocaleString();
const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers.map(h => `"${h.replace(/"/g, '""')}"`).join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

const dateLoop = (start: string, end: string): string[] => {
  const s = new Date(start);
  const e = new Date(end);
  const out: string[] = [];
  for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const da = String(d.getDate()).padStart(2, '0');
    out.push(`${y}-${m}-${da}`);
  }
  return out.reverse(); // latest first (like screenshot)
};

const ddmmyy = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${d}-${m}-${y}`;
};

// ---------- component ----------
export default function ViewMilkDispatch() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  // filters
  const [company, setCompany] = useState<Company>('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // controls
  const [rows, setRows] = useState<Row[]>([]);
  const [search, setSearch] = useState('');
  const [anchorCols, setAnchorCols] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  // columns with visibility
  const allColumns = [
    { key: 'id', label: '#', width: 60 },
    { key: 'date', label: t('accounts.common.columns.date'), width: 120 },
    { key: 'company', label: t('accounts.common.company'), width: 280 },
    { key: 'vol', label: t('accounts.viewMilkDispatch.columns.vol'), width: 80 },
    { key: 'fat', label: t('accounts.viewMilkDispatch.columns.fat'), width: 80 },
    { key: 'lr', label: t('accounts.viewMilkDispatch.columns.lr'), width: 80 },
    { key: 'snf', label: t('accounts.viewMilkDispatch.columns.snf'), width: 90 },
    { key: 'ts13', label: t('accounts.viewMilkDispatch.columns.ts13'), width: 90 },
    { key: 'adjVol', label: t('accounts.viewMilkDispatch.columns.adjVol'), width: 110 },
    { key: 'deduct', label: t('accounts.viewMilkDispatch.columns.deduct'), width: 90 },
    { key: 'baseRate', label: t('accounts.common.baseRate'), width: 110 },
    { key: 'amount', label: t('accounts.common.amount'), width: 110 },
    { key: 'action', label: t('accounts.common.action'), width: 100 },
  ] as const;

  type ColKey = typeof allColumns[number]['key'];
  const [visible, setVisible] = useState<Record<ColKey, boolean>>(
    () => allColumns.reduce((o, c) => ({ ...o, [c.key]: true }), {} as Record<ColKey, boolean>)
  );

  // filtered rows
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter(r =>
      (company === 'All' || r.company === company) &&
      (q ? (r.company.toLowerCase().includes(q) || ddmmyy(r.date).includes(q)) : true)
    );
  }, [rows, search, company]);

  // GET handler (simulate fetch)
  const onGet = async () => {
    if (!startDate || !endDate) {
      alert(t('accounts.common.selectDatesError'));
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      alert(t('accounts.viewMilkDispatch.dateOrderError'));
      return;
    }
    setLoading(true);
    // simulate network latency
    await new Promise(r => setTimeout(r, 600));

    const days = dateLoop(startDate, endDate);
    const companies = COMPANY_OPTIONS.filter(c => c !== 'All') as string[];

    const gen: Row[] = [];
    let id = 1;
    for (const dt of days) {
      // 1-3 rows per day
      const count = 1 + Math.floor(Math.random() * 2);
      for (let i = 0; i < count; i++) {
        const comp = companies[Math.floor(Math.random() * companies.length)];
        const vol = Math.floor(80 + Math.random() * 2200);
        const fat = +(3.9 + Math.random() * 0.6).toFixed(2);
        const lr = +(27 + Math.random() * 2).toFixed(2);
        const snf = +(8.45 + Math.random() * 0.4).toFixed(2);
        const ts13 = +(12.7 + Math.random() * 0.3).toFixed(2);
        const adjVol = +(vol * (0.98 + Math.random() * 0.02)).toFixed(2);
        const deduct = +(Math.random() * 30).toFixed(2);
        const baseRate = 0; // as in screenshot
        const amount = 0;   // as in screenshot
        gen.push({
          id: id++,
          date: dt,
          company: comp,
          vol,
          fat,
          lr,
          snf,
          ts13,
          adjVol,
          deduct,
          baseRate,
          amount,
        });
      }
    }
    setRows(gen);
    setLoading(false);
  };

  // toolbar actions
  const handleCopy = async () => {
    const vCols = allColumns.filter(c => visible[c.key] && c.key !== 'action');
    const csv = toCsv(
      vCols.map(c => c.label),
      filtered.map(r => vCols.map(c => {
        const k = c.key as keyof Row;
        return k === 'date' ? ddmmyy(r.date) : (r[k] as any);
      }))
    );
    await navigator.clipboard.writeText(csv);
    alert(t('accounts.common.copiedCsv'));
  };

  const downloadCsv = (filename: string) => {
    const vCols = allColumns.filter(c => visible[c.key] && c.key !== 'action');
    const csv = toCsv(
      vCols.map(c => c.label),
      filtered.map(r => vCols.map(c => {
        const k = c.key as keyof Row;
        return k === 'date' ? ddmmyy(r.date) : (r[k] as any);
      }))
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print
  const onPrint = () => window.print();

  return (
    <PageContainer title={t('accounts.viewMilkDispatch.title')}>
        {/* Search Row */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <TextField
              size="small"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>
                ),
              }}
              sx={{ width: 220, bgcolor: 'background.paper', borderRadius: 1 }}
            />
          </Stack>
        </Stack>

        {/* Filters Card */}
        <Paper elevation={0} sx={{
          p: 2, mb: 2, borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper'
        }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md="auto">
              <TextField
                select size="small" label={t('accounts.common.company')} value={company}
                onChange={(e) => setCompany(e.target.value as Company)}
                sx={{ minWidth: 180 }}
              >
                {COMPANY_OPTIONS.map(c => <MenuItem key={c} value={c}>{c === 'All' ? t('accounts.common.all') : c}</MenuItem>)}
              </TextField>
            </Grid>
            <Grid item xs={12} md="auto">
              <TextField
                size="small" type="date" label={t('accounts.viewMilkDispatch.startingDate')} value={startDate}
                onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md="auto">
              <TextField
                size="small" type="date" label={t('accounts.viewMilkDispatch.endingDate')} value={endDate}
                onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md="auto">
              <Button
                onClick={onGet}
                disabled={loading}
                variant="contained"
                sx={{ backgroundColor: '#005f73', color: '#fff', textTransform: 'none', px: 3 }}
              >
                {loading ? t('common.loading') : t('accounts.viewMilkDispatch.get')}
              </Button>
            </Grid>

            {/* Right controls */}
            <Grid item xs />
            <Grid item xs="auto">
              <Button
                startIcon={<ViewColumnOutlinedIcon />}
                size="small"
                variant="outlined"
                onClick={(e) => setAnchorCols(e.currentTarget)}
                sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', mr: 1, background: '#fff' }}
              >
                {t('accounts.common.columnVisibility')}
              </Button>

              <Button
                startIcon={<ContentCopyOutlinedIcon />}
                size="small"
                variant="outlined"
                onClick={handleCopy}
                sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', mr: 1, background: '#fff' }}
              >
                {t('accounts.common.copy')}
              </Button>

              <Button
                startIcon={<FileDownloadOutlinedIcon />}
                size="small"
                variant="outlined"
                onClick={() => downloadCsv('corporate_dispatch_excel.csv')}
                sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', mr: 1, background: '#fff' }}
              >
                Excel
              </Button>

              <Button
                startIcon={<FileDownloadOutlinedIcon />}
                size="small"
                variant="outlined"
                onClick={() => downloadCsv('corporate_dispatch.csv')}
                sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', mr: 1, background: '#fff' }}
              >
                CSV
              </Button>

              <Button
                startIcon={<PrintOutlinedIcon />}
                size="small"
                variant="outlined"
                onClick={onPrint}
                sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', background: '#fff' }}
              >
                PDF
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {/* Column visibility menu */}
        <Menu anchorEl={anchorCols} open={Boolean(anchorCols)} onClose={() => setAnchorCols(null)}>
          {allColumns.map(c => (
            <MenuItemMUI key={c.key} onClick={() => setVisible(v => ({ ...v, [c.key]: !v[c.key] }))}>
              <Checkbox checked={visible[c.key]} />
              <ListItemText>{c.label}</ListItemText>
            </MenuItemMUI>
          ))}
        </Menu>

        {/* Table Card */}
        <Paper elevation={0} sx={{
          p: 0, borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper'
        }}>
          <Box sx={{ overflow: 'auto' }}>
            <table style={{ borderCollapse: 'separate', width: '100%' }}>
              <thead>
                <tr>
                  {allColumns.map(c => visible[c.key] && (
                    <th key={c.key}
                        style={{
                          position: 'sticky', top: 0, background: '#f8fafc',
                          textAlign: 'left', padding: '10px 12px',
                          borderBottom: `1px solid ${theme.palette.divider}`, minWidth: c.width
                        }}>
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    {visible.id      && <td style={td}>{r.id}</td>}
                    {visible.date    && <td style={td}>{ddmmyy(r.date)}</td>}
                    {visible.company && <td style={td}>{r.company}</td>}
                    {visible.vol     && <td style={td}>{fmt(r.vol)}</td>}
                    {visible.fat     && <td style={td}>{r.fat}</td>}
                    {visible.lr      && <td style={td}>{r.lr}</td>}
                    {visible.snf     && <td style={td}>{r.snf}</td>}
                    {visible.ts13    && <td style={td}>{r.ts13}</td>}
                    {visible.adjVol  && <td style={td}>{fmt(r.adjVol)}</td>}
                    {visible.deduct  && <td style={td}>{r.deduct}</td>}
                    {visible.baseRate&& <td style={td}>{r.baseRate}</td>}
                    {visible.amount  && <td style={td}>{r.amount}</td>}
                    {visible.action  && (
                      <td style={td}>
                        <Tooltip title={t('common.edit')}><IconButton size="small"><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title={t('common.delete')}><IconButton size="small"><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td style={{ ...td, padding: 24 }} colSpan={Object.values(visible).filter(Boolean).length}>
                    {loading ? t('common.loading') : t('accounts.common.noData')}
                  </td></tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
    </PageContainer>
  );
}

// ---------- simple cell style ----------
const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #eceff1',
  whiteSpace: 'nowrap'
};
