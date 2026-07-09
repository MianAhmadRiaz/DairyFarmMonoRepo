import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  useTheme
} from '@mui/material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useTranslation } from 'react-i18next';
import { fetchAnimals } from '../../../shared/services/herdinfo.services';
import { AnimalInfoRow } from '../../../shared/services/herdinfo.services';
import CustomPagination from '../../../shared/components/Custom Pagination/CustomPagination';
import { tokens } from '../../../shared/theme/theme';
import PageContainer from '../../../shared/components/Layout/PageContainer';



function ViewCalves() {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [calves, setCalves] = useState<AnimalInfoRow[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [isLoading, setIsLoading] = useState(true);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const open = Boolean(anchorEl);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    const fetchCalvesData = async () => {
      try {
        setIsLoading(true);
        const response = await fetchAnimals(true); 
        const calvesAnimals = response?.filter((animal) => animal.is_calve === true);
        setCalves(calvesAnimals);
      } catch (error) {
        console.error("Error fetching calves data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCalvesData();
  }, []);

  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page + 1);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCalves = calves.slice(startIndex, endIndex);

  const filteredCalves = paginatedCalves.filter(calf =>
    calf.tagName && calf.tagName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <PageContainer title={t('herd.viewCalves.title')} maxWidth={1200}>
      <Box
  sx={{

    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',

  }}
>

     <Box sx={{p: { xs: 2, sm: 3, md: 3}}}>
      {/* Search + Download Controls */}
      <Box className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-2">
        <TextField
          variant="outlined"
          placeholder={t('herd.viewCalves.searchByCalfId')}
          fullWidth
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          disabled={isLoading}
          sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f8f8',
                 paddingTop:'2px'
          }}
                 
        />

<Button
  variant="contained"
  endIcon={<MoreVertIcon />}
  disabled={isLoading}
  onClick={handleMenuClick}
  sx={{
    backgroundColor: '#005f73',
    color: '#fff',                   // White text
    textTransform: 'capitalize',     // Capitalize label
    borderRadius: 2,                 // 2 = 16px in MUI's spacing scale
    px: 6,
    py: 2,                           // MUI Button uses py (paddingY) units
    '&:hover': {
      backgroundColor: '#007f91',    // Hover background color
    },
  }}
>
  {t('herd.viewCalves.download')}
</Button>
</Box>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleMenuClose}
          PaperProps={{ style: { maxHeight: 48 * 4.5, width: '200px' } }}
        >
          <MenuItem onClick={handleMenuClose}>{t('herd.viewCalves.downloadPdf')}</MenuItem>
          <MenuItem onClick={handleMenuClose}>{t('herd.viewCalves.downloadCsv')}</MenuItem>
        </Menu>
      </Box>

      {/* Table */}
      <Box className="overflow-x-auto" >
        <TableContainer component={Paper} className="rounded-xl min-w-[800px]">
          <Table>
            <TableHead sx={{backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'}}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.srNo')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.motherId')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.fatherId')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.calfSex')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.calfId')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.calfBirthDate')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.calfBirthWeight')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.clickToAssignTag')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.remove')}</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>{t('herd.viewCalves.sold')}</TableCell>
              </TableRow>
              
            </TableHead>

            
            <TableBody>
  {isLoading ? (
    <TableRow>
      <TableCell colSpan={4} />
      <TableCell colSpan={2} align="center">
        <CircularProgress size={50} sx={{ color: "#0F7C8F", my: 2 }} />
      </TableCell>
      <TableCell colSpan={4} />
    </TableRow>
  ) : filteredCalves.length === 0 ? (
    <TableRow>
      <TableCell colSpan={10} align="center">
        {t('herd.viewCalves.noCalves')}
      </TableCell>
    </TableRow>
  ) : (
    filteredCalves.map((calf, index) => (
      <TableRow key={calf.uuid}>
        <TableCell>{startIndex + index + 1}</TableCell>
        <TableCell>{calf.mother?.tag?.name || calf.mother?.name || t('herd.viewCalves.na')}</TableCell>
        <TableCell>{calf.father?.tag?.name || calf.father?.name || t('herd.viewCalves.na')}</TableCell>
        <TableCell>{calf.gender}</TableCell>
        <TableCell>{calf.tagName}</TableCell>
        <TableCell>{calf.birthdate ? calf.birthdate.split('T')[0] : t('herd.viewCalves.na')}</TableCell>
        <TableCell>{calf.animalWeight || t('herd.viewCalves.na')}</TableCell>
        <TableCell>
          <Button variant="outlined" size="small" disabled={isLoading}>
            {t('herd.viewCalves.assignTag')}
          </Button>
        </TableCell>
        <TableCell>
          <Button variant="outlined" color="error" size="small" disabled={isLoading}>
            {t('herd.viewCalves.remove')}
          </Button>
        </TableCell>
        <TableCell>{calf.isDeleted ? t('common.yes') : t('common.no')}</TableCell>
      </TableRow>
    ))
  )}
</TableBody>

          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <Box sx={{ px: 2, pb: 2, mt: 2 }}>
        <CustomPagination
          totalItems={calves.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={handlePageChange}
        />
      </Box>
      </Box>
    </PageContainer>

  );
}

export default ViewCalves;
