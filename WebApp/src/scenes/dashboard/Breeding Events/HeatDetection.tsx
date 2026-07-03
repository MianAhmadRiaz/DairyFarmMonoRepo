import React, { useEffect, useState ,useRef} from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Modal,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useNavigate } from 'react-router-dom';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import { addHeatDetection } from '../../../shared/services/breeds.services';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';


const HeatDetection = () => {
  const navigate = useNavigate();
  const [date, setDate] = useState('');
  const [reason, setReason] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModal, setOpenModal] = useState(false);
  const [newReason, setNewReason] = useState('');
  const [reasons, setReasons] = useState([
    'Ridding Others',
    'Being Ridden',
    'Bellowing'
  ]);
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });
  const toastId = useRef<Id | null>(null);
  const handleReasonChange = event => {
    const selectedReason = event.target.value;
    if (selectedReason === 'Add New') {
      handleOpenModal(); // Open the modal for adding a new reason
    } else {
      setReason(selectedReason); // Set the selected reason
    }
  };
  const handleTagChange = event => {
    setAnimalId(event.target.value);
  };
  useEffect(() => {
    const loadTags = async () => {
      try {
        const tagsData = await fetchAnimals();
        console.log('Loaded Animals for tagsID =>', tagsData);
        setTags(tagsData);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    loadTags();
  }, []);
  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  const handleAddReason = () => {
    if (newReason.trim() !== '') {
      setReasons([...reasons, newReason.trim()]);
      setNewReason('');
      setOpenModal(false);
      toast.success('Reason added successfully!', {
        position: 'top-right',
        autoClose: 3000,
     //   theme: 'colored'
      });
    }
  };

 
  const handleSaveChanges = async () => {
  if (!animalId || !date || !reason) {
    const warningMsg = "Please fill all the missing required fields";
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(warningMsg);
    }
    return;
  }

  toast.dismiss(); // Remove previous error toast
  setIsLoading(true);
  const params = { animalId, date, reason };

  try {
    await addHeatDetection(params);
    toast.success('New event added successfully!', {
       
        onClose: () => window.location.reload()
    })
   
  } catch (error) {
    console.error('Failed to add new event:', error);
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.error('Failed to add new event!');
    }
  } finally {
    setIsLoading(false);
  }
};

  return (
    <PageContainer title="Heat Detection">
      {/* Back Button */}
      <Typography
         variant="body2" 
        
        sx={{
          cursor: 'pointer',
          color: '#005f73',
          fontWeight: 'bold',
          marginBottom: '10px',
           pl: { xs: 2, sm: 0 },
          fontSize: { xs: '1rem', sm: '0.875rem' },
           marginTop:'10px',
         
        }}
        onClick={() => navigate(-1)}
      >
        ← Back
      </Typography>

      {/* Form Section */}
      <Box
        sx={{
          marginTop: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
            p: { xs: 2, sm: 3, md: 4 },
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              label="Tag Id"
              select
              value={animalId}
              onChange={handleTagChange}
            >
              {tags
                .filter(animal => animal.gender == 'female')
                .map(animal => (
                  <MenuItem key={animal.uuid} value={animal.uuid}>
                    {animal.tagName}
                  </MenuItem>
                ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Date"
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              InputLabelProps={{
                shrink: true
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label="Choose Reason"
              select
              value={reason || ''}
              onChange={handleReasonChange} // ✅ Correct placement
              defaultValue=""
              SelectProps={{
                MenuProps: {
                  PaperProps: {
                    style: {
                      maxHeight: 200,
                      overflowY: 'auto'
                    }
                  }
                }
              }}
            >
              <MenuItem
                value="Add New"
                onChange={handleReasonChange} // Handle selection change
                sx={{ fontWeight: 'bold', color: '#005f73' }}
              >
                Add New
              </MenuItem>
              {reasons.map((reason, index) => (
                <MenuItem key={index} value={reason}>
                  {reason}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
        </Grid>

        <Box
          sx={{
            marginTop: '30px',
            display: 'flex',
            justifyContent: 'flex-start',
            gap: '10px'
          }}
        >
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: '#005f73',
              borderRadius: '12px',
              padding: '5px 30px',
              '&:hover': { backgroundColor: '#007f91' },
              '&:disabled': { backgroundColor: '#bdbdbd' }
            }}
            onClick={handleSaveChanges}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} sx={{ color: "#0F7C8F" }} />
            ) : (
              'Save Changes'
            )}
          </Button>
          <Button
            variant="outlined"
            sx={{
              textTransform: 'none',
              backgroundColor: '#e0e0e0',
              color: '#000',
              borderRadius: '12px',
              padding: '5px 45px',
              border: '1px solid #d6d6d6'
            }}
          >
            Cancel
          </Button>
        </Box>
      </Box>

      {/* Add New Reason Modal */}
      <Modal open={openModal} onClose={handleCloseModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 600,
            bgcolor: 'background.paper',
            boxShadow: 24,
            borderRadius: '8px',
            p: 3
          }}
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="h6" fontWeight="bold">
              Add Reason
            </Typography>
            <IconButton onClick={handleCloseModal}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box
            sx={{
              mt: 2,
              maxHeight: '200px',
              overflowY: 'auto',
              padding: '10px'
            }}
          >
            <ReactQuill
              value={newReason}
              onChange={setNewReason}
              placeholder="Reason"
              style={{ height: '120px', marginBottom: '20px' }}
            />
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '20px'
            }}
          >
            <Button
              variant="outlined"
              onClick={handleCloseModal}
              sx={{
                textTransform: 'none',
                backgroundColor: '#e0e0e0',
                color: '#000',
                borderRadius: '12px',
                padding: '5px 20px',
                border: '1px solid #d6d6d6'
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              onClick={handleAddReason}
              sx={{
                textTransform: 'none',
                backgroundColor: '#005f73',
                '&:hover': { backgroundColor: '#007f91' },
                padding: '10px 30px',
                borderRadius: '12px'
              }}
            >
              Add Reason
            </Button>
          </Box>
        </Box>
      </Modal>
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
      />
    </PageContainer>
  );
};

export default HeatDetection;
