import React, { useMemo, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  useTheme,
  Stack,
  InputAdornment,
  MenuItem,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ContentCopyOutlinedIcon from '@mui/icons-material/ContentCopyOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import { tokens } from '../../shared/theme/theme';
import PageContainer from '../../shared/components/Layout/PageContainer';

interface AccountRow {
  id: number;
  firstLevel: string;
  secondLevel: string;
  thirdLevel: string;
  fourthLevel: string;
}

// Sample data based on the screenshots
const DEMO_DATA: AccountRow[] = [
  { id: 1, firstLevel: 'Assets', secondLevel: 'Fixed Assets', thirdLevel: 'Bio Gas (Storage Setup)', fourthLevel: '786 Iron Store Hasilpur Old' },
  { id: 2, firstLevel: 'Assets', secondLevel: 'Fixed Assets', thirdLevel: 'New Commercial Meter Application', fourthLevel: 'A S Enterprises' },
  { id: 3, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Aazib Javeed Silage Customer', fourthLevel: 'AIT Solutions (Dairy Care Software)' },
  { id: 4, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Abdul Khaliq Silage Customer', fourthLevel: 'AJ Zarai Service' },
  { id: 5, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Abdulghafoor (Fodder Customer)', fourthLevel: 'AR Bahoo Feed Grinder Maker' },
  { id: 6, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Abdulhamman Haroom abad (Silage Customer)', fourthLevel: '' },
  { id: 7, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Abdullah Silage Customer', fourthLevel: '' },
  { id: 8, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Abdulsalam Silage Customer', fourthLevel: '' },
  { id: 9, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Affan Silage Customer', fourthLevel: '' },
  { id: 10, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Afzal 23-24 Laleeka Haroon Abad(Silage Customer)', fourthLevel: '' },
  { id: 11, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Afzal Gorya 162/M Chunawala (Silage Customer)', fourthLevel: '' },
  { id: 12, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Ameen Gondal', fourthLevel: '' },
  { id: 13, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Animal Asset', fourthLevel: '' },
  { id: 14, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Arfat Bakers Hasilpur City (Milk Account)', fourthLevel: '' },
  { id: 15, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Arif 166/7B, aqfqa Rafiq abad, Faqeer wali (Silage Customer)', fourthLevel: '' },
  { id: 16, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Arslan 77/F (silage Customer)', fourthLevel: '' },
  { id: 17, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Arslan s/o Zulafqar Tahir Colony USP (Silage Customer)', fourthLevel: '' },
  { id: 18, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Asghar Silage Customer', fourthLevel: '' },
  { id: 19, firstLevel: 'Assets', secondLevel: 'Current Assets', thirdLevel: 'Aurangzaib Khan Ghazikhanana (Milk Customer)', fourthLevel: '' },
];

// Filter options based on screenshots
const FIRST_LEVEL_OPTIONS = ['All', 'Assets', 'Capital', 'Expense', 'Income', 'Liabilities'];
const SECOND_LEVEL_OPTIONS = ['All', 'Fixed Assets', 'Current Assets'];
const THIRD_LEVEL_OPTIONS = ['All', 'Agri Implement Rent Out Income', 'Anees Store (Capital/Borrowing)', 'Animal Loss (CGS x) product assigned to head. Find product and delete', 'Animal Sale Income', 'Bank Charges (Expense)'];

const toCsv = (headers: string[], rows: (string | number)[][]) =>
  [headers.join(','), ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))].join('\n');

export default function ChartsOfAccountLevels() {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg = theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [data] = useState<AccountRow[]>(DEMO_DATA);
  const [search, setSearch] = useState('');
  const [firstLevelFilter, setFirstLevelFilter] = useState<string>('All');
  const [secondLevelFilter, setSecondLevelFilter] = useState<string>('All');
  const [thirdLevelFilter, setThirdLevelFilter] = useState<string>('All');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return data.filter(row =>
      (firstLevelFilter === 'All' || row.firstLevel === firstLevelFilter) &&
      (secondLevelFilter === 'All' || row.secondLevel === secondLevelFilter) &&
      (thirdLevelFilter === 'All' || row.thirdLevel === thirdLevelFilter) &&
      (q ? 
        row.firstLevel.toLowerCase().includes(q) || 
        row.secondLevel.toLowerCase().includes(q) || 
        row.thirdLevel.toLowerCase().includes(q) || 
        row.fourthLevel.toLowerCase().includes(q) : true)
    );
  }, [data, search, firstLevelFilter, secondLevelFilter, thirdLevelFilter]);

  // Toolbar actions
  const handleCopy = async () => {
    const csv = toCsv(
      ['#', '1st Level', '2nd Level', '3rd Level', '4th Level'],
      filtered.map(r => [r.id, r.firstLevel, r.secondLevel, r.thirdLevel, r.fourthLevel])
    );
    await navigator.clipboard.writeText(csv);
    alert('Copied table (CSV) to clipboard');
  };

  const downloadCsv = (filename: string) => {
    const csv = toCsv(
      ['#', '1st Level', '2nd Level', '3rd Level', '4th Level'],
      filtered.map(r => [r.id, r.firstLevel, r.secondLevel, r.thirdLevel, r.fourthLevel])
    );
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = filename; 
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <PageContainer title="Chart of Accounts Levels">
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
              Copy
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
              placeholder="Search"
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
                  <th style={th}>#</th>
                  <th style={{ ...th, minWidth: 150 }}>1st Level</th>
                  <th style={{ ...th, minWidth: 150 }}>2nd Level</th>
                  <th style={{ ...th, minWidth: 200 }}>3rd Level</th>
                  <th style={{ ...th, minWidth: 200 }}>4th Level</th>
                </tr>
                {/* Filter row under headers */}
                <tr>
                  <th style={filterTh}></th>
                  <th style={{ ...filterTh, padding: 6 }}>
                    <TextField
                      select
                      size="small"
                      value={firstLevelFilter}
                      onChange={(e) => setFirstLevelFilter(e.target.value)}
                      sx={{ minWidth: 120, bgcolor: '#fff' }}
                    >
                      {FIRST_LEVEL_OPTIONS.map(t => <MenuItem value={t} key={t}>{t}</MenuItem>)}
                    </TextField>
                  </th>
                  <th style={{ ...filterTh, padding: 6 }}>
                    <TextField
                      select
                      size="small"
                      value={secondLevelFilter}
                      onChange={(e) => setSecondLevelFilter(e.target.value)}
                      sx={{ minWidth: 120, bgcolor: '#fff' }}
                    >
                      {SECOND_LEVEL_OPTIONS.map(t => <MenuItem value={t} key={t}>{t}</MenuItem>)}
                    </TextField>
                  </th>
                  <th style={{ ...filterTh, padding: 6 }}>
                    <TextField
                      select
                      size="small"
                      value={thirdLevelFilter}
                      onChange={(e) => setThirdLevelFilter(e.target.value)}
                      sx={{ minWidth: 120, bgcolor: '#fff' }}
                    >
                      {THIRD_LEVEL_OPTIONS.map(t => <MenuItem value={t} key={t}>{t}</MenuItem>)}
                    </TextField>
                  </th>
                  <th style={filterTh}></th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((row) => (
                  <tr key={row.id}>
                    <td style={td}>{row.id}</td>
                    <td style={td}>{row.firstLevel}</td>
                    <td style={td}>{row.secondLevel}</td>
                    <td style={td}>{row.thirdLevel}</td>
                    <td style={td}>{row.fourthLevel}</td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td style={{ ...td, padding: 24 }} colSpan={5}>No data found</td>
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
