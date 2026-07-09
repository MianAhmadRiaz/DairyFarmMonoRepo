import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Pagination,
  FormControl,
  InputLabel,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchBullBreedingList } from '../../../shared/services/breeds.services';
import { fetchAnimals } from '../../../shared/services/herdinfo.services';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';


interface BullBreedingRow {
  srNo: string;
  bullBreedDate: string;
  tagId: string;
  tagName?:string;
  sireName: string;
  comments: string;
  selected?: boolean;
}

const BullBreeding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ----------------------------
  // Demo Data
  // ----------------------------
  const initialData: BullBreedingRow[] = [
  ];

  // ----------------------------
  // State
  // ----------------------------
  const [rows, setRows] = useState<BullBreedingRow[]>(initialData);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [isLoading, setIsLoading] = useState(true); // Add loading state
  const { isMobile } = useLayoutShift();
  // For demonstration, we store selection in the row data itself
  // (You could store in a separate state object if you prefer.)

  // ----------------------------
  // Derived
  // ----------------------------
  const totalPages = Math.ceil(rows.length / rowsPerPage);

  // Filter by search text (SR #, bullBreedDate, tagId, sireName, comments)
  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Optional: sort the filtered rows
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sort === 'srNo') {
      // Sort by SR # ascending
      return Number(a.srNo) - Number(b.srNo);
    } else if (sort === 'date') {
      // Sort by bullBreedDate ascending
      return a.bullBreedDate.localeCompare(b.bullBreedDate);
    } else if (sort === 'tagId') {
      return a.tagId.localeCompare(b.tagId);
    } else {
      // no sorting
      return 0;
    }
  });

  // Pagination
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedRows.slice(indexOfFirstRow, indexOfLastRow);
  const [bullBreedingList, setBullBreedingList] = useState([]);


  useEffect(() => {
    const loadBullBreedings = async () => {
      setIsLoading(true);
      try {
        const bullBreedingData = await fetchBullBreedingList();
        // Map DropdownObject[] to BullBreedingRow[]
        const mappedRows: BullBreedingRow[] = bullBreedingData.map((item: any, idx: number) => ({
          srNo: item.srNo ?? String(idx + 1),
          bullBreedDate: item.bullBreedDate ?? '',
          tagId: item.tagId ?? '',
          tagName: item.tagName,
          sireName: item.sireName ?? '',
          comments: item.comments ?? '',
        }));
        setRows(mappedRows);
      } catch (error) {
        console.error('Failed to load bull breeding data:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    loadBullBreedings();
  }, []);
  

  // ----------------------------
  // Handlers
  // ----------------------------
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleSelectAll = (checked: boolean) => {
    // Mark all currentRows as selected (or deselected)
    const updated = rows.map((row) => {
      if (currentRows.includes(row)) {
        return { ...row, selected: checked };
      }
      return row;
    });
    setRows(updated);
  };

  const handleSelectRow = (rowIndex: number, checked: boolean) => {
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], selected: checked };
    setRows(updated);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1); // reset pagination
  };

  const handleSortChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSort(e.target.value as string);
  };

 const handleAddNew = () => {
  navigate('/bull-breeding/new');
};



  return (
    <PageContainer title={t('breeding.bullBreedingList.pageTitle')}>
      {/* Back button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate(-1)}
        sx={{
          color: '#005f73',
          textTransform: 'none',
          fontWeight: 'bold',
          mb: 2,
        }}
      >
        {t('breeding.common.back')}
      </Button>

      {/* Header (Add New button) */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: '#005f73',
            textTransform: 'none',
            borderRadius: '12px',
            padding:'8px 40px',

            '&:hover': { backgroundColor: '#007f91' }
          }}
          onClick={handleAddNew}
        >
          {t('breeding.common.addNew')}
        </Button>
      </Box>

      {/* Card - "Recent Entries (15)" */}
      <Box
        sx={{
          mt: 2,
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          // p: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

        }}
      >
         <Box sx={{p: { xs: 2, sm: 3, md: 3 }}}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('breeding.common.recentEntries', { count: rows.length })}
        </Typography>

        {/* Search & Sort row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
            mb: 2
          }}
        >
          <TextField
            variant="outlined"
            fullWidth
            placeholder={t('breeding.common.search')}
            value={search}
            onChange={handleSearchChange}
          />
          <FormControl sx={{ width: '150px' }}>
            <InputLabel>{t('breeding.common.sort')}</InputLabel>
            <Select
              label={t('breeding.common.sort')}
              value={sort}
             // onChange={handleSortChange}
            >
              <MenuItem value="">{t('breeding.common.none')}</MenuItem>
              <MenuItem value="srNo">{t('breeding.common.bySrNo')}</MenuItem>
              <MenuItem value="date">{t('breeding.common.byDate')}</MenuItem>
              <MenuItem value="tagId">{t('breeding.common.byTagId')}</MenuItem>
            </Select>
          </FormControl>
        </Box>
        </Box>
        {isLoading ? (
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            alignItems: 'center', 
            height: 300,
            width: '100%'
          }}>
            <CircularProgress  size={isMobile ? 30 : 50} sx={{color:"#0F7C8F"}}/>
          </Box>
        ) : (
          <>
        <TableContainer
          component={Paper}
          sx={{ maxHeight: 500, borderRadius: '12px', boxShadow: 'none',width:'100%',   margin: 0,  }}
        >
          <Table stickyHeader>
            <TableHead sx={{backgroundColor: "#F8F9FA"}}>
              <TableRow>
                <TableCell padding="checkbox">
                  {/* "Select All" checkbox */}
                  <Checkbox
                    indeterminate={
                      currentRows.some((r) => r.selected) &&
                      currentRows.some((r) => !r.selected)
                    }
                    checked={
                      currentRows.length > 0 &&
                      currentRows.every((r) => r.selected)
                    }
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.common.srNo')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.bullBreedingList.columns.bullBreedDate')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.bullBreedingList.columns.tagId')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.bullBreedingList.columns.sireName')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.bullBreedingList.columns.comments')}</TableCell>
                <TableCell align="center">
                  <MoreVertIcon sx={{ opacity: 0.0 }} />
                  {/* We show an icon here to match the screenshot's layout, 
                      but it's transparent so the column header is aligned */}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.map((row, idx) => {
                // find index in original data for selection toggling
                const originalIndex = rows.findIndex((r) => r.srNo === row.srNo);
                return (
                  <TableRow key={row.srNo}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={!!row.selected}
                        onChange={(e) => handleSelectRow(originalIndex, e.target.checked)}
                      />
                    </TableCell>
                    <TableCell>{row.srNo}</TableCell>
                    <TableCell>{row.bullBreedDate}</TableCell>
<TableCell>{row.tagName || row.tagId}</TableCell>
                    <TableCell>{row.sireName}</TableCell>
                    <TableCell>{row.comments}</TableCell>
                    <TableCell align="center">
                      <IconButton>
                        <MoreVertIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                );
              })}

              {/* If no rows match search, etc. */}
              {currentRows.length === 0 && (
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
            justifyContent: 'space-between',
            alignItems: 'center',
            mt: 2
          }}
        >
          {/* Rows per page control (optional) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography variant="body2"  sx={{pl:{xs:1,md:3}}}>{t('breeding.common.rowsPerPage')}</Typography>
            <Select
              size="small"
              value={rowsPerPage}
              // If you want dynamic row count, store it in state
              onChange={(e) => {
                // e.g. setRowsPerPage(Number(e.target.value));
                console.log('Change rows per page not implemented in this example');
              }}
            >
              <MenuItem value={5}>5</MenuItem>
              <MenuItem value={10}>10</MenuItem>
              <MenuItem value={15}>15</MenuItem>
            </Select>
          </Box>

          {/* Standard pagination */}
            <Box sx={{ px: 2, pb: 2, mt: 2 }}>
          <Pagination
            count={totalPages}
            page={currentPage}
            onChange={handlePageChange}
            variant="outlined"
            shape="rounded"
          />
        </Box>
        </Box>
        </>
        )}
      </Box>
    </PageContainer>
  );
};

export default BullBreeding;
