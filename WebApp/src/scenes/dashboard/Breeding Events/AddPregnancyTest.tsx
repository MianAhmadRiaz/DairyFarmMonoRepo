import React, { useState, useEffect,useRef } from 'react';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Button,
  Typography,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import {
  addPregnancyEvent,
  fetchPregnancyList
} from '../../../shared/services/breeds.services';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';

interface PregnancyHistory {
  uuid: string;
  breed_date: string;
  breed_with: string;
  pg_days: number;
  exp_dryoff_date: string;
  prev_test_date: string;
  exp_calving_date: string;
}

const AddPregnancyTest = () => {
  const navigate = useNavigate();

  // State variables
  const [tagId, setTagId] = useState('');
  const [checkDate, setCheckDate] = useState('');
  const [cost, setCost] = useState('');
  const [pregnancyResult, setPregnancyResult] = useState('');
  const [technician, setTechnician] = useState('');
  const [pTestTechnique, setPTestTechnique] = useState('');
  const [recheck, setRecheck] = useState('');
  const [tags, setTags] = useState([]);
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });
  const [pregnancyTests, setPregnancyTests] = useState([]);

  const [pregnancyHistory, setPregnancyHistory] = useState(null);
  const [loading, setLoading] = useState(false);
  const toastId = useRef<Id | null>(null);

  useEffect(() => {
    const fetchPregnancyHistory = async () => {
      try {
        const data = await fetchPregnancyList();
        console.log('Fetched pregnancy history:', data);
        setPregnancyHistory(data);
      } catch (error) {
        console.error('Failed to fetch pregnancy history:', error);
        setPregnancyHistory(null);
      }
    };

    if (tagId) fetchPregnancyHistory();
  }, [tagId]);
  // Hardcoded technicians
  const technicians = [
    { id: 'tech1', name: 'John Doe' },
    { id: 'tech2', name: 'Jane Smith' },
    { id: 'tech3', name: 'Michael Johnson' }
  ];

  // Load animal tags on component mount
  useEffect(() => {
    const loadAnimals = async () => {
      try {
        const data = await fetchAnimals();
        if (!Array.isArray(data)) throw new Error('Invalid response format');
        setTags(data);
        console.log('Loaded animal tags:', data);
      } catch (error) {
        console.error('Failed to load animal tags:', error);
      }
    };
    loadAnimals();
  }, []);

  //Load history of pregnancy tests
  useEffect(() => {
    const loadPregnancyTest = async () => {
      if (!tagId) return; // Don't call API if tagId is empty
      try {
        const pregnancyTests = await fetchPregnancyList(tagId);
        if (!Array.isArray(pregnancyTests))
          throw new Error('Invalid response format');
        setPregnancyTests(pregnancyTests);
        console.log('Loaded pregnancy tests:', pregnancyTests);
      } catch (error) {
        console.error('Failed to load pregnancy tests:', error);
      }
    };
    loadPregnancyTest();
  }, []);

  const handleSaveChanges = async () => {
  if (
    !tagId ||
    !checkDate ||
    !cost ||
    !pregnancyResult ||
    !technician ||
    !pTestTechnique ||
    !recheck
  ) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warn('Please fill all the missing required fields');
    }
    return;
  }

  const formattedDate = checkDate
    ? new Date(checkDate).toISOString().split('T')[0]
    : null;

  const params = {
    animalId: tagId,
    date: formattedDate,
    cost: Number(cost),
    result: pregnancyResult.toLowerCase(),
    technique: pTestTechnique,
    tech: technician,
    recheck: recheck === 'Yes',
    breed_date: pregnancyHistory?.breed_date,
    prev_test_date: pregnancyHistory?.prev_test_date,
    exp_dryoff_date: pregnancyHistory?.exp_dryoff_date,
    exp_calving_date: pregnancyHistory?.exp_calving_date,
    breed_with: pregnancyHistory?.breed_with,
    pg_days:
      pregnancyHistory?.pg_days ??
      (pregnancyHistory?.breed_date && formattedDate
        ? Math.max(
            0,
            Math.round(
              (new Date(formattedDate).getTime() -
                new Date(pregnancyHistory.breed_date).getTime()) /
                (1000 * 60 * 60 * 24)
            )
          )
        : 0),
  };

  setLoading(true);
  try {
    await addPregnancyEvent(params);
    toast.dismiss(); // Remove old error toast
    toast.success('Pregnancy test added successfully!', {
      onClose: () => window.location.reload()
    });
  } catch (error:any) {
    // toast.error(
    //   `Error: ${error.response?.data?.message || 'Failed to add test'}`
    // );
    if (toastId.current === null || !toast.isActive(toastId.current)) {
  toastId.current = toast.error('Failed to Add Event!');
}

    console.error('Server Response:', error.response?.data);
  } finally {
    setLoading(false);
  }
};

  return (
    <PageContainer title="Pregnancy Test / Add New Event">
      <Typography
        variant="body2"
        sx={{
          cursor: 'pointer',
          color: '#005f73',
          fontWeight: 'bold',
          marginBottom: '20px'
        }}
         onClick={() => navigate(-1)}
      >
        ← Back
      </Typography>

      <Box
        sx={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          padding: '20px',
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

        }}
      >
        <Grid container spacing={3}>
          {/* Tag ID Dropdown */}
          <Grid item xs={12} sm={6} md={6}>
            <TextField
              fullWidth
              label="Tag Id"
              select
              value={tagId}
              onChange={e => setTagId(e.target.value)}
              InputLabelProps={{ shrink: true }}
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

          {/* Check Date */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Check Date"
              type="date"
              value={checkDate}
              onChange={e => setCheckDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          {/* Cost */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Cost in Pkr"
              type="number"
              value={cost}
              onChange={e => setCost(e.target.value)}
            />
          </Grid>

          {/* Pregnancy Result */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Pregnancy Result"
              select
              value={pregnancyResult}
              onChange={e => setPregnancyResult(e.target.value)}
            >
              <MenuItem value="Positive">Positive</MenuItem>
              <MenuItem value="Negative">Negative</MenuItem>
            </TextField>
          </Grid>

          {/* Technician Dropdown (Hardcoded) */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Technician"
              select
              value={technician}
              onChange={e => setTechnician(e.target.value)}
            >
              {technicians.map(tech => (
                <MenuItem key={tech.id} value={tech.name}>
                  {tech.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          {/* P-Test Technique */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="P-Test Technique"
              select
              value={pTestTechnique}
              onChange={e => setPTestTechnique(e.target.value)}
            >
              <MenuItem value="by hand">By Hand</MenuItem>
              <MenuItem value="ultrasound">Ultrasound</MenuItem>
            </TextField>
          </Grid>

          {/* Recheck Option */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Recheck"
              select
              value={recheck}
              onChange={e => setRecheck(e.target.value)}
            >
              <MenuItem value="Yes">Yes</MenuItem>
              <MenuItem value="No">No</MenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* history display section */}
        <Box
          sx={{
            marginTop: '20px',
            padding: '20px',
            backgroundColor: '#e0f7fa',
            borderRadius: '12px'
          }}
        >
          <Typography variant="h6" fontWeight="bold">
            History
          </Typography>

          {!pregnancyHistory ? (
            <Typography color="text.secondary">
              No pregnancy history found.
            </Typography>
          ) : (
            <Grid
              container
              spacing={3}
              sx={{
                marginBottom: '10px',
                borderBottom: '1px solid #ddd',
                paddingBottom: '10px'
              }}
            >
              <Grid item xs={6}>
                <Typography fontWeight="bold">Breed Date</Typography>
                <Typography color="text.secondary">
                  {new Date(pregnancyHistory.breed_date).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontWeight="bold">Breed With</Typography>
                <Typography color="text.secondary">
                  {pregnancyHistory.breed_with}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontWeight="bold">PG Days</Typography>
                <Typography color="text.secondary">
                  {pregnancyHistory.pg_days}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontWeight="bold">Expected Dryoff Date</Typography>
                <Typography color="text.secondary">
                  {new Date(
                    pregnancyHistory.exp_dryoff_date
                  ).toLocaleDateString()}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontWeight="bold">Previous Ptest Date</Typography>
                <Typography color="text.secondary">
                  {pregnancyHistory.prev_test_date
                    ? new Date(
                        pregnancyHistory.prev_test_date
                      ).toLocaleDateString()
                    : 'N/A'}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography fontWeight="bold">Expected Calving Date</Typography>
                <Typography color="text.secondary">
                  {new Date(
                    pregnancyHistory.exp_calving_date
                  ).toLocaleDateString()}
                </Typography>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Buttons */}
        <Box sx={{ marginTop: '30px', display: 'flex', gap: '10px' }}>
          <Button
            variant="contained"
            sx={{ backgroundColor: '#005f73' }}
            onClick={handleSaveChanges}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
            ) : (
              'Save'
            )}
          </Button>
          <Button variant="outlined">Cancel</Button>
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
/>

    </PageContainer>
  );
};

export default AddPregnancyTest;
