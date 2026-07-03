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
  CircularProgress,
  Alert
 // Snackbar
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import { fetchPenList } from '../../../shared/services/herdinfo.services';
import { addDryOffEvent } from '../../../shared/services/breeds.services';
import { ToastContainer, toast, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';



const DryOff: React.FC = () => {
  const navigate = useNavigate();

  const [category, setCategory] = useState<'Add' | 'Remove'>('Add');

  const [addTagId, setAddTagId] = useState('');
  const [addPenId, setAddPenId] = useState('');
  const [dryOffDate, setDryOffDate] = useState('');
  const [reason, setReason] = useState('');

  const [removeTagId, setRemoveTagId] = useState('');
  const [removePenId, setRemovePenId] = useState('');
  const [removalDate, setRemovalDate] = useState('');
  const [removeReason, setRemoveReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastId = useRef<Id | null>(null);



  const [tags, setTags] = useState([]);
  const [penList, setPenList] = useState([]);
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });

  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const data = await fetchAnimals();
        const pensData = await fetchPenList();
        if (!Array.isArray(pensData)) throw new Error("Invalid response format");
        setPenList(pensData);
        if (!Array.isArray(data)) throw new Error("Invalid response format");
        setTags(data);
      } catch (error) {
        console.error('Failed to load animal tags:', error);
      }
    };
    loadAnimals();
  }, []);


  const handleBack = () => {
    navigate(-1);
  };

  

  const handleAddSubmit = async () => {
  if (!addTagId || !addPenId || !dryOffDate || !reason) {
    const msg = "Please fill all the missing required fields";
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(msg);
    }
    return;
  }

  toast.dismiss();
  setIsSubmitting(true);

  const data = {
    category: 'add',
    animalId: addTagId,
    penId: addPenId,
    date: dryOffDate,
    reason
  };

  try {
    await addDryOffEvent(data);
    toast.success('New event added successfully!');
    setTimeout(() => window.location.reload(), 3000);
  } catch (error) {
    toast.error('Failed to add new event!');
    console.error('Failed to add new event:', error);
  } 
