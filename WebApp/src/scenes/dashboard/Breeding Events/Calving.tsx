import React, { useEffect, useState,useRef } from 'react';
import {
  Box,
  Typography,
  Grid,
  TextField,
  Button,
  Select,
  MenuItem as SelectMenuItem,
  IconButton,
  Paper,
  Snackbar,
  Alert,
  MenuItem
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CircularProgress from '@mui/material/CircularProgress';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Quill styles
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { fetchAnimals } from '../../../shared/services/animalinfo.service';
import { addCalvingEvent } from '../../../shared/services/breeds.services';
import { DropdownObject, fetchBreedTypes, fetchPenList, getAllTags } from '../../../shared/services/herdinfo.services';
import { ToastContainer, toast, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';



const Calving: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [tags, setTags] = useState([]);
  const [tagId, setTagId] = useState('');
  const [childTagId, setChildTagId] = useState('');
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });
  const [category, setCategory] = useState('Alive Child');

  const [date, setDate] = useState('');
  const [calvingEase, setCalvingEase] = useState('');
  const [penList, setPenList] = useState([]);
  const [cost, setCost] = useState('');
  const [lactation, setLactation] = useState('');
  const [calvingProblems, setCalvingProblems] = useState('');
const [isLoading, setIsLoading] = useState(false);
const toastId = useRef<Id | null>(null);
  const { isMobile, isCollapsed } = useLayoutShift();

  const [dropdownOptions, setDropdownOptions] = useState<{
      penIDs: DropdownObject[];
          breedTypes: DropdownObject[];
    tagIDs: DropdownObject[];

     
    }>({
      penIDs: [],
          breedTypes: [],

     tagIDs: [],

    });

  const [aliveChildren, setAliveChildren] = useState([
    {  shed:'', tagId: '', breedType: '', sex: '', weight: '', identity: '' }
  ]);
  const [deadChildren, setDeadChildren] = useState([
    { sex: '', weight: '', remarks: '' }
  ]);
const [formData,setFormData]=useState<any>({
      penId: "",
      tagId:""

});

  const handleAddChild = () => {
    if (category === 'Alive Child') {
      setAliveChildren([
        ...aliveChildren,
        {
          shed:'',
          tagId: '',
          breedType: '',
          sex: '',
          weight: '',
          identity: ''
        }
      ]);
    } else if (category === 'Dead Child') {
      setDeadChildren([...deadChildren, { sex: '', weight: '', remarks: '' }]);
    }
  };

   
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
  
      if (name === "sireTagId" || name === "damTagId") {
        setFormData((prev: any) => ({
          ...prev,
          pedigreeInfo: {
            ...prev.pedigreeInfo,
            [name]: value
          }
        }));
      } else {
        setFormData((prev: any) => ({ ...prev, [name]: value }));
      }
    };
  

 const handleTagChange = (event) => {
  const selectedTagId = event.target.value;
  setTagId(selectedTagId);

  // Find the selected animal and update lactation
  const selectedAnimal = tags.find((animal) => animal.uuid === selectedTagId);
  if (selectedAnimal) {
    setLactation(selectedAnimal.lactation || ''); // fallback to '' if null
  } else {
    setLactation('');
  }
};


  const handleRemoveChild = (index: number, type: string) => {
    if (type === 'Alive Child') {
      const updatedChildren = aliveChildren.filter((_, i) => i !== index);
      setAliveChildren(updatedChildren);
    } else if (type === 'Dead Child') {
      const updatedChildren = deadChildren.filter((_, i) => i !== index);
      setDeadChildren(updatedChildren);
    }
  };

