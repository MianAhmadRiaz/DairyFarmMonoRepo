
import React, { useEffect, useState,useRef } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
 
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import CustomPagination from '../../../shared/components/Custom Pagination/CustomPagination';
import {
  fetchProtocolsList,
  registerProtocolEvent
} from '../../../shared/services/breeds.services';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import ProtocolRegistrationModal from './ProtocolRegistrationModal';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';



 const Protocol = () => {

  const navigate = useNavigate();
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  // We track which protocol is selected in the top "Protocols" dropdown
  const [selectedProtocol, setSelectedProtocol] = useState('');
  const [date, setDate] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [tags, setTags] = useState([]);
  const [protocols, setProtocols] = useState([]);
  const [startTime, setStartTime] = useState('');
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });
   const [isLoading, setIsLoading] = useState(false);
  const { isMobile, isCollapsed } = useLayoutShift();
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await fetchAnimals();
        const protocolsData = await fetchProtocolsList();
        setTags(tagsData);
        setProtocols(protocolsData);
      } catch (error) {
        console.error('Failed to load tags:', error);
     
      }
    };

    loadTags();
  }, []);

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;
  const [protocolData, setProtocolData] = useState([]); // Store protocol details
  // 1) Filter rows by selectedProtocol
  const filteredRows = protocolData;

  // 2) Pagination on the filtered rows
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  // Handle page change
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  // Handle when user selects a protocol in the dropdown
  // const handleProtocolChange = (event) => {
  //   setSelectedProtocol(event.target.value);
  //   setCurrentPage(1); // Reset to first page whenever protocol changes
  // };
  

  const handleProtocolChange = event => {
    const selectedUuid = event.target.value;
    setSelectedProtocol(selectedUuid);
    setCurrentPage(1); // Reset pagination

    // Find selected protocol details
    const selectedProtocolData = protocols.find(
      protocol => protocol.uuid === selectedUuid
    );

    if (selectedProtocolData) {
      const newRows = [
        {
          particular: t('breeding.protocol.minDim'),
          hours: selectedProtocolData.min_DIM || '-',
          date: '-',
          time: '-'
        },
        {
          particular: t('breeding.protocol.maxDim'),
          hours: selectedProtocolData.max_DIM || '-',
          date: '-',
          time: '-'
        },
        ...selectedProtocolData.injections.map((injection, index) => ({
          particular: injection.name,
          hours: injection.hours,
          date: injection.date || '-',
          time: injection.time || '-'
        })),
        {
          particular: t('breeding.protocol.aiTime'),
          hours: selectedProtocolData.ai_time || '-',
          date: '-',
          time: '-'
        }
      ];

      setProtocolData(newRows);
    }
  };

  const handleTagChange = event => {
    setAnimalId(event.target.value);
  };

  
  const handleSubmit = async () => {
  if (!selectedProtocol || !animalId || !date || !startTime) {
    const warningMsg = t('breeding.common.fillMissingFields');
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(warningMsg);
    }
    return;
  }

  try {
     setIsLoading(true);
    toast.dismiss(); // Clear previous toast
    const params = {
      name: selectedProtocol,
      animalId: animalId,
      date: date,
      start_time: startTime
    };

    await registerProtocolEvent(params);

    toast.success(t('breeding.protocol.addSuccess'));
    setTimeout(() => {
      navigate(-1);
    }, 3000);
  } catch (error:any) {
    console.error('Error Response:', error.response?.data || error.message);
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.error(t('breeding.protocol.registerError'));
    }
  }
    finally {
    setIsLoading(false); 
  }
};
  return (
    <PageContainer title={t('breeding.protocol.pageTitle')}>
      {/* Back Button */}

       <Typography
        variant="body2"
        sx={{
          cursor: 'pointer',
          color: '#005f73',
          fontWeight: 'bold',
         fontSize: { xs: '1rem', sm: '0.875rem', md: '0.875rem' },
            mb: {xs:'15px',sm:'15px'},
            marginTop:'15px',
             pl:{xs:'10px', md:'0'},

        }}
        onClick={() => navigate(-1)}
      >
        ←  {t('breeding.common.back')}
      </Typography>
<Box
  sx={{
      p: { xs: 2, sm: 3, md: 4},
      mb:2,
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
>
      {/* Form Section */}
      <Box
        sx={{
          marginBottom: '30px',
          borderRadius: '12px',
          //  padding: '20px'
        }}
      >
        <Grid container spacing={4

        }>
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              label={t('breeding.protocol.protocolDate')}
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              label={t('breeding.common.tagId')}
              select
              value={animalId}
              onChange={handleTagChange}
            >
              {tags.map(animal => (
                <MenuItem key={animal.uuid} value={animal.uuid}>
                  {animal.tagName}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* Protocols dropdown. On change, we store the user's selection in state. */}
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              label={t('breeding.protocol.protocols')}
              select
              value={selectedProtocol}
              onChange={handleProtocolChange}
            >
              {protocols.map(protocol => (
                <MenuItem key={protocol.uuid} value={protocol.uuid}>
                  {protocol.name}
                </MenuItem>
              ))}
            </TextField>

        
             {!isMobile && (
    <Button
      variant="contained"
      sx={{
        textTransform: 'none',
        backgroundColor: '#005f73',
        padding: '5px 30px',
         marginLeft: '325px',
         transform: 'translateY(-40px)',
        whiteSpace: 'nowrap',
        borderRadius: '8px',
        '&:hover': { backgroundColor: '#007f91' }
      }}
      onClick={() => setIsModalOpen(true)}
    >
      {t('breeding.protocol.addProtocol')}
    </Button>
  )}
  {isMobile && (
  <Grid item xs={5}>
    <Button
      variant="contained"
      fullWidth
      sx={{
        textTransform: 'none',
        backgroundColor: '#005f73',
        padding: '8px',
        borderRadius: '8px',
        '&:hover': { backgroundColor: '#007f91' },
        mt: 2,
        mb: 0.5
      }}
      onClick={() => setIsModalOpen(true)}
    >
      {t('breeding.protocol.addProtocol')}
    </Button>
  </Grid>
)}
<ProtocolRegistrationModal
  open={isModalOpen}
  onClose={() => setIsModalOpen(false)}
/>
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            md={3.5}
            // sx={{ marginTop: '-30px', marginBottom: '20px' }}
            
  sx={{ mt: isMobile ? 0 : -3, mb: 1 }}
          >
           

         
            <TextField
              fullWidth
              label={t('breeding.protocol.startTime')}
              type="time"
              value={startTime}
              onChange={e => setStartTime(e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
        </Grid>
        <Box
          sx={{
            marginTop: '20px',
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '10px'
            
          }}
        >
          <Button
            variant="contained"
            onClick={handleSubmit}
             disabled={isLoading}
            sx={{
              textTransform: 'none',
              backgroundColor: '#005f73',
              padding: '6px 35px',
              borderRadius: '8px',
              '&:hover': { backgroundColor: '#007f91' }
            }}
          >
            {/* //Register New Protocol Event */}
             {isLoading ? (
             <CircularProgress size={24} sx={{ color: "#0F7C8F" }} />
             ) : (
            t('breeding.protocol.registerNewEvent')
            )}

          </Button>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              backgroundColor: '#e0e0e0',
              borderRadius: '12px',
              color: '#000',
              padding: '6px 55px',
              border: '1px solid #d6d6d6'
            }}
            onClick={() => navigate(-1)}
          >
            {t('breeding.common.cancel')}
          </Button>
        </Box>
      </Box>
   </Box>
      {/* Table Section */}
      <TableContainer component={Paper} sx={{ borderRadius: '12px',  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
           backgroundColor: '#FFFFFF',
 }}>
        <Table>
          <TableHead sx={{backgroundColor: "#F8F9FA"}}>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.protocol.columns.particulars')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.protocol.columns.hours')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.protocol.columns.date')}</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>{t('breeding.protocol.columns.time')}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRows.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.particular}</TableCell>
                <TableCell>{row.hours}</TableCell>
                <TableCell>{row.date}</TableCell>
                <TableCell>{row.time}</TableCell>
              </TableRow>
            ))}
            {filteredRows.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  {/* <CircularProgress size={50}/> */}
                  {t('breeding.protocol.noRowsFoundFor')} <strong>{selectedProtocol}</strong>.

                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
 
      {/* Custom Pagination Component (on the filteredRows.length) */}
        <Box sx={{ px: 2, pb: 2, mt: 2 }}>
      <CustomPagination
        totalItems={filteredRows.length}
        itemsPerPage={rowsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
      </Box>
     </TableContainer>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      //  theme="colored"
      />

    </PageContainer>
  );
};

export default Protocol;