finally {
    setIsSubmitting(false);
  }
};



  const handleRemoveSubmit = async () => {
  if (!removeTagId || !removePenId || !removalDate || !removeReason) {
    const msg = "Please fill all the missing required fields";
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(msg);
    }
    return;
  }

  toast.dismiss();
  setIsSubmitting(true);

  const newRemoveData = {
    category: 'remove',
    animalId: removeTagId,
    penId: removePenId,
    date: removalDate,
    reason: removeReason
  };

  try {
    await addDryOffEvent(newRemoveData);
    toast.success('Event removed successfully!');
    setTimeout(() => window.location.reload(), 3000);
  
   } catch (error: any) {
  console.error("AddAnimal => error in handleSubmit =>", error);
  toast.error('Failed to remove event!');

  const backendMessage =
    error?.response?.data?.message || "Failed to add animal. Please try again.";

  if (toastId.current === null || !toast.isActive(toastId.current)) {
    toastId.current = toast.warning(`🔶 Backend Validation: ${backendMessage}`);
  }
}
  finally {
    setIsSubmitting(false);
  }
};


  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <PageContainer title="Dry Off">
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{ mb: 2, color: '#005f73', textTransform: 'none', fontWeight: 'bold' }}
      >
        Back
      </Button>

        <Card sx={{  p: { xs: 2, sm: 3, md: 1 },
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
}}>  
        <CardContent sx={{ p: { xs: 2, md: 3 } }}>
          <Box sx={{ mb: 3, maxWidth: 300 }}>
            <FormControl fullWidth>
              <InputLabel id="category-label">Category</InputLabel>
              <Select
                labelId="category-label"
                value={category}
                label="Category"
                onChange={(e) => setCategory(e.target.value as 'Add' | 'Remove')}
              >
                <MenuItem value="Add">Add</MenuItem>
                <MenuItem value="Remove">Remove</MenuItem>
              </Select>
            </FormControl>
          </Box>

           <Box sx={{ backgroundColor: '#EAF6F5', borderRadius: 2, p: 2, mb: 2 }}> 
            {category === 'Add' && (
              <Grid container spacing={2} mb={1}>
                <Grid item xs={12} sm={6} md={3.5}>
                  <TextField
                    fullWidth
                    label="Tag Id"
                    select
                    value={addTagId}
                    onChange={(e) => setAddTagId(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  >
                    {tags.filter((animal) => animal.gender === 'female').map((animal) => (
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
                    value={addPenId}
                    onChange={(e) => setAddPenId(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  >
                    {penList.map((pen) => (
                      <MenuItem key={pen.uuid} value={pen.uuid}>
                        {pen.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3.5}>
                  <TextField
                    label="Dry off Date"
                    type="date"
                    value={dryOffDate}
                    onChange={(e) => setDryOffDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12} md={3.5}>
                  <FormControl fullWidth>
                    <InputLabel id="reason-label">Reason</InputLabel>
                    <Select
                      labelId="reason-label"
                      label="Reason"
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                    >
                      <MenuItem value="less milk">Less Milk</MenuItem>
                      <MenuItem value="less milk + non pregnant">Less Milk + Non Pregnant</MenuItem>
                      <MenuItem value="less milk + udder problem">Less Milk + Udder Problem</MenuItem>
                      <MenuItem value="pregnant (due for calving)">Pregnant (Due For Calving)</MenuItem>

                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}

            {category === 'Remove' && (
              <Grid container spacing={2} mb={1}>
                <Grid item xs={12} sm={6} md={3.5}>
                  <TextField
                    fullWidth
                    label="Tag Id"
                    select
                    value={removeTagId}
                    onChange={(e) => setRemoveTagId(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  >
                    {tags.filter((animal) => animal.gender === 'female').map((animal) => (
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
                    value={removePenId}
                    onChange={(e) => setRemovePenId(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  >
                    {penList.map((pen) => (
                      <MenuItem key={pen.uuid} value={pen.uuid}>
                        {pen.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} md={3.5}>
                  <TextField
                    label="Removal Date"
                    type="date"
                    value={removalDate}
                    onChange={(e) => setRemovalDate(e.target.value)}
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Reason"
                    multiline
                    minRows={3}
                    value={removeReason}
                    onChange={(e) => setRemoveReason(e.target.value)}
                    InputLabelProps={{ shrink: true }}
                  />
                </Grid>
              </Grid>
            )}
           </Box> 

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            {category === 'Add' && (
              <Button
                variant="contained"
                  disabled={isSubmitting}

                sx={{
                  backgroundColor: '#005f73',
                  textTransform: 'none',
                  borderRadius: '12px',
                  padding: '8px 50px',
                  '&:hover': { backgroundColor: '#007f91' }
                }}
                onClick={handleAddSubmit}
              >
                  {/* {isSubmitting ? 'Submitting...' : 'Add'} */}
                  {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
                  ) : (
                  'Add' // or 'Remove'
                   )}
              </Button>
            )}

            {category === 'Remove' && (
              <Button
                variant="contained"
                                  disabled={isSubmitting}

                sx={{
                  backgroundColor: '#005f73',
                  textTransform: 'none',
                  padding: '8px 40px',
                  borderRadius: '12px'
                }}
                onClick={handleRemoveSubmit}
              >
                                  {/* {isSubmitting ? 'Submitting...' : 'Remove'} */}
              
               {isSubmitting ? (
                  <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
                  ) : (
                  'Remove' // or 'Remove'
                   )}

              </Button>
            )}

            <Button
              variant="outlined"
              // color="secondary"
              sx={{
                textTransform: 'none',
                borderRadius: '12px',
                padding: '8px 40px',
                backgroundColor: '#e0e0e0',
                color: '#000',
                border: '1px solid #d6d6d6'
              }}
              onClick={handleCancel}
            >
              Cancel
            </Button>
          </Box>
        </CardContent>
       </Card>  
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

export default DryOff;
