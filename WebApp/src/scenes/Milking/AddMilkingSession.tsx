import React, { useState, ChangeEvent , useEffect,useRef } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  CardActions,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  useTheme,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { getRoles } from '../../shared/services/getUsers.services';
import { createMilkingSession } from '../../shared/services/MilkingSession.service';
import { getanimal } from '../../shared/services/getanimal.services';
import { CircularProgress, Backdrop } from '@mui/material';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { useTranslation } from 'react-i18next';



interface Role{
  uuid: string
  name: string;
}

interface User {
  firstname: string;
  lastname: string;
  role: Role
}

interface Animal {
  uuid: string;
  penId: string;
  gender: string;
  tag: Tag;
}
interface Tag {
  uuid: string;
  name: string;
}

const DayWiseMilking: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  // State
  const [tags, setTags] = useState<Tag[]>([]);
  const [roles , setRoles] = useState<User[]>([]);
  const [tagId, setTagId] = useState < string > ("");
  const [selectedRole, setselectedRole] = useState < string > ("");

  const [Milking_Time, setMilking_Time] = useState<string>("");
  const [milkQuantity, setMilkQuantity] = useState<number>(0);
  const [remarks, setRemarks] = useState<string>("");

 const [loading, setLoading] = useState(false);
 const [submitLoading, setSubmitLoading] = useState(false);
  const toastId = useRef<Id | null>(null);

