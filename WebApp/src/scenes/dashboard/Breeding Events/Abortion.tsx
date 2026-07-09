import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Select,
  MenuItem,
  IconButton,
  Pagination,
  Chip,
  CircularProgress,
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAbortionEvent } from '../../../shared/services/breeds.services';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';


interface AbortionRow {
  srNo: string;
  tagId: string;
  tagName: string;
  comments: string;
  abortionDate: string;
  status: string;
  price: number;
}

const Abortion: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [rows, setRows] = useState<AbortionRow[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [loading, setLoading] = useState(true);
  const { isMobile } = useLayoutShift();

  useEffect(() => {
    const loadAbortionEvents = async () => {
      setLoading(true);
      try {
        const abortionData = await fetchAbortionEvent();
        if (!Array.isArray(abortionData)) throw new Error("Invalid response format");

        const formattedData: AbortionRow[] = abortionData.map((item, index) => ({
          srNo: (index + 1).toString(),
          tagId: item.tagId || '',
          tagName: item.tagName || '',      // <-- pick tagName from API data
          comments: item.comments || '',
          abortionDate: item.abortionDate,
          status: item.status ? 'Milkable' : 'Non-Milkable',
          price: item.price,
        }));
        

        setRows(formattedData);
      } catch (error) {
        console.error('Failed to load abortion events:', error);
      }
      setLoading(false);
    };

    loadAbortionEvents();
  }, []);

  const filteredRows = rows.filter(row =>
    Object.values(row).join(' ').toLowerCase().includes(search.toLowerCase())
  );
  const paginatedRows = filteredRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handleAddNew = () => {
    navigate('/abortion/new');
  };

  return (
    <PageContainer title={t('breeding.abortion.pageTitle')}>
      {/* Back Button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          mb: 2,
          color: '#005f73',
          textTransform: 'none',
          fontWeight: 'bold'
        }}
      >
        {t('breeding.common.back')}
      </Button>

      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginBottom: '20px'
        }}
      >
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#005f73',
            textTransform: 'none',
            borderRadius: '8px',
            '&:hover': { backgroundColor: '#007f91' }
          }}
          onClick={handleAddNew}
        >
          {t('breeding.common.addNew')}
        </Button>
      </Box>

      <Box
  sx={{
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
>

      {/* Search and Sort */}
      <Box
        sx={{
          // marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          p: { xs: 2, sm: 3, md: 3 }
        }}
      >
        <TextField
          fullWidth
          placeholder={t('breeding.common.search')}
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <Select
          value={sort}
          onChange={e => setSort(e.target.value)}
          displayEmpty
          sx={{ marginLeft: '10px' }}
        >
          <MenuItem value="">{t('breeding.common.sort')}</MenuItem>
          <MenuItem value="date">{t('breeding.common.byDate')}</MenuItem>
          <MenuItem value="status">{t('breeding.common.byStatus')}</MenuItem>
          <MenuItem value="price">{t('breeding.common.byPrice')}</MenuItem>
        </Select>
      </Box>

      {/* Loader or Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress  size={isMobile ? 30 : 50} sx={{ color: "#0F7C8F" }} />
        </Box>
      ) : (
        <>
          {/* Table */}
          <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none',width:'100%',   margin: 0,  }}>
            <Table sx={{ width: '100%',
                 }}>
              <TableHead sx={{backgroundColor: "#F8F9FA"}}>
                <TableRow>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.common.srNo')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.abortion.columns.tagId')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.abortion.columns.abortionDate')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.abortion.columns.status')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.abortion.columns.price')}</TableCell>
                  <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.abortion.columns.comments')}</TableCell>
                  <TableCell />
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedRows.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell>{row.srNo}</TableCell>
                    <TableCell>{row.tagName || row.tagId}</TableCell>
                    <TableCell>{row.abortionDate}</TableCell>
                    <TableCell>
                      <Chip
                        label={t('breeding.abortion.status.' + row.status, row.status).toUpperCase()}
                        sx={{
                          backgroundColor:
                            row.status === 'Milkable' ? '#e8f5e9' : '#fbe9e7',
                          color: row.status === 'Milkable' ? '#388e3c' : '#d84315',
                          fontWeight: 'bold'
                        }}
                      />
                    </TableCell>
                    <TableCell>{row.price}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                    <TableCell>
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}

                {/* If there are no results after filtering */}
                {paginatedRows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      {t('breeding.common.noDataFound')}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              // marginTop: '20px',
              px: 2, pb: 2, mt: 2
            }}
          >
            <Pagination
              count={Math.ceil(filteredRows.length / rowsPerPage)}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
            />
          </Box>
     
        </>
      )}
    </Box>
    </PageContainer>
  );
};

export default Abortion;
