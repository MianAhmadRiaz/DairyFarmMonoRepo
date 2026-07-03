import React, { useEffect, useState,useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Button,
  Snackbar,
  CircularProgress,
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import {
  fetchPenList
} from '../../../shared/services/herdinfo.services';
import { addAbortionEvent } from '../../../shared/services/breeds.services';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';


interface AddAbortionEventProps {
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

const AddAbortionEvent: React.FC<AddAbortionEventProps> = ({
  onSave,
  onCancel
}) => {
  const navigate = useNavigate();

  // Form states
  const [tagId, setTagId] = useState('');
  const [penId, setPenId] = useState('');
  const [tags, setTags] = useState([]);
  const [penList, setPenList] = useState([]);
  const [abortionDate, setAbortionDate] = useState('');
  const [milkable, setMilkable] = useState('');
  const [cost, setCost] = useState('');
  const [comments, setComments] = useState('');
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastId = useRef<Id | null>(null);
  // Load animal tags on component mount
  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const tagsData = await fetchAnimals();
        const pensData = await fetchPenList();
        if (!Array.isArray(pensData))
          throw new Error('Invalid response format');
        setPenList(pensData);
        if (!Array.isArray(tagsData))
          throw new Error('Invalid response format');
        setTags(tagsData);
        console.log('Loaded animal tags>', tagsData);
      } catch (error) {
        console.error('Failed to load animal tags:', error);
      }
    };
    loadAnimals(), [];
  }, []);
 
        const handleSave = async () => {
  if (!tagId || !penId || !abortionDate || !milkable || !cost || !comments) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn('Please fill all the missing required fields');
    }
    return;
  }

  setIsSubmitting(true);
  try {
    const formData = {
      animalId: tagId,
      penId,
      date: abortionDate,
      milkable: milkable === 'Yes',
      cost: parseFloat(cost),
      comments
    };

    await addAbortionEvent(formData);
    toast.dismiss(); 
    toast.success('New Event Added Successfully!', {
      autoClose: 3000,
      onClose: () => window.location.reload()
    });
  } catch (error) {
     if (toastId.current === null || !toast.isActive(toastId.current)) {
        toastId.current = toast.error("Failed to remove animal. Please try again.");
      }
    // toast.error('Failed to Add Event!');
    console.error('Add Abortion Event error:', error);
  } finally {
    setIsSubmitting(false);
  }
};
        
        
        

  const handleCancel = () => {
    // If you also want the Cancel button to do "go back":
    if (onCancel) {
      onCancel();
    } else {
      navigate(-1); // e.g., go back one page
    }
  };

  const handleBack = () => {
    // go back one step in the browser history
    navigate(-1);
  };

  return (
    <PageContainer title="Abortion / Add New Event">
      {/* Back Button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
         onClick={handleBack}


        sx={{
          // mb: 2,
          color: '#005f73',
          textTransform: 'none',
          fontWeight: 'bold',
          ml:1,
        }}
      >
        Back
      </Button>

        <CardContent sx={{pt:1.5}}>
          {/* Fields */}
          <Box
   sx={{
     p: { xs: 2, sm: 3, md: 4},
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3.5}>
              <TextField
                fullWidth
                label="Tag Id"
                select
                value={tagId}
                onChange={e => setTagId(e.target.value)}
                InputLabelProps={{ shrink: true }}
              >
                {tags.map(animal => (
                  <MenuItem key={animal.uuid} value={animal.uuid}>
                    {animal.tagName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Pen Id"
                select
                value={penId}
                onChange={e => setPenId(e.target.value)}
                InputLabelProps={{ shrink: true }}
              >
                {penList.map(pen => (
                  <MenuItem key={pen.uuid} value={pen.uuid}>
                    {pen.name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Abortion Date"
                type="date"
                value={abortionDate}
                onChange={e => setAbortionDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="milkable-label">Milkable</InputLabel>
                <Select
                  labelId="milkable-label"
                  label="Milkable"
                  value={milkable}
                  onChange={e => setMilkable(e.target.value)}
                >
                  <MenuItem value="Yes">Yes</MenuItem>
                  <MenuItem value="No">No</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} md={4}>
              <TextField
                label="Cost"
                placeholder="Enter Cost"
                value={cost}
                onChange={e => setCost(e.target.value)}
                fullWidth
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Enter your comments"
                multiline
                rows={4}
                value={comments}
                onChange={e => setComments(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Action Buttons */}
          <Box
            mt={3}
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'flex-start'
            }}
          >
            <Button
              variant="contained"
              sx={{ backgroundColor: '#005f73',
                  textTransform: 'none',
                 borderRadius: '12px',
    padding: '8px 40px',
    '&:hover': { backgroundColor: '#007f91' },
    '&:disabled': { backgroundColor: '#bdbdbd' }
               }}
              disabled={isSubmitting}
              onClick={handleSave}
            >
             {isSubmitting ? (
    <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
  ) : (
    'Add New'
  )}
            </Button>
            <Button
              variant="outlined"
               sx={{
               textTransform: 'none',
                backgroundColor: '#e0e0e0',
                color: '#000',
               borderRadius: '12px',
               padding: '8px 40px',
                border: '1px solid #d6d6d6'
            }}
              disabled={isSubmitting}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
          </Box>
        </CardContent>
  
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

export default AddAbortionEvent;
