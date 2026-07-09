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
  
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import { addAiBreedingEvent } from '../../../shared/services/breeds.services';
import { fetchProtocolsList } from '../../../shared/services/breeds.services';
import CircularProgress from '@mui/material/CircularProgress';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';


interface DropdownObject {
  uuid: string;
  name: string;
}

const AddNewAiEvent: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  // ----------------------------
  // State
  // ----------------------------
  const [aiType, setAiType] = useState('');
  const [date, setDate] = useState('');
  const [semen, setSemen] = useState('');
  const [dose, setDose] = useState('');
  const [cost, setCost] = useState('');
  const [time, setTime] = useState('');
  const [weight, setWeight] = useState('');
  const [tech, setTech] = useState('');
  const [doubleDose, setDoubleDose] = useState('');
  // For comments, either a multiline TextField or a rich-text:
  const [comments, setComments] = useState('');
  const [animalId, setAnimalId] = useState('');
  const [tags, setTags] = useState<{ uuid: string; tagName: string; gender: string }[]>([]);
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });
  const [protocols, setProtocols] = useState<DropdownObject[]>([]);
 const [isLoading, setIsLoading] = useState(false);
  const toastId = useRef<Id | null>(null);


useEffect(() => {
  const loadTagsAndProtocols = async () => {
    try {
      const tagsData = await fetchAnimals();
      const protocolsData = await fetchProtocolsList();
      console.log('Loaded Animals =>', tagsData);
      console.log('Loaded Protocols =>', protocolsData);
      setTags(tagsData);
      setProtocols(protocolsData);
    } catch (error) {
      
      toast.error(t('breeding.aiEventAdd.loadError'));
      console.error('Failed to load data:', error);    }
  };

  loadTagsAndProtocols();
}, []);


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


 

  // ----------------------------
  // Handlers
  // ----------------------------
  const handleBack = () => {
    navigate(-1);
  };


   const handleSave = async () => {
    // Required fields check
    if (
      !animalId ||
      !aiType ||
      !date ||
      !semen ||
      !dose ||
      !cost ||
      !time ||
      !weight ||
      !tech ||
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
      const newData = {
        animalId,
        type: aiType,
        date,
        semen,
        dose: Number(dose),
        cost: Number(cost),
        time,
        weight: Number(weight),
        tech,
        double_dose: doubleDose === 'Yes',
        comments
      };

      await addAiBreedingEvent(newData);

      toast.dismiss(); // Remove previous error toast
      toast.success(t('breeding.aiEventAdd.addSuccess'), {
        onClose: () => window.location.reload()
      });
    } catch (error) {
       if (toastId.current === null || !toast.isActive(toastId.current)) {
          toastId.current = toast.error(t('breeding.aiEventAdd.addError'));
        }
      // toast.error('Failed to Add New AI Breeding Event!');
      console.error('Add AI error:', error);
    } finally {
      setIsLoading(false);
    }
  };


  const handleCancel = () => {
    navigate(-1);
  };
  const handleTagChange = (event:any) => {
    setAnimalId(event.target.value);
  };
  return (
    <PageContainer title={t('breeding.aiEventAdd.pageTitle')}>
      {/* Back Button */}
           <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          //  mt:3,
          ml:{xs:2,sm:4,md:4},
          // mb: 1,
          color: '#005f73',
          textTransform: 'none',
          fontWeight: 'bold'
        }}
      >
        {t('breeding.common.back')}
      </Button>
        <CardContent>
          <Box
  sx={{
  
     p: { xs: 2, sm: 3, md: 4 },
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
                {tags.filter((animal) => animal.gender == "female").map((animal) => (
                  <MenuItem key={animal.uuid} value={animal.uuid}>
                    {animal.tagName}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {/* AI Type */}
            <Grid item xs={12} md={4}>
             <FormControl fullWidth>
  <InputLabel id="aiType-label">{t('breeding.aiEventAdd.aiType')}</InputLabel>
  <Select
    labelId="aiType-label"
    label={t('breeding.aiEventAdd.aiType')}
    value={aiType}
    onChange={(e) => setAiType(e.target.value as string)}
  >
    
    {protocols.map((protocol) => (
      <MenuItem key={protocol.uuid} value={protocol.uuid}>
        {protocol.name}
      </MenuItem>
    ))}
  </Select>
</FormControl>

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

            {/* Semen */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <TextField
                fullWidth
                  select
                  label={t('breeding.aiEventAdd.semen')}
                  name="Semen"
                  value={semen}
                  onChange={(e) => setSemen(e.target.value as string)}
                >
                </TextField>
              </FormControl>
            </Grid>

            {/* Dose */}
            <Grid item xs={12} md={4}>
              <TextField
                label={t('breeding.aiEventAdd.dose')}
                placeholder={t('breeding.common.enterNumber')}
                value={dose}
                onChange={(e) => setDose(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Cost */}
            <Grid item xs={12} md={4}>
              <TextField
                label={t('breeding.common.cost')}
                placeholder={t('breeding.common.enterNumber')}
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Time */}
            <Grid item xs={12} md={4}>
              <TextField
                label={t('breeding.aiEventAdd.time')}
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            {/* Weight */}
            <Grid item xs={12} md={4}>
              <TextField
                label={t('breeding.common.weight')}
                placeholder={t('breeding.common.enterNumber')}
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                fullWidth
              />
            </Grid>

            {/* Tech */}
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <InputLabel id="tech-label">{t('breeding.aiEventAdd.tech')}</InputLabel>
                <Select
                  labelId="tech-label"
                  label={t('breeding.aiEventAdd.tech')}
                  value={tech}
                  onChange={(e) => setTech(e.target.value as string)}
                >
                
                  <MenuItem value="Dr. Smith">Dr. Smith</MenuItem>
                  <MenuItem value="Dr. Jones">Dr. Jones</MenuItem>
                </Select>
              </FormControl>
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
              {/* If you want a Rich Text Editor: 
              <ReactQuill value={comments} onChange={setComments} />
              */}
              <TextField
                label={t('breeding.common.enterComments')}
                multiline
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                fullWidth
              />
            </Grid>
          </Grid>

          {/* Buttons */}
          <Box mt={3} sx={{ display: 'flex', gap: 2 }}>
            <Button
  variant="contained"
  sx={{
    backgroundColor: '#005f73',
    textTransform: 'none',
    '&:hover': { backgroundColor: '#007f91' },
    '&:disabled': { backgroundColor: '#bdbdbd' }
  }}
  onClick={handleSave}
  disabled={isLoading}
>
  {isLoading ? (
    <CircularProgress size={24} sx={{ color: 'white' }} />
  ) : (
    t('breeding.common.addNew')
  )}
</Button>
            <Button variant="outlined"  sx={{
                textTransform: 'none',
                backgroundColor: '#e0e0e0',
                color: '#000',
                padding: '5px 20px',
                border: '1px solid #d6d6d6'
              }} onClick={handleCancel}>
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

export default AddNewAiEvent;

