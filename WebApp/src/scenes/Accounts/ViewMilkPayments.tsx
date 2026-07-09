import React, { useMemo, useState } from 'react';
import {
  Box, Paper, Typography, TextField, Button, useTheme, Stack, Menu, MenuItem,
  Checkbox, ListItemText, InputAdornment, IconButton, Tooltip
} from '@mui/material';
import ViewColumnOutlinedIcon from '@mui/icons-material/ViewColumnOutlined';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import SearchIcon from '@mui/icons-material/Search';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';

type Num = number | '';

interface PaymentRow {
  id: number;
  paymentDate: string; // yyyy-mm-dd
  company: string;
  startDate: string;   // yyyy-mm-dd
  endDate: string;     // yyyy-mm-dd
  volume: number;
  adjustedVolume: number;
  baseRate: number;
  grossRate: number;
  incentive: number;
  billTotal: number;
  incomeAccount: string;
  cashBank: string;
}

// ----- helpers -----
const mon = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const pretty = (iso: string) => {
  const [y, m, d] = iso.split('-');
  return `${Number(d)}-${mon[Number(m)-1]}-${y}`;
};
const num = (n: number) => n.toLocaleString();
const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g,'""')}"`).join(','))].join('\n');

// ----- demo data -----
const demoRows: PaymentRow[] = [
  { id: 1,  paymentDate: '2025-04-16', company: 'Nestle (0A3400)',            startDate: '2025-04-07', endDate: '2025-04-13', volume: 717,   adjustedVolume: 694.61, baseRate: 121.99, grossRate: 132.42, incentive: 7245,   billTotal: 91983,   incomeAccount: 'Nestle (0A3400)',            cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 2,  paymentDate: '2025-04-15', company: 'Engro Pakistan (SU249000)',  startDate: '2025-04-07', endDate: '2025-04-13', volume: 19581, adjustedVolume: 18794.36, baseRate: 129.00, grossRate: 146.49, incentive: 328779, billTotal: 2753251, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 3,  paymentDate: '2025-04-15', company: 'Engro Pakistan (SU249000)',  startDate: '2025-04-14', endDate: '2025-04-20', volume: 19990, adjustedVolume: 19420.14, baseRate: 127.50, grossRate: 144.96, incentive: 339047, billTotal: 2815115, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 4,  paymentDate: '2025-04-09', company: 'Nestle (0A3400)',            startDate: '2025-03-31', endDate: '2025-04-06', volume: 514,   adjustedVolume: 500.70,  baseRate: 124.53, grossRate: 136.54, incentive: 6018,   billTotal: 68638,   incomeAccount: 'Nestle (0A3400)',            cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 5,  paymentDate: '2025-04-08', company: 'Engro Pakistan (SU249000)',  startDate: '2025-03-31', endDate: '2025-04-06', volume: 20268, adjustedVolume: 19769.45, baseRate: 129.00, grossRate: 146.28, incentive: 341566, billTotal: 2891825, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 6,  paymentDate: '2025-04-04', company: 'Engro Pakistan (SU249000)',  startDate: '2025-03-24', endDate: '2025-03-30', volume: 20484, adjustedVolume: 19682.10, baseRate: 128.00, grossRate: 144.58, incentive: 326382, billTotal: 2845691, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 1,  paymentDate: '2025-04-16', company: 'Nestle (0A3400)',            startDate: '2025-04-07', endDate: '2025-04-13', volume: 717,   adjustedVolume: 694.61, baseRate: 121.99, grossRate: 132.42, incentive: 7245,   billTotal: 91983,   incomeAccount: 'Nestle (0A3400)',            cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 2,  paymentDate: '2025-04-15', company: 'Engro Pakistan (SU249000)',  startDate: '2025-04-07', endDate: '2025-04-13', volume: 19581, adjustedVolume: 18794.36, baseRate: 129.00, grossRate: 146.49, incentive: 328779, billTotal: 2753251, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 3,  paymentDate: '2025-04-15', company: 'Engro Pakistan (SU249000)',  startDate: '2025-04-14', endDate: '2025-04-20', volume: 19990, adjustedVolume: 19420.14, baseRate: 127.50, grossRate: 144.96, incentive: 339047, billTotal: 2815115, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 4,  paymentDate: '2025-04-09', company: 'Nestle (0A3400)',            startDate: '2025-03-31', endDate: '2025-04-06', volume: 514,   adjustedVolume: 500.70,  baseRate: 124.53, grossRate: 136.54, incentive: 6018,   billTotal: 68638,   incomeAccount: 'Nestle (0A3400)',            cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 5,  paymentDate: '2025-04-08', company: 'Engro Pakistan (SU249000)',  startDate: '2025-03-31', endDate: '2025-04-06', volume: 20268, adjustedVolume: 19769.45, baseRate: 129.00, grossRate: 146.28, incentive: 341566, billTotal: 2891825, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 6,  paymentDate: '2025-04-04', company: 'Engro Pakistan (SU249000)',  startDate: '2025-03-24', endDate: '2025-03-30', volume: 20484, adjustedVolume: 19682.10, baseRate: 128.00, grossRate: 144.58, incentive: 326382, billTotal: 2845691, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 1,  paymentDate: '2025-04-16', company: 'Nestle (0A3400)',            startDate: '2025-04-07', endDate: '2025-04-13', volume: 717,   adjustedVolume: 694.61, baseRate: 121.99, grossRate: 132.42, incentive: 7245,   billTotal: 91983,   incomeAccount: 'Nestle (0A3400)',            cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 2,  paymentDate: '2025-04-15', company: 'Engro Pakistan (SU249000)',  startDate: '2025-04-07', endDate: '2025-04-13', volume: 19581, adjustedVolume: 18794.36, baseRate: 129.00, grossRate: 146.49, incentive: 328779, billTotal: 2753251, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 3,  paymentDate: '2025-04-15', company: 'Engro Pakistan (SU249000)',  startDate: '2025-04-14', endDate: '2025-04-20', volume: 19990, adjustedVolume: 19420.14, baseRate: 127.50, grossRate: 144.96, incentive: 339047, billTotal: 2815115, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 4,  paymentDate: '2025-04-09', company: 'Nestle (0A3400)',            startDate: '2025-03-31', endDate: '2025-04-06', volume: 514,   adjustedVolume: 500.70,  baseRate: 124.53, grossRate: 136.54, incentive: 6018,   billTotal: 68638,   incomeAccount: 'Nestle (0A3400)',            cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 5,  paymentDate: '2025-04-08', company: 'Engro Pakistan (SU249000)',  startDate: '2025-03-31', endDate: '2025-04-06', volume: 20268, adjustedVolume: 19769.45, baseRate: 129.00, grossRate: 146.28, incentive: 341566, billTotal: 2891825, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
  { id: 6,  paymentDate: '2025-04-04', company: 'Engro Pakistan (SU249000)',  startDate: '2025-03-24', endDate: '2025-03-30', volume: 20484, adjustedVolume: 19682.10, baseRate: 128.00, grossRate: 144.58, incentive: 326382, billTotal: 2845691, incomeAccount: 'Engro Pakistan (SU249000)', cashBank: 'Bank Alfalah (Shah Din Dairies)' },
];

// ----- columns -----
const columns = [
  { key: 'paymentDate',  labelKey: 'accounts.viewMilkPayments.columns.paymentDate',  width: 140 },
  { key: 'company',      labelKey: 'accounts.common.company',       width: 260 },
  { key: 'startDate',    labelKey: 'shared.common.startDate',    width: 130 },
  { key: 'endDate',      labelKey: 'shared.common.endDate',      width: 130 },
  { key: 'volume',       labelKey: 'accounts.viewMilkPayments.columns.volume',        width: 110 },
  { key: 'adjustedVolume', labelKey: 'accounts.viewMilkPayments.columns.adjustedVolume', width: 150 },
  { key: 'baseRate',     labelKey: 'accounts.common.baseRate',     width: 110 },
  { key: 'grossRate',    labelKey: 'accounts.viewMilkPayments.columns.grossRate',    width: 110 },
  { key: 'incentive',    labelKey: 'accounts.viewMilkPayments.columns.incentive',     width: 120 },
  { key: 'billTotal',    labelKey: 'accounts.viewMilkPayments.columns.billTotal',    width: 140 },
  { key: 'incomeAccount',labelKey: 'accounts.viewMilkPayments.columns.incomeAccount',width: 220 },
  { key: 'cashBank',     labelKey: 'accounts.viewMilkPayments.columns.cashBank',    width: 210 },
  { key: 'actions',      labelKey: 'accounts.common.actions',       width: 110 },
] as const;
type ColKey = typeof columns[number]['key'];

export default function ViewMilkPayments() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [rows] = useState<PaymentRow[]>(demoRows);
  const [search, setSearch] = useState('');
  const [anchorCols, setAnchorCols] = useState<null | HTMLElement>(null);
  const [visible, setVisible] = useState<Record<ColKey, boolean>>(
    () => columns.reduce((acc, c) => ({ ...acc, [c.key]: true }), {} as Record<ColKey, boolean>)
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.company.toLowerCase().includes(q) ||
      pretty(r.paymentDate).toLowerCase().includes(q) ||
      pretty(r.startDate).toLowerCase().includes(q) ||
      pretty(r.endDate).toLowerCase().includes(q) ||
      r.incomeAccount.toLowerCase().includes(q) ||
      r.cashBank.toLowerCase().includes(q)
    );
  }, [rows, search]);

  // toolbar actions
  const handleCopy = async () => {
    const vCols = columns.filter(c => visible[c.key] && c.key !== 'actions');
    const data = filtered.map(r => vCols.map(c => {
      switch (c.key) {
        case 'paymentDate': return pretty(r.paymentDate);
        case 'startDate':   return pretty(r.startDate);
        case 'endDate':     return pretty(r.endDate);
        case 'volume':      return num(r.volume);
        case 'adjustedVolume': return num(r.adjustedVolume);
        case 'baseRate':    return r.baseRate;
        case 'grossRate':   return r.grossRate;
        case 'incentive':   return num(r.incentive);
        case 'billTotal':   return num(r.billTotal);
        default:            return (r as any)[c.key];
      }
    }));
    const csv = toCsv(vCols.map(c => t(c.labelKey)), data);
    await navigator.clipboard.writeText(csv);
    alert(t('accounts.common.copiedCsv'));
  };

  const downloadCsv = (filename: string) => {
    const vCols = columns.filter(c => visible[c.key] && c.key !== 'actions');
    const data = filtered.map(r => vCols.map(c => {
      switch (c.key) {
        case 'paymentDate': return pretty(r.paymentDate);
        case 'startDate':   return pretty(r.startDate);
        case 'endDate':     return pretty(r.endDate);
        case 'volume':      return r.volume;
        case 'adjustedVolume': return r.adjustedVolume;
        case 'incentive':   return r.incentive;
        case 'billTotal':   return r.billTotal;
        default:            return (r as any)[c.key];
      }
    }));
    const csv = toCsv(vCols.map(c => t(c.labelKey)), data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer title={t('accounts.viewMilkPayments.title')}>
        {/* Header + toolbar */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
          <TextField
            size="small"
            placeholder={t('common.search')}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{
              startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
            }}
            sx={{ width: 240, bgcolor: 'background.paper', borderRadius: 1 }}
          />
        </Stack>

        <Paper elevation={0} sx={{ p: 2, mb: 2, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            <Button
              size="small"
              startIcon={<ViewColumnOutlinedIcon />}
              onClick={(e) => setAnchorCols(e.currentTarget)}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: theme.palette.divider, color: 'text.secondary', background: theme.palette.background.paper }}
            >
              {t('accounts.common.columnVisibility')}
            </Button>
            <Button
              size="small"
              startIcon={<ContentCopyOutlinedIcon />}
              onClick={handleCopy}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: theme.palette.divider, color: 'text.secondary', background: theme.palette.background.paper }}
            >
              {t('accounts.common.copy')}
            </Button>
            <Button
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadCsv('milk_payments.csv')}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: theme.palette.divider, color: 'text.secondary', background: theme.palette.background.paper }}
            >
              {t('accounts.viewMilkPayments.csv')}
            </Button>
            <Button
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadCsv('milk_payments_excel.csv')}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: theme.palette.divider, color: 'text.secondary', background: theme.palette.background.paper }}
            >
              {t('accounts.viewMilkPayments.excel')}
            </Button>
            <Button
              size="small"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => window.print()}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: theme.palette.divider, color: 'text.secondary', background: theme.palette.background.paper }}
            >
              {t('accounts.viewMilkPayments.pdf')}
            </Button>
            <Button
              size="small"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => window.print()}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: theme.palette.divider, color: 'text.secondary', background: theme.palette.background.paper }}
            >
              {t('accounts.viewMilkPayments.print')}
            </Button>
          </Stack>
        </Paper>

        {/* Column visibility menu */}
        <Menu anchorEl={anchorCols} open={Boolean(anchorCols)} onClose={() => setAnchorCols(null)}>
          {columns.map(c => (
            <MenuItem key={c.key} onClick={() => setVisible(v => ({ ...v, [c.key]: !v[c.key] }))}>
              <Checkbox checked={visible[c.key]} />
              <ListItemText>{t(c.labelKey)}</ListItemText>
            </MenuItem>
          ))}
        </Menu>

        {/* Table */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Box sx={{ overflow: 'auto' }}>
            <table style={{ borderCollapse: 'separate', width: '100%' }}>
              <thead>
                <tr>
                  {columns.map(c => visible[c.key] && (
                    <th key={c.key}
                        style={{
                          position: 'sticky', top: 0, background: '#f8fafc',
                          textAlign: 'left', padding: '10px 12px',
                          borderBottom: `1px solid ${theme.palette.divider}`,
                          minWidth: c.width
                        }}>
                      {t(c.labelKey)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => (
                  <tr key={r.id}>
                    {visible.paymentDate  && <td style={td}>{pretty(r.paymentDate)}</td>}
                    {visible.company      && <td style={td}>{r.company}</td>}
                    {visible.startDate    && <td style={td}>{pretty(r.startDate)}</td>}
                    {visible.endDate      && <td style={td}>{pretty(r.endDate)}</td>}
                    {visible.volume       && <td style={td}>{num(r.volume)}</td>}
                    {visible.adjustedVolume && <td style={td}>{num(r.adjustedVolume)}</td>}
                    {visible.baseRate     && <td style={td}>{r.baseRate}</td>}
                    {visible.grossRate    && <td style={td}>{r.grossRate}</td>}
                    {visible.incentive    && <td style={td}>{num(r.incentive)}</td>}
                    {visible.billTotal    && <td style={td}>{num(r.billTotal)}</td>}
                    {visible.incomeAccount&& <td style={td}>{r.incomeAccount}</td>}
                    {visible.cashBank     && <td style={td}>{r.cashBank}</td>}
                    {visible.actions && (
                      <td style={td}>
                        <Tooltip title={t('common.edit')}><IconButton size="small"><EditOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                        <Tooltip title={t('common.delete')}><IconButton size="small"><DeleteOutlineOutlinedIcon fontSize="small" /></IconButton></Tooltip>
                      </td>
                    )}
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td style={{ ...td, padding: 24 }} colSpan={Object.values(visible).filter(Boolean).length}>{t('accounts.common.noData')}</td></tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
    </PageContainer>
  );
}

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #eceff1',
  whiteSpace: 'nowrap',
};
