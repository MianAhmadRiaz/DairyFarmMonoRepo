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
  Alert
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircularProgress from '@mui/material/CircularProgress';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import { addAiBreedingEvent, addBullBreedingEvent, fetchBullBreedingList, fetchBullList } from '../../../shared/services/breeds.services';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';


const AddBullBreedingEvent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // Form states
  
  const [date, setDate] = useState('');
  const [bullId, setBullId] = useState('');
  const [doubleDose, setDoubleDose] = useState('');
  const [comments, setComments] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [tags, setTags] = useState([]);
  const [bulls, setBulls] = useState([]);
  const [alert, setAlert] = useState({open: false, type: '', message: ''});
  const [isLoading, setIsLoading] = useState(false);
  const toastId = useRef<Id | null>(null);

  useEffect(() => {
        const loadTags = async () => {
          try {
            const tagsData = await fetchAnimals();
            console.log("Loaded Animals for tagsID =>", tagsData);
            setTags(tagsData);
          } catch (error) {
            console.error('Failed to load tags:', error);
          }
        };
    
        loadTags();
      }, []);

  useEffect(() => {
    const loadBulls = async () => {
      try {
        const bullsData = await fetchBullList();
        console.log("Loaded Animals for bulls data =>", bullsData);
        setBulls(bullsData);
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    loadBulls();
  }, []);

  

  const handleAddNew = async() => {
     if (
          !animalId ||
          !date ||
          !bullId ||
          !doubleDose ||
          !comments
        ) {
          if (toastId.current === null || !toast.isActive(toastId.current)) {
            toastId.current = toast.warn(t('breeding.common.fillMissingFields'));
          }
          return;
        }
    
  setIsLoading(true);
    try {
    const data = {
      animalId,
      date,
      bullId,
      double_dose: doubleDose === 'Yes',
      comments
    };
      await addBullBreedingEvent(data);
        toast.dismiss(); // Remove previous error toast
            toast.success(t('breeding.bullBreedingAdd.addSuccess'), {
              onClose: () => window.location.reload()
            });
          } catch (error) {
             if (toastId.current === null || !toast.isActive(toastId.current)) {
                toastId.current = toast.error(t('breeding.bullBreedingAdd.addError'));
              }
            // toast.error('Failed to Add Bull Breeding Event!');
            console.error('Add AI error:', error);
          } finally {
            setIsLoading(false);
          }
        };
      
  
  
  const handleCancel = () => {
    // If you want to just go back one page:
    navigate(-1);
  };
  const handleTagChange = (event) => {
    setAnimalId(event.target.value);
  };  
  const handleBullId = (event) => {
    setBullId(event.target.value);
  };  

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <PageContainer title={t('breeding.bullBreedingAdd.pageTitle')}>
      {/* Back button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          ml:{xs:2,sm:4,md:2.5},
          color: '#005f73',
          textTransform: 'none',
          fontWeight: 'bold'
        }}
      >
        {t('breeding.common.back')}
      </Button>

      {/* Main Card */}

        <CardContent sx={{ p: { xs: 2, md: 2.5 } }}>
          <Box
  sx={{
  
     p: { xs: 2, sm: 3, md: 4},
    backgroundColor: "#FFFFFF",
    borderRadius: "12px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  }}
>



          <Grid container spacing={2}>
            {/* Tag ID */}
           <Grid item xs={12} sm={6} md={4}>
                                   <TextField
                                     fullWidth
                                     label={t('breeding.common.tagId')}
                                     select
                                     value={animalId}
                                     onChange={handleTagChange}
                                   >
                           {tags.map((animal) => (
                                       <MenuItem key={animal.uuid} value={animal.uuid}>
                                         {animal.tagName}
                                       </MenuItem>
                                     ))}
                                   </TextField>
                                 </Grid>

            {/* Date */}
            <Grid item xs={12} md={4}>
              <TextField
                label={t('breeding.common.date')}
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Bull ID */}
            <Grid item xs={12} sm={6} md={3.5}>
                                    <TextField
                                      fullWidth
                                      label={t('breeding.bullBreedingAdd.bullId')}
                                      select
                                      value={bullId}
                onChange={handleBullId}
                                    >
                            {bulls.map((bull) => (
                                        <MenuItem key={bull.uuid} value={bull.uuid}>
                                          {bull.name}
                                        </MenuItem>
                                      ))}
                                    </TextField>
                                  </Grid>

            {/* Double Dose */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="doubleDose-label">{t('breeding.common.doubleDose')}</InputLabel>
                <Select
                  labelId="doubleDose-label"
                  label={t('breeding.common.doubleDose')}
                  value={doubleDose}
                  onChange={(e) => setDoubleDose(e.target.value as string)}
                >

                  <MenuItem value="Yes">{t('breeding.common.yes')}</MenuItem>
                  <MenuItem value="No">{t('breeding.common.no')}</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Comments */}
            <Grid item xs={12}>
              <TextField
                label={t('breeding.common.enterComments')}
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
              />
              {/* 
                If you prefer a rich-text editor with a toolbar,
                you can replace this TextField with something like ReactQuill.
              */}
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box mt={3} sx={{ display: 'flex', gap: 2 }}>
    <Button
  variant="contained"
  sx={{
    backgroundColor: '#005f73',
    textTransform: 'none',
    borderRadius: '12px',
    padding: '8px 40px',
    '&:hover': { backgroundColor: '#007f91' },
    '&:disabled': { backgroundColor: '#bdbdbd' }
  }}
  onClick={handleAddNew}
  disabled={isLoading}
>
  {isLoading ? (
    <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
  ) : (
    t('breeding.common.addNew')
  )}
</Button>
            <Button variant="outlined" sx={{borderRadius:'12px' ,  padding:'8px 40px',
              textTransform: 'none',
                backgroundColor: '#e0e0e0',
                color: '#000',
                border: '1px solid #d6d6d6'
}}  onClick={handleCancel}>
              {t('breeding.common.cancel')}
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

export default AddBullBreedingEvent;