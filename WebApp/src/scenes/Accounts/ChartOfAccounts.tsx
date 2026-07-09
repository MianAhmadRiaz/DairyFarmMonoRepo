import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  Chip,
  InputAdornment,
  IconButton,
  MenuItem,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import { tokens } from '../../shared/theme/theme';
import {
  fetchChartOfAccounts,
  updateAccount,
  deleteAccount,
  ChartAccount
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

type Status = 'Enabled' | 'Disabled';

interface AccountRow {
  id: number;
  code: string;
  name: string;
  type: string;      // e.g., "Creditors / Vendors"
  status: Status;

  // extra fields for edit modal
  openingBalance?: number;
  under?: string;
  editName?: string;
  contactNo?: string;
  address?: string;
  email?: string;
}

type EditForm = {
  code: string;
  name: string;
  openingBalance: string; // keep as string for TextField
  under: string;
  editName: string;
  contactNo: string;
  address: string;
  email: string;
};

const typeLabel = (t: string) =>
  t ? t.charAt(0).toUpperCase() + t.slice(1) : '';

const mapAccount = (a: ChartAccount): AccountRow => ({
  id: a.id,
  code: a.account_code,
  name: a.account_name,
  type: typeLabel(a.account_type),
  status: a.is_active ? 'Enabled' : 'Disabled',
  openingBalance: Number(a.opening_balance) || 0
});

const TYPES = [
  'All',
  'Asset',
  'Liability',
  'Equity',
  'Revenue',
  'Expense',
];

const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

export default function ChartOfAccounts() {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [rows, setRows] = useState<AccountRow[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('All');

  const loadAccounts = async () => {
    try {
      const accounts = await fetchChartOfAccounts();
      setRows(accounts.map(mapAccount));
    } catch (e) {
      console.error('Failed to load chart of accounts', e);
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  // sorting
  const [sortKey, setSortKey] = useState<keyof AccountRow>('id');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');
  const toggleSort = (key: keyof AccountRow) => {
    if (sortKey === key) setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortKey(key); setSortDir('asc'); }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let list = rows.filter(r =>
      (typeFilter === 'All' || r.type === typeFilter) &&
      (q ? r.name.toLowerCase().includes(q) || r.code.includes(q) || r.type.toLowerCase().includes(q) : true)
    );
    list = [...list].sort((a, b) => {
      const va = String(a[sortKey]).toLowerCase();
      const vb = String(b[sortKey]).toLowerCase();
      if (va < vb) return sortDir === 'asc' ? -1 : 1;
      if (va > vb) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });
    return list;
  }, [rows, search, typeFilter, sortKey, sortDir]);

  // toolbar actions
  const handleCopy = async () => {
    const csv = toCsv(
      ['#', t('accounts.common.code'), t('accounts.common.name'), t('accounts.common.type'), t('accounts.common.status')],
      filtered.map(r => [r.id, r.code, r.name, r.type, r.status])
    );
    await navigator.clipboard.writeText(csv);
    alert(t('accounts.common.copiedCsv'));
  };

  const downloadCsv = (filename: string) => {
    const csv = toCsv(
      ['#', t('accounts.common.code'), t('accounts.common.name'), t('accounts.common.type'), t('accounts.common.status')],
      filtered.map(r => [r.id, r.code, r.name, r.type, r.status])
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
  };

  // ---------------- Edit Modal State ----------------
  const [open, setOpen] = useState(false);
  const [editingRow, setEditingRow] = useState<AccountRow | null>(null);
  const [form, setForm] = useState<EditForm>({
    code: '',
    name: '',
    openingBalance: '0',
    under: 'None',
    editName: '',
    contactNo: '',
    address: '',
    email: '',
  });

  const underOptions = useMemo(
    () => ['None', ...Array.from(new Set(rows.map(r => r.type)))],
    [rows]
  );

  const launchEdit = (row: AccountRow) => {
    setEditingRow(row);
    setForm({
      code: row.code || '',
      name: row.name || '',
      openingBalance: String(row.openingBalance ?? 0),
      under: row.under ?? 'None',
      editName: row.editName ?? row.name ?? '',
      contactNo: row.contactNo ?? '',
      address: row.address ?? '',
      email: row.email ?? '',
    });
    setOpen(true);
  };

  const closeEdit = () => setOpen(false);

  const saveEdit = async () => {
    if (!form.name.trim()) {
      alert(t('accounts.chartOfAccounts.nameRequired'));
      return;
    }
    if (!editingRow) return;

    try {
      await updateAccount(editingRow.id, {
        account_code: form.code.trim(),
        account_name: form.name.trim(),
        opening_balance: Number(form.openingBalance || 0)
      });
      await loadAccounts();
      setOpen(false);
    } catch (e) {
      console.error('Failed to update account', e);
      alert(t('accounts.chartOfAccounts.updateError'));
    }
  };

  const handleDelete = async (row: AccountRow) => {
    if (!window.confirm(t('accounts.chartOfAccounts.confirmDelete', { name: row.name }))) return;
    try {
      await deleteAccount(row.id);
      await loadAccounts();
    } catch (e) {
      console.error('Failed to delete account', e);
      alert(t('accounts.chartOfAccounts.deleteError'));
    }
  };

  return (
    <PageContainer title={t('accounts.chartOfAccounts.title')}>
        {/* Title Row */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              size="small"
              startIcon={<ContentCopyOutlinedIcon />}
              onClick={handleCopy}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', background: '#fff' }}
            >
              {t('accounts.common.copy')}
            </Button>
            <Button
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadCsv('chart_of_accounts.csv')}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', background: '#fff' }}
            >
              CSV
            </Button>
            <Button
              size="small"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={() => downloadCsv('chart_of_accounts_excel.csv')}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', background: '#fff' }}
            >
              Excel
            </Button>
            <Button
              size="small"
              startIcon={<PrintOutlinedIcon />}
              onClick={() => window.print()}
              variant="outlined"
              sx={{ textTransform: 'none', borderColor: '#d6d6d6', color: '#6a757d', background: '#fff' }}
            >
              PDF
            </Button>

            {/* Search */}
            <TextField
              size="small"
              placeholder={t('common.search')}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" /></InputAdornment>,
              }}
              sx={{ ml: 1, width: 240, bgcolor: 'background.paper', borderRadius: 1 }}
            />
          </Stack>
        </Stack>

        {/* Table Card */}
        <Paper elevation={0} sx={{ p: 0, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, bgcolor: 'background.paper' }}>
          <Box sx={{ overflow: 'auto' }}>
            <table style={{ borderCollapse: 'separate', width: '100%' }}>
              <thead>
                <tr>
                  <th style={th} onClick={() => toggleSort('id')}>#</th>
                  <th style={th} onClick={() => toggleSort('code')}>{t('accounts.common.code')}</th>
                  <th style={{ ...th, minWidth: 420 }} onClick={() => toggleSort('name')}>{t('accounts.common.name')}</th>
                  <th style={{ ...th, minWidth: 220 }} onClick={() => toggleSort('type')}>{t('accounts.common.type')}</th>
                  <th style={th} onClick={() => toggleSort('status')}>{t('accounts.common.status')}</th>
                  <th style={th}>{t('accounts.chartOfAccounts.editDelete')}</th>
                </tr>
                {/* filter row under headers (Type selector like screenshot) */}
                <tr>
                  <th style={filterTh}></th>
                  <th style={filterTh}></th>
                  <th style={filterTh}></th>
                  <th style={{ ...filterTh, padding: 6 }}>
                    <TextField
                      select
                      size="small"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      sx={{ minWidth: 200, bgcolor: '#fff' }}
                    >
                      {TYPES.map(ty => (
                        <MenuItem value={ty} key={ty}>
                          {ty === 'All'
                            ? t('accounts.common.all')
                            : t(`accounts.common.accountTypes.${ty.toLowerCase()}`, ty)}
                        </MenuItem>
                      ))}
                    </TextField>
                  </th>
                  <th style={filterTh}></th>
                  <th style={filterTh}></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id}>
                    <td style={td}>{r.id}</td>
                    <td style={td}>{r.code}</td>
                    <td style={{ ...td, color: '#0a66c2', cursor: 'pointer' /* link-like */ }}>{r.name}</td>
                    <td style={td}>{t(`accounts.common.accountTypes.${r.type.toLowerCase()}`, r.type)}</td>
                    <td style={td}>
                      <Chip
                        size="small"
                        label={t(`accounts.common.statusValues.${r.status.toLowerCase()}`, r.status)}
                        sx={{
                          bgcolor: r.status === 'Enabled' ? '#E6F4EF' : '#FFF1F1',
                          color:  r.status === 'Enabled' ? '#1B5E20' : '#C62828',
                          fontWeight: 600,
                        }}
                      />
                    </td>
                    <td style={td}>
                      <Tooltip title={t('common.edit')}>
                        <IconButton size="small" onClick={() => launchEdit(r)}>
                          <EditOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={t('common.delete')}>
                        <IconButton size="small" onClick={() => handleDelete(r)}>
                          <DeleteOutlineOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td style={{ ...td, padding: 24 }} colSpan={6}>{t('accounts.common.noData')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>

      {/* ---------------- Edit Account Modal ---------------- */}
      <Dialog open={open} onClose={closeEdit} fullWidth maxWidth="sm">
        <DialogTitle sx={{ pr: 5 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            <Typography variant="subtitle1" fontWeight={800}>{t('accounts.chartOfAccounts.editAccount')}</Typography>
            <IconButton onClick={closeEdit} size="small"><CloseIcon /></IconButton>
          </Stack>
        </DialogTitle>

        <DialogContent dividers sx={{ pt: 1 }}>
          <Stack spacing={1.5}>
            <TextField
              size="small"
              label={t('accounts.chartOfAccounts.editAccountCode')}
              value={form.code}
              onChange={(e) => setForm(f => ({ ...f, code: e.target.value }))}
            />
            <TextField
              size="small"
              label={t('accounts.chartOfAccounts.editAccountName')}
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
            />
            <TextField
              size="small"
              type="number"
              label={t('accounts.chartOfAccounts.editOpeningBalance')}
              value={form.openingBalance}
              onChange={(e) => setForm(f => ({ ...f, openingBalance: e.target.value }))}
              inputProps={{ step: 0.01, min: 0 }}
            />
            <TextField
              select
              size="small"
              label={t('accounts.chartOfAccounts.under')}
              value={form.under}
              onChange={(e) => setForm(f => ({ ...f, under: e.target.value }))}
            >
              {underOptions.map(opt => (
                <MenuItem key={opt} value={opt}>
                  {opt === 'None' ? t('accounts.common.none') : opt}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              size="small"
              label={t('accounts.chartOfAccounts.editName')}
              value={form.editName}
              onChange={(e) => setForm(f => ({ ...f, editName: e.target.value }))}
            />
            <TextField
              size="small"
              label={t('accounts.chartOfAccounts.editContactNo')}
              value={form.contactNo}
              onChange={(e) => setForm(f => ({ ...f, contactNo: e.target.value }))}
            />
            <TextField
              size="small"
              label={t('accounts.chartOfAccounts.editAddress')}
              value={form.address}
              onChange={(e) => setForm(f => ({ ...f, address: e.target.value }))}
            />
            <TextField
              size="small"
              label={t('accounts.chartOfAccounts.editEmail')}
              type="email"
              value={form.email}
              onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
              placeholder="example@example.com"
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 2, py: 1.5 }}>
          <Button
            onClick={closeEdit}
            variant="outlined"
            sx={{ color: '#6a757d', borderColor: '#d6d6d6', textTransform: 'none', backgroundColor: '#CECECE' }}
          >
            {t('common.close')}
          </Button>
          <Button
            onClick={saveEdit}
            variant="contained"
            sx={{ backgroundColor: '#005f73', color: '#fff', textTransform: 'none' }}
          >
            {t('accounts.common.saveChanges')}
          </Button>
        </DialogActions>
      </Dialog>
    </PageContainer>
  );
}

const th: React.CSSProperties = {
  position: 'sticky',
  top: 0,
  background: '#f8fafc',
  textAlign: 'left',
  padding: '10px 12px',
  borderBottom: '1px solid #e5e9ef',
  whiteSpace: 'nowrap',
  cursor: 'pointer',
  userSelect: 'none',
};
const filterTh: React.CSSProperties = {
  background: '#fff',
  padding: '8px 12px',
  borderBottom: '1px solid #e5e9ef',
};
const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #eceff1',
  whiteSpace: 'nowrap',
};