const handleSubmit = async () => {
  // Validate top-level form fields
  const isMainFormValid = tagId && date && calvingEase && formData.penId && cost && calvingProblems;

  // Validate alive children
  const isAliveValid = aliveChildren.every(child =>
    child.shed &&
    child.sex &&
    child.weight &&
    child.breedType &&
    (child.tagId || child.identity) // Either tagId or identity required
  );

  // Validate dead children
  const isDeadValid = deadChildren.every(child =>
    child.sex &&
    child.weight &&
    child.remarks
  );

  const allValid = isMainFormValid && isAliveValid && isDeadValid;

  if (!allValid) {
    const msg = t('breeding.common.fillMissingFields');
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(msg);
    }
    return;
  }

  toast.dismiss(); // remove any existing errors
  setIsLoading(true);

  try {
    const payload = {
      ...(formData.penId && { penId: formData.penId }),
      problems: calvingProblems,
      lactation: parseInt(lactation) || null,
      cost: parseFloat(cost) || 0,
      animalId: tagId,
      date: date,
      time: new Date().toISOString().split('T')[1].split('.')[0],
      calving_ease: parseInt(calvingEase) || null,
      comments: 'Submitted from UI',
      childs: [
        ...aliveChildren.map(child => ({
          weight: parseFloat(child.weight) || null,
          penId: child.shed || null,
          tagId: child.tagId || null,
          temp_id: child.tagId ? null : `temp_${Math.random().toString(36).substr(2, 9)}`,
          isAlive: true,
          gender: child.sex,
          breedType: child.breedType
        })),
        ...deadChildren.map(child => ({
          weight: parseFloat(child.weight) || null,
          reason_if_dead: child.remarks || '',
          isAlive: false,
          gender: child.sex,
          breedType: 'unknown'
        }))
      ]
    };

    console.log(' Final Payload to submit:', JSON.stringify(payload, null, 2));
    await addCalvingEvent(payload);
    toast.success(t('breeding.calving.addSuccess'));
    setTimeout(() => {
      window.location.reload();
    }, 3000);
  } catch (error) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
                    toastId.current = toast.error(t('breeding.calving.addError'));
                  }
    console.error('Error submitting form:', error);
    // toast.error('Failed to add calving event');
  } finally {
    setIsLoading(false);
  }
};


  useEffect(()=>{
    (async()=>{
      try{
        const [pens,bTypes,tags]=await Promise.all([
          fetchPenList(),
                    fetchBreedTypes(),
          getAllTags(false),

        ]);
        setDropdownOptions({
                    breedTypes: bTypes,
tagIDs:tags,
          penIDs:pens
        });
      }
      catch(err){
                console.error("Failed to fetch dropdown data:", err);

      }
    })();
  },[]);

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
  const handleChildChange = (
    index: number,
    field: string,
    value: string,
    type: string
  ) => {
    if (type === 'Alive Child') {
      const updatedChildren = [...aliveChildren];
      updatedChildren[index][field] = value;
      setAliveChildren(updatedChildren);
    } else if (type === 'Dead Child') {
      const updatedChildren = [...deadChildren];
      updatedChildren[index][field] = value;
      setDeadChildren(updatedChildren);
    }
  };

 

  return (
    <PageContainer title={t('breeding.calving.pageTitle')}>
      {/* Back Button */}
      <Typography
        variant="body2"
        sx={{
          cursor: 'pointer',
          color: '#005f73',
          fontWeight: 'bold',
          marginBottom: '20px',
           fontSize: { xs: '1rem', sm: '0.875rem', md: '0.875rem' },
        }}
       onClick={() => navigate(-1)}


      >
        ← {t('breeding.common.back')}
      </Typography>

      <Box
        sx={{
          marginTop: '20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          p: { xs: 2, sm: 3, md: 4},

          // padding: '20px',
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",

        }}
      >
        {/* Form Inputs */}
        <Grid container spacing={3}>
          {/* Tag ID */}
          <Grid item xs={12} sm={6} md={3.5}>
            <TextField
              fullWidth
              label={t('breeding.common.tagId')}
              select
              value={tagId}
              onChange={handleTagChange}
            >
              {tags.map(animal => (
                <SelectMenuItem key={animal.uuid} value={animal.uuid}>
                  {animal.tagName}
                </SelectMenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('breeding.common.date')}
              type="date"
              InputLabelProps={{ shrink: true }}
              variant="outlined"
              value={date}
              onChange={e => setDate(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('breeding.calving.calvingEase')}
              type="number"
              variant="outlined"
              value={calvingEase}
              onChange={e => setCalvingEase(e.target.value)}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
           <TextField
  select
  fullWidth
  label={t('breeding.calving.changePen')}
  name="penId"
  value={formData.penId}
  onChange={handleInputChange}
  variant="outlined"
>
  <MenuItem value="">{/* Empty value for "no selection" */}
  </MenuItem>
  {dropdownOptions.penIDs.map((option) => (
    <MenuItem key={option.uuid} value={option.uuid}>
      {option.name}
    </MenuItem>
  ))}
</TextField>
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('breeding.common.cost')}
              type="number"
              variant="outlined"
              value={cost}
              onChange={e => setCost(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('breeding.calving.lactation')}
              type="number"
              variant="outlined"
              value={lactation|| ''}
              onChange={e => setLactation(e.target.value)}
                InputProps={{ readOnly: true }}  // 👈 Makes it non-editable

            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              fullWidth
              label={t('breeding.calving.calvingProblems')}
              variant="outlined"
              select
              value={calvingProblems}
              onChange={e => setCalvingProblems(e.target.value)}
            >
              <SelectMenuItem value="Assisted">{t('breeding.calving.problems.assisted')}</SelectMenuItem>
              <SelectMenuItem value="Normal">{t('breeding.calving.problems.normal')}</SelectMenuItem>
              <SelectMenuItem value="Dystocia">{t('breeding.calving.problems.dystocia')}</SelectMenuItem>
            </TextField>
          </Grid>
        </Grid>

        {/* Category Selector */}
        <Typography variant="h6" fontWeight="bold" sx={{ marginTop: '20px' }}>
          {t('breeding.calving.child')}
        </Typography>
        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item xs={12} sm={4}>
            <Select
              fullWidth
              value={category}
              onChange={e => setCategory(e.target.value)}
              displayEmpty
              variant="outlined"
            >
              <SelectMenuItem value="Alive Child">{t('breeding.calving.aliveChild')}</SelectMenuItem>
              <SelectMenuItem value="Dead Child">{t('breeding.calving.deadChild')}</SelectMenuItem>
            </Select>
          </Grid>
          <Grid item>
            <Button
              startIcon={<AddIcon />}
              sx={{
                color: '#007f91',
                textTransform: 'none',
                fontWeight: 'bold'
              }}
              onClick={handleAddChild}
            >
              {t('breeding.calving.addNewChild')}
            </Button>
          </Grid>
        </Grid>

        {/* Alive Children */}
        {aliveChildren.map((child, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              padding: '20px',
              marginBottom: '10px',
              marginTop: '20px',
              backgroundColor: '#f0f4f8',
               position: 'relative'
            }}
          >
                     
                     {isMobile && (
  <Typography
    variant="body2"
    fontWeight="600"
    sx={{
      backgroundColor: '#02E35F',
      color: 'white',
      px: 1,
      borderRadius: '1px',
      display: 'inline-block',
      width: 'fit-content',
      position: 'absolute',
      top: '6px',
      left: '6px',
      zIndex: 1
    }}
  >
    {t('breeding.calving.alive')}
  </Typography>
)}

               {isMobile && (
  <IconButton
    color="error"
    onClick={() => handleRemoveChild(index, 'Alive Child')}
    sx={{ float: 'right', 
     mt:{xs:'-19px'},
     mr:'-13px'
     }}
  >
    <DeleteIcon />
  </IconButton>
)}
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3.5}>
                <TextField select fullWidth label={t('breeding.calving.shed')} variant="outlined" value={child.shed} onChange={(e) =>
    handleChildChange(index, 'shed', e.target.value, 'Alive Child') 
  } >
                 {dropdownOptions.penIDs.map((option) => (
                               <MenuItem key={option.uuid} value={option.uuid}>
                                 {option.name}
                                   </MenuItem>
                                             ))}
                                 
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3.5}>
                <TextField
                select
                  fullWidth
                  label={t('breeding.common.tagId')}
                  variant='outlined'
       value={child.tagId}  // Changed from formData.tagId to child.tagId
  onChange={(e) => 
    handleChildChange(
      index,
      'tagId',
      e.target.value,
      'Alive Child'
    )
  }
                >
                  {dropdownOptions.tagIDs
  .filter(option => !aliveChildren.some(child => child.tagId === option.uuid && child.tagId !== child.tagId))
  .map(option => (
    <MenuItem key={option.uuid} value={option.uuid}>
      {option.name}
    </MenuItem>
))}

                </TextField>
              </Grid>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  select
                  fullWidth
                  label={t('breeding.common.breedType')}
                  variant="outlined"
                  value={child.breedType}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'breedType',
                      e.target.value,
                      'Alive Child'
                    )
                  }
                >
                   {dropdownOptions.breedTypes.map((option) => (
                               <MenuItem key={option.uuid} value={option.uuid}>
                                 {option.name}
                               </MenuItem>
                             ))}
                </TextField>
              </Grid>

             
              <Grid
  item
  xs={12}
  sm={1}
  sx={{
    display: { xs: 'none', sm: 'block' } 
  }}
>
   {!isMobile && (
    <Typography
      variant="body2"
      fontWeight="600"
      sx={{
        backgroundColor: '#02E35F',
        color: 'white',
        px: 1,
        borderRadius: '1px',
        display: 'inline-block',
        width: 'fit-content',
        mb: 1,
        mt:1.3
      }}
    >
      {t('breeding.calving.alive')}
    </Typography>
  )}
                <IconButton
                  color="error"
                  onClick={() => handleRemoveChild(index, 'Alive Child')}
                  sx={{ float: 'right', marginRight: '-50px' }}
                >
                  <DeleteIcon />
                </IconButton>
              </Grid>

              <Grid item xs={12} sm={3.5}>
                <TextField
                  select
                  fullWidth
                  label={t('breeding.common.sex')}
                  variant="outlined"
                  value={child.sex}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'sex',
                      e.target.value,
                      'Alive Child'
                    )
                  }
                >
                  <SelectMenuItem value="male">{t('breeding.common.male')}</SelectMenuItem>
                  <SelectMenuItem value="female">{t('breeding.common.female')}</SelectMenuItem>
                </TextField>
              </Grid>
              {/* Weight Field */}
              <Grid item xs={12} sm={3.5}>
                <TextField
                  fullWidth
                  label={t('breeding.common.weight')}
                  placeholder={t('breeding.calving.inKgs')}
                  value={child.weight}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'weight',
                      e.target.value,
                      'Alive Child'
                    )
                  }
                  variant="outlined"
                />
              </Grid>
              {/* Identity Field */}
              <Grid item xs={12} sm={3.5}>
                <TextField
                  fullWidth
                  name="identity"
                  label={t('breeding.calving.identity')}
                  placeholder={t('breeding.calving.setTemporaryId')}
                  value={child.identity}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'identity',
                      e.target.value,
                      'Alive Child'
                    )
                  }
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </Paper>
        ))}

        {/* Dead Children */}
        {deadChildren.map((child, index) => (
          <Paper
            key={index}
            elevation={1}
            sx={{
              padding: '30px',
              marginBottom: '10px',
              marginTop: '20px',
              backgroundColor: '#f0f4f8',
                position: 'relative' // add this
            }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  select
                  fullWidth
                  label={t('breeding.common.sex')}
                  value={child.sex}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'sex',
                      e.target.value,
                      'Dead Child'
                    )
                  }
                  variant="outlined"
                >
                  <SelectMenuItem value="1">{t('breeding.common.male')}</SelectMenuItem>
                  <SelectMenuItem value="2">{t('breeding.common.female')}</SelectMenuItem>
                </TextField>
              </Grid>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  fullWidth
                  label={t('breeding.common.weight')}
                  placeholder={t('breeding.calving.inKgs')}
                  value={child.weight}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'weight',
                      e.target.value,
                      'Dead Child'
                    )
                  }
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12} sm={3.5}>
                <TextField
                  fullWidth
                  label={t('breeding.calving.remarks')}
                  value={child.remarks}
                  onChange={e =>
                    handleChildChange(
                      index,
                      'remarks',
                      e.target.value,
                      'Dead Child'
                    )
                  }
                  variant="outlined"
                />
              </Grid>

              <Grid item xs={12} sm={1}>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveChild(index, 'Dead Child')}
                  sx={{
                    float: 'right',
                     mr:{xs:'-25px',md:'-58px'},
                    mt:{xs:'-235px',md:'-8px'}
                  }}
                >
                  <DeleteIcon />
                </IconButton>
              
                <Typography
  variant="body2"
  fontWeight="600"
  sx={{
    backgroundColor: '#fdecea',
    color: '#d32f2f',
    px: 1,
    borderRadius: '2px',
    display: 'inline-block',
    width: 'fit-content',
    position: { xs: 'absolute', sm: 'static' },
    top: { xs: '1px', sm: 'auto' },
    left: { xs: '6px', sm: 'auto' },
    zIndex: 1,

  }}
>
  {t('breeding.calving.dead')}
</Typography>

              </Grid>
            </Grid>
          </Paper>
        ))}

        {/* Comments Section */}
        <Grid item xs={12}>
          <ReactQuill
            theme="snow"
            placeholder={t('breeding.common.enterComments')}
            style={{ height: '150px', marginBottom: '20px', marginTop: '25px' }}
          />
        </Grid>

        {/* Action Buttons */}
        <Box
          sx={{
            marginTop: '70px',
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
  onClick={handleSubmit}
  disabled={isLoading}
>
  {isLoading ? (
    <CircularProgress size={24} sx={{ color: '#0F7C8F' }} />
  ) : (
    t('breeding.common.saveChanges')
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
            {t('breeding.common.cancel')}
          </Button>
        </Box>
      </Box>
      <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  draggable
  pauseOnFocusLoss
/>

    </PageContainer>
  );
};

export default Calving;
