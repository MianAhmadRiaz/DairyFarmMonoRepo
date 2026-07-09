import React, { useState, MouseEvent, useEffect } from 'react';
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
  Menu,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAiBreedingList } from '../../../shared/services/breeds.services';
import { fetchAnimals } from '../../../shared/services/herdinfo.services';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';


// Update AnimalInfoRow to reflect your actual API structure
interface AnimalInfoRow {
  uuid: string;
  tagName: string;
  // add tagId if you want to display both (id + name)
  tagId?: string;
}

interface AIBreedingRow {
  srNo: string;
  aiDate: string;
  tagId: string; // Now represents the animal's tag name
  sireName: string;
  straw: number;
  price: number;
  comments: string;
  selected?: boolean;
}

const AIBreeding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [rows, setRows] = useState<AIBreedingRow[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [anchorHeaderEl, setAnchorHeaderEl] = useState<null | HTMLElement>(null);
  const [anchorRowEl, setAnchorRowEl] = useState<null | HTMLElement>(null);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number | null>(null);
 const { isMobile } = useLayoutShift();

  useEffect(() => {
    const loadAiBreedings = async () => {
      setIsLoading(true);
      try {
        const data = await fetchAiBreedingList();
        // Map DropdownObject[] to AIBreedingRow[]
        const mappedRows: AIBreedingRow[] = data.map((item: any, idx: number) => ({
          srNo: item.srNo ?? String(idx + 1),
          aiDate: item.aiDate ?? '',
          tagId: item.tagId ?? '',
          sireName: item.sireName ?? '',
          straw: item.straw ?? 0,
          price: item.price ?? 0,
          comments: item.comments ?? '',
        }));
        setRows(mappedRows);
      } catch (error) {
        console.error('Failed to load AI breeding data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAiBreedings();
  }, []);

  // Filtering
  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  // Sorting
  const sortedRows = [...filteredRows].sort((a, b) => {
    if (sort === 'aiDate') return a.aiDate.localeCompare(b.aiDate);
    if (sort === 'tagId') return a.tagId.localeCompare(b.tagId);
    if (sort === 'price') return a.price - b.price;
    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const currentRows = sortedRows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Handlers
  const handlePageChange = (_: React.ChangeEvent<unknown>, page: number) => setCurrentPage(page);

  const handleRowsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSort(e.target.value as string);
    setCurrentPage(1);
  };

  const handleHeaderMenuOpen = (e: MouseEvent<HTMLElement>) => setAnchorHeaderEl(e.currentTarget);
  const handleHeaderMenuClose = () => setAnchorHeaderEl(null);

  const handleRowMenuOpen = (event: MouseEvent<HTMLElement>, rowIndex: number) => {
    setSelectedRowIndex(rowIndex);
    setAnchorRowEl(event.currentTarget);
  };
  const handleRowMenuClose = () => {
    setAnchorRowEl(null);
    setSelectedRowIndex(null);
  };

  const handleSelectAll = () => {
    const updated = rows.map((row) => {
      if (currentRows.includes(row)) {
        return { ...row, selected: true };
      }
      return row;
    });
    setRows(updated);
    handleHeaderMenuClose();
  };

  const handleDeleteSelected = () => {
    const updated = rows.filter((row) => !row.selected);
    setRows(updated);
    handleHeaderMenuClose();
  };

  const handleEditRow = () => {
    if (selectedRowIndex === null) return;
    console.log('Edit row:', rows[selectedRowIndex]);
    handleRowMenuClose();
  };

  const handleDeleteRow = () => {
    if (selectedRowIndex === null) return;
    const updated = [...rows];
    updated.splice(selectedRowIndex, 1);
    setRows(updated);
    handleRowMenuClose();
  };

  const handleRowCheckboxChange = (rowIndex: number, checked: boolean) => {
    const updated = [...rows];
    updated[rowIndex] = { ...updated[rowIndex], selected: checked };
    setRows(updated);
  };

  const handleAddNew = () => {
    navigate('/aibreeding/new');
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageContainer title={t('breeding.aiBreedingList.pageTitle')}>
      {/* Back Button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          color: '#005f73',
          textTransform: 'none',
          fontWeight: 'bold',
          mb: 2
        }}
      >
        {t('breeding.common.back')}
      </Button>

      {/* Add New */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
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

      {/* Card: Recent Entries (Max 50) */}
      <Box sx={{ mt: 2, backgroundColor: '#ffffff', 
        borderRadius: '12px',
           boxShadow: "0 4px 12px rgba(0,0,0,0.1)", }}>
               <Box sx={{p: { xs: 2, sm: 3, md: 3 }}}>
        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
          {t('breeding.aiBreedingList.recentEntriesMax50')}
        </Typography>

        {/* Search & Sort */}
    
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <TextField
            variant="outlined"
            fullWidth
            placeholder={t('breeding.common.search')}
            value={search}
            onChange={handleSearchChange}
          />
          <FormControl sx={{ width: '150px' }}>
            <InputLabel>{t('breeding.common.sort')}</InputLabel>
            <Select label={t('breeding.common.sort')} value={sort} onChange={handleSortChange}>
              <MenuItem value="">{t('breeding.common.none')}</MenuItem>
              <MenuItem value="aiDate">{t('breeding.aiBreedingList.byAiDate')}</MenuItem>
              <MenuItem value="tagId">{t('breeding.aiBreedingList.byTagName')}</MenuItem>
              <MenuItem value="price">{t('breeding.common.byPrice')}</MenuItem>
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
            <CircularProgress  size={isMobile ? 30 : 50} sx={{ color: "#0F7C8F" }} />
          </Box>
        ) : (
          <>
         
            <TableContainer component={Paper} sx={{ borderRadius: '12px', boxShadow: 'none',width:'100%',   margin: 0, 
          
         }}>
          
              <Table  sx={{ width: '100%',
                 }}>
                <TableHead sx={{backgroundColor: "#F8F9FA"}}>
                  <TableRow>
                    <TableCell padding="checkbox"></TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.common.srNo')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.aiBreedingList.columns.aiDate')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.aiBreedingList.columns.tagName')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.aiBreedingList.columns.sireName')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.aiBreedingList.columns.straw')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.aiBreedingList.columns.price')}</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.aiBreedingList.columns.comments')}</TableCell>
                    <TableCell align="right">
                      <IconButton onClick={handleHeaderMenuOpen}>
                        <MoreVertIcon />
                      </IconButton>
                      <Menu
                        anchorEl={anchorHeaderEl}
                        open={Boolean(anchorHeaderEl)}
                        onClose={handleHeaderMenuClose}
                      >
                        <MenuItem onClick={handleSelectAll}>{t('breeding.aiBreedingList.selectAll')}</MenuItem>
                        <MenuItem onClick={handleDeleteSelected}>{t('breeding.aiBreedingList.deleteSelected')}</MenuItem>
                      </Menu>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentRows.map((row, idx) => {
                    // figure out the original index in "rows" so we can toggle selection
                    const originalIndex = rows.indexOf(row);

                    return (
                      <TableRow key={idx}>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={!!row.selected}
                            onChange={(e) =>
                              handleRowCheckboxChange(originalIndex, e.target.checked)
                            }
                          />
                        </TableCell>
                        <TableCell>{row.srNo}</TableCell>
                        <TableCell>{row.aiDate}</TableCell>
                        <TableCell>{row.tagId}</TableCell>
                        <TableCell>{row.sireName}</TableCell>
                        <TableCell>{row.straw}</TableCell>
                        <TableCell>{row.price}</TableCell>
                        <TableCell>{row.comments}</TableCell>
                        <TableCell align="right">
                          <IconButton onClick={(e) => handleRowMenuOpen(e, originalIndex)}>
                            <MoreVertIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {currentRows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        {t('breeding.common.noDataFound')}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            

            {/* Row Menu (Edit/Delete) */}
            <Menu
              anchorEl={anchorRowEl}
              open={Boolean(anchorRowEl)}
              onClose={handleRowMenuClose}
            >
              <MenuItem onClick={handleEditRow}>
                <ListItemIcon>
                  <EditIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('breeding.aiBreedingList.edit')}</ListItemText>
              </MenuItem>
              <MenuItem onClick={handleDeleteRow}>
                <ListItemIcon>
                  <DeleteIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText>{t('breeding.aiBreedingList.delete')}</ListItemText>
              </MenuItem>
            </Menu>

            {/* Pagination row */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mt: 2
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap:1 }}> 
                <Typography variant="body2" sx={{pl:{xs:1,md:3}}} >{t('breeding.common.rowsPerPage')}</Typography>
                <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={15}>15</MenuItem>
                </Select>
              </Box>
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

export default AIBreeding;
