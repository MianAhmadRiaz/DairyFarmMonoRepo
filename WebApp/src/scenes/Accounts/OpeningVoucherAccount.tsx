import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  InputAdornment,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { tokens } from '../../shared/theme/theme';
import {
  fetchChartOfAccounts,
  updateAccount,
  ChartAccount
} from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

export default function OpeningVoucherAccount() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [openingBalances, setOpeningBalances] = useState<{ [key: number]: string }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [accountsData, setAccountsData] = useState<{ id: number; name: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const list: ChartAccount[] = await fetchChartOfAccounts({ isActive: 'true' });
        setAccountsData(list.map(a => ({ id: a.id, name: `${a.account_code} - ${a.account_name}` })));
        const balances: { [key: number]: string } = {};
        list.forEach(a => { balances[a.id] = String(a.opening_balance ?? 0); });
        setOpeningBalances(balances);
      } catch (e) {
        console.error('Failed to load accounts', e);
      }
    })();
  }, []);

  const handleOpeningBalanceChange = (accountId: number, value: string) => {
    setOpeningBalances(prev => ({
      ...prev,
      [accountId]: value
    }));
  };

  const filteredAccounts = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return accountsData.filter(account =>
      q ? account.name.toLowerCase().includes(q) : true
    );
  }, [searchTerm, accountsData]);

  const handleSave = async () => {
    try {
      await Promise.all(
        accountsData.map(acc =>
          updateAccount(acc.id, { opening_balance: Number(openingBalances[acc.id] || 0) } as any)
        )
      );
      alert('Opening balances saved!');
    } catch (e) {
      console.error('Failed to save opening balances', e);
      alert('Failed to save opening balances.');
    }
  };

  return (
    <PageContainer title="Chart of Accounts Opening">
        {/* Title Row */}
        <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ mb: 1 }}>
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: '#4CAF50',
                color: '#fff',
                textTransform: 'none',
                px: 3,
              }}
            >
              Save
            </Button>

            {/* Search */}
            <TextField
              size="small"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
                  <th style={th}>#</th>
                  <th style={{ ...th, minWidth: 420 }}>1st Level</th>
                  <th style={{ ...th, minWidth: 200, textAlign: 'right' }}>Opening</th>
                </tr>
              </thead>

              <tbody>
                {filteredAccounts.map((account, index) => (
                  <tr key={account.id}>
                    <td style={td}>{index + 1}</td>
                    <td style={td}>{account.name}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={openingBalances[account.id] || '0'}
                        onChange={(e) => handleOpeningBalanceChange(account.id, e.target.value)}
                        inputProps={{
                          min: 0,
                          step: 0.01,
                          style: { textAlign: 'right' }
                        }}
                        sx={{
                          width: '120px',
                          '& .MuiOutlinedInput-root': {
                            backgroundColor: '#fff',
                            fontSize: '0.875rem',
                          }
                        }}
                      />
                    </td>
                  </tr>
                ))}
                {filteredAccounts.length === 0 && (
                  <tr>
                    <td style={{ ...td, padding: 24 }} colSpan={3}>No data</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Box>
        </Paper>
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
  userSelect: 'none',
};

const td: React.CSSProperties = {
  padding: '10px 12px',
  borderBottom: '1px solid #eceff1',
  whiteSpace: 'nowrap',
};