const handleSave = async function () {
  const todayDate = new Date();
  const today = todayDate.toISOString().split('T')[0];

  if (!tagId || !Milking_Time || milkQuantity <= 0 || !selectedRole) {
    const msg = t('milking.common.fillRequiredFields');
    if (!toast.isActive(toastId.current as Id)) {
      toastId.current = toast.warning(msg);
    }
    return;
  }

  toast.dismiss(); 
  
  setSubmitLoading(true);

  try {
    const Response = await getanimal();

    if (Response?.data?.data?.animals) {
      const animals: Animal[] = Response.data.data.animals;
      const foundAnimal = animals.find(animal => animal.tag.name === tagId);

      if (foundAnimal) {
        const { uuid } = foundAnimal;
        const milkingSessionPayload = {
          animalId: uuid,
          date: today,
          milk: milkQuantity,
          milkingTime: Milking_Time,
          remarks: remarks,
        };

        const response = await createMilkingSession(milkingSessionPayload);

        if (response?.data?.data?.underMilkWithdrawal) {
          toast.warning(
            t('milking.addMilkingSession.withdrawalWarning', {
              date: response.data.data.milkWithdrawalUntil,
            }),
            { autoClose: 10000 }
          );
        } else {
          toast.success(t('milking.addMilkingSession.milkAddedSuccess'));
        }
        setMilkQuantity(0);
        setMilking_Time("");
        setTagId("");
        setselectedRole("");
        setRemarks("");
      } else {
        toast.error(t('milking.addMilkingSession.noAnimalFound'));
      }
    }
  } catch (error) {
    toast.error(t('milking.addMilkingSession.addMilkError'));
  } finally {
    setSubmitLoading(false);
  }
};


  const handleCancel = () => {
    setMilkQuantity(0);
    setMilking_Time("");
    setTagId("");
    setselectedRole("");
    setRemarks("");
  };
  useEffect(()=>{
      const getTagsAndRoles = async function(){
        try {
          setLoading(true);
          const Response = await getanimal();
          if(Response?.data?.data?.animals){
              const animals: Animal[] = Response.data.data.animals;
      
            const femaleTags: Tag[] = animals
              .filter(animal => animal.gender === 'female' && animal.tag)
              .map(animal => animal.tag);
        
            setTags(femaleTags);
            console.dir(femaleTags , {depth: null});
          }
          const res = await getRoles();
           if(res?.data?.data?.Users){setRoles(res.data.data.Users)}
            setLoading(false);
        }
        catch (error) {
          setLoading(false);
          console.log(error) 
        }
      }
      getTagsAndRoles();
  },[])  
  

  return (
    <PageContainer title={t('milking.addMilkingSession.title')} maxWidth={900}>

      <Card
         sx={{
     backgroundColor: 'transparent',
     margin: 0,
    }}
       
        elevation={0}
      >
        <CardHeader
          title={t('milking.addMilkingSession.title')}
          titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
          sx={{
            // borderBottom: '1px solid #ddd',
            pb:{ xs:1,md:2},
            mb: 1,
          }}
        />

        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 3, backgroundColor: theme.palette.background.paper,
            p: { xs: 2, sm: 3, md: 3 },

    borderRadius: "12px",
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',

        }}>
          {/* Top row: Date & Milk Product */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            {/* Select Cow Tag */}
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="milk-product-label">{t('milking.common.selectCow')}</InputLabel>
              <Select
                labelId="cow-tag"
                label={t('milking.common.selectCow')}
                value={tagId}
                onChange={(e) => setTagId(e.target.value as string)}
              >
                {tags.map((t, idx) => (
                  <MenuItem key={idx} value={t.name}>
                    {t.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

             {/* Milking Time Dropdown */}
             <FormControl sx={{ flex: 1 }}>
              <InputLabel id="milk-product-label">{t('milking.common.selectMilkingTime')}</InputLabel>
              <Select
                labelId="milking-time"
                label={t('milking.common.selectMilkingTime')}
                value={Milking_Time}
                onChange={(e) => setMilking_Time(e.target.value as string)}
              >
                <MenuItem value="">{t('milking.common.select')}</MenuItem>
                <MenuItem value="morning">{t('milking.common.milkingTimes.morning')}</MenuItem>
                <MenuItem value="afternoon">{t('milking.common.milkingTimes.afternoon')}</MenuItem>
                <MenuItem value="evening">{t('milking.common.milkingTimes.evening')}</MenuItem>
              </Select>
            </FormControl>
          
            {/* Milk Input */}
            <TextField
              label={t('milking.common.quantityLiters')}
              type="number"
              value={milkQuantity}
              onChange={(e) => setMilkQuantity(Number(e.target.value))}
              fullWidth
              sx={{ flex: 1 }}
            />
          </Box>


          {/* Remarks */}
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
            }}
          >
            <TextField
              label={t('milking.common.remarks')}
              multiline
              rows={4}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              fullWidth
            />
          </Box>

          <Box sx={{ display: 'flex',
              gap: 2,
              flexWrap: 'wrap', width: '32%' }}>
            {/* Report to Dropdown */}
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="milk-product-label">{t('milking.common.reportTo')}</InputLabel>
              <Select
                labelId="report-to"
                label={t('milking.common.reportTo')}
                value={selectedRole}
                onChange={(e) => setselectedRole(e.target.value as string)}
              >
                {roles
                 ?.filter(user => user.role.name.toLowerCase() === 'doctor')
                 .map(user => (
                   <MenuItem value={`${user.firstname} ${user.lastname}`} key={user.role.name}>
                     {`${user.firstname} ${user.lastname}`}
                   </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
      

        <CardActions sx={{ p: 1 }}>
          <Button
  variant="contained"
  onClick={handleSave}
  disabled={submitLoading}
  sx={{
    backgroundColor: '#295d5d',
    ':hover': { backgroundColor: '#1f4848' },
    textTransform: 'none',
    mr: 2,
    minWidth: 140,
    position: 'relative',
    px: 4,
    py: 1.5,
  }}
>
  {submitLoading ? (
    <CircularProgress size={24} sx={{ color: "#0F7C8F" }} />
  ) : (
    t('milking.common.saveChanges')
  )}
</Button>

          <Button
            variant="outlined"
            onClick={handleCancel}
            sx={{
              textTransform: 'none',
              borderColor: '#ccc',
              color: '#333',
            }}
          >
            {t('common.cancel')}
          </Button>
        </CardActions>
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

export default DayWiseMilking;
