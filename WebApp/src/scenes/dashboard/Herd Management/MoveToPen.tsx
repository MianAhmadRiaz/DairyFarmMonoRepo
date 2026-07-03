import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Button,
  Grid,
  InputAdornment,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import React, { useEffect, useState,useRef } from 'react';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import { tokens } from '../../../shared/theme/theme';
// Define modules for ReactQuill
const quillModules = {
  toolbar: [
    [{ header: [1, 2, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
  ]
};

import useAnimalData from './hooks/useAnimalData';
import useAnimalAndPenIds from './hooks/useGetAnimalId';
import { fetchPenHistory, moveToPen } from '../../../shared/services/herdinfo.services';
import CustomPagination from '../../../shared/components/Custom Pagination/CustomPagination';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from 'react-router-dom';

type Animal = {
  uuid: string;
  tagId: string;
  // Add other properties as needed
};

 const MoveToPen = () => {
  const [recentEntries, setRecentEntries] = useState<any[]>([]);
  const [selectedTagId, setSelectedTagId] = useState<string>('');
  const [selectedPenId, setSelectedPenId] = useState<string>('');
  const [date, setDate] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [reason, setReason] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
 const toastId = useRef<Id | null>(null);
  
  const { tags, pens, animals } = useAnimalData() as { tags: any[]; pens: any[]; animals: Animal[] };
  const { animalId, penId } = useAnimalAndPenIds(animals, selectedTagId);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setHistoryLoading(true);
        const historyData = await fetchPenHistory();
        setRecentEntries(historyData);
      } catch (error) {
        console.error('Error loading pen history:', error);
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setError('');

  const isFormValid = selectedTagId && selectedPenId && date && reason;
  if (!isFormValid) {
    const warningMsg = "Please fill all the missing required fields";
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(warningMsg);
    }
    return;
  }

  try {
    setLoading(true);
    toast.dismiss(); // Clear old toasts

    const payload = {
      oldPenId: String(penId),
      animalId: String(animalId),
      newPenId: selectedPenId,
      date,
      reason,
    };

    await moveToPen(payload);

    const historyData = await fetchPenHistory();
    setRecentEntries(historyData);

    toast.success("Pen move registered successfully!");

    // Reset fields
    setSelectedTagId('');
    setSelectedPenId('');
    setDate('');
    setReason('');
  } catch (err) {
    console.error('API Error:', err);
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.error("Failed to register pen move. Please try again.");

    }

  } finally {
    setLoading(false);
    setHistoryLoading(false);
  }
};

 

  return (
    <PageContainer title="Move to Pen" maxWidth={1200}>
       {/* Form Section */}
      <Box sx={{
         padding: '20px', 
         backgroundColor: theme.palette.background.paper,
        borderRadius: '8px',
        marginBottom: '30px',
        position: 'relative'
      }}>
         
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Tag ID"
                variant="outlined"
                value={selectedTagId}
                onChange={(e) => setSelectedTagId(e.target.value)}
                disabled={loading}
                sx={{ marginLeft:{xs:'-5px',md:'2px'} }}
              >
                {tags.map((tag) => (
                  <MenuItem key={tag.uuid} value={tag.uuid}>
                    {tag.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                select
                label="Move To"
                variant="outlined"
                value={selectedPenId}
                onChange={(e) => setSelectedPenId(e.target.value)}
                disabled={loading}
                sx={{ marginLeft: {xs:'-5px',md:'4px'} }}
              >
                <MenuItem value="">Select Pen</MenuItem>
                {pens.map((pen) => (
                  <MenuItem key={pen.uuid} value={pen.uuid}>
                    {pen.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={loading}
                sx={{ marginLeft: '-4px' }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
    <Typography marginLeft="10px" fontWeight="bold" gutterBottom>
      Reason
    </Typography>
    <TextField
      fullWidth
      multiline
      rows={4}
      value={reason}
      onChange={(e) => setReason(e.target.value)}
      placeholder="Enter the reason here..."
      variant="outlined"
      disabled={loading}
      sx={{
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        '& .MuiOutlinedInput-root': {
          padding: '10px'
        }
      }}
    />
  </Grid>

          </Grid>

          {error && (
            <Typography color="error" sx={{ mt: 2, ml: 2 }}>
              {error}
            </Typography>
          )}

          <Box mt={3} display="flex" justifyContent="flex-start" gap={2}>
            <Button
              type="submit"
              variant="contained"
              disabled={loading}
              sx={{
                backgroundColor: '#005f73',
                color: '#ffffff',
                textTransform: 'none',
                padding: '7px 25px',
                borderRadius: '12px',
                marginLeft: '10px'
              }}
            >
            
                 {loading ? <CircularProgress size={24} sx={{color:"#0F7C8F"}} /> : "Move"}
            </Button>
            <Button
              variant="outlined"
              disabled={loading}
              sx={{
                color: '#6c757d',
                borderColor: '#d6d6d6',
                textTransform: 'none',
                padding: '8px 25px',
                borderRadius: '12px',
                backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#CECECE'
              }}
              onClick={() => {
                // Clear all form fields
                setSelectedTagId('');
                setSelectedPenId('');
                setDate('');
                setReason('');
                setError('');
              }}
            >
              Cancel
            </Button>
          </Box>
        </form>
       </Box> 
      {/* Recent Entries Section */}
      <Box sx={{ 

        backgroundColor: theme.palette.background.paper,
        borderRadius: '8px', 
        boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0, 0, 0, 0.3)' : '0 4px 12px rgba(0, 0, 0, 0.1)',
        position: 'relative',
         mt: 4,
         mb:3
      }}>
       
        <Box sx={{ px: 2, pt: 2 }}>
        <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight="bold" sx={{ marginLeft: '10px' }}>
            Recent Entries
          </Typography>
          <TextField
            variant="outlined"
            placeholder="Search"
            size="small"
            disabled={historyLoading}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              )
            }}
          />
          </Box>
        </Box>
      
        <TableContainer component={Paper} sx={{ borderRadius: '8px', boxShadow: 'none',width:'100%',
         }}>
          <Table sx={{ width: '100%' }}>
            <TableHead sx={{backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'}}>
              <TableRow >
                <TableCell sx={{ fontWeight: 'bold' }}>SR #</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Animal ID</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>New Pen</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Reason</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Old Pen</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {historyLoading ? (
    <TableRow>
      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
        <CircularProgress size={50} sx={{ color: "#0F7C8F" }} />
      </TableCell>
    </TableRow>
  ) : recentEntries.length === 0 ? (
    <TableRow>
      <TableCell colSpan={6} align="center">
        No entries found
      </TableCell>
    </TableRow>
  ) : (
    recentEntries
      .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
      .map((entry, index) => {
        const animal = animals.find(a => a.uuid === entry.animalId);
        return (
          <TableRow key={entry.uuid}>
            <TableCell>{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
            <TableCell>
              {tags.find(tag => tag.uuid === animal?.tagId)?.name || 'N/A'}
            </TableCell>
            <TableCell>{entry.newPen?.name}</TableCell>
            <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
            <TableCell dangerouslySetInnerHTML={{ __html: entry.reason }} />
            <TableCell>{entry.oldPen?.name}</TableCell>
          </TableRow>
        );
      })
  )}
</TableBody>

          </Table>
        </TableContainer>
     <Box sx={{ px: 2, pb: 2, mt: 2 }}>
        <CustomPagination
          totalItems={recentEntries.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={(event, page) => setCurrentPage(page)}
        />
          </Box>
      </Box>
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
       // theme="colored"
      />

    </PageContainer>

  );
};

export default MoveToPen;