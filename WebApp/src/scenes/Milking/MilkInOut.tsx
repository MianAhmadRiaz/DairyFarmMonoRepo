// MilkInOut.jsx

import React, { useEffect, useState } from 'react';
import { Box, Typography, TextField, Button, useTheme, useMediaQuery } from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import PeopleIcon from '@mui/icons-material/People'; // For "Total Milk"
import LocalShippingIcon from '@mui/icons-material/LocalShipping'; // For "Total Milk In"
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart'; // For "Total Milk Out"
import { milk_out } from '../../shared/services/milkout.service';
import { milk_analytics } from '../../shared/services/milkanalytics.service';
import { CircularProgress, Backdrop } from '@mui/material';
import { useTranslation } from 'react-i18next';
import PageContainer from '../../shared/components/Layout/PageContainer';



const MilkInOut = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { t } = useTranslation();

  interface Company {
    uuid: string;
    name: string;
    country: string;
  }
  
  interface Category {
    uuid: string;
    name: string;
  }
  
  interface milkOut {
    date: string;
    volume: number;
    outType: string;
    companies: Company | null;  
    category: Category | null; 
  }
  interface milkAnalytics {
    totalMilk1: number;
    totalMilk2: number;
    totalMilk3: number;
    totalMilk: number;
    totalMilkOut: number;
    finalMilk: number;
  }

  const [milkout , setmilkout] = useState<milkOut[]>([]);
  const [Filtermilkout , setFiltermilkout] = useState<milkOut[]>([]);
  const [milkanalytics , setmilkanalytics] = useState<milkAnalytics>();
  const [date , setdate] = useState("");
  const [searchValue , setsearchValue] = useState("");
  const [loading, setLoading] = useState(false);


  useEffect(()=>{
    const fetchData = async function(){
      if(date){
        try {
          setLoading(true);
          const outResponse = await milk_out(date);
          const analyticsResponse = await milk_analytics(date);
          if(outResponse?.data?.data?.milks && analyticsResponse?.data?.data){
            setmilkout(outResponse.data.data.milks);
            setmilkanalytics(analyticsResponse.data.data);
            setFiltermilkout(outResponse.data.data.milks);
            setLoading(false);
          }
          else{
            alert(t('milking.milkInOut.noDataForDate', { date }))
          }
        } catch (error) {
          console.log(error)
        }
      }
    }
    fetchData();
  },[date])

  const handleClick = () =>{
    if(searchValue){
      let searchLower = searchValue.toLocaleLowerCase().trim();
      const data = Filtermilkout.filter((row)=>{
         row?.companies?.name ? row?.companies?.name: row?.category?.name === searchLower ||
         row.outType === searchLower
      })
      setFiltermilkout(data);
    }
    else{
      setFiltermilkout(milkout);
    }
  }

  return (
    <PageContainer title={t('milking.milkInOut.title')} maxWidth="1200px">
  {/* Page Title */}
  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
    {/* Date (responsive positioning) */}
    <Box
      sx={{
        backgroundColor: '#fff',
        boxShadow: 1,
        borderRadius: 2,
        px: { xs: 2, md: 4 },
        py: 2,
        width: { xs: '100%', sm: 'auto' },
        ml: 3,
      }}
    >
      <TextField
        type='date'
        label={t('milking.common.date')}
        value={date}
        onChange={(e) => setdate(e.target.value)}
        InputLabelProps={{ shrink: true }}
        sx={{ 
          width: { xs: '100%', sm: 200 },
          backgroundColor: '#fff',
          borderRadius: 2,
        }}
      />
    </Box>
  </Box>

  {/* Stats Row - Responsive grid */}
  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { 
        xs: '1fr', 
        sm: 'repeat(2, 1fr)', 
        md: 'repeat(3, 1fr)' 
      },
      gap: { xs: 2, md: 4 },
      mb: { xs: 4, md: 6 }
    }}
  >
    {/* Card 1: Total Milk */}
    <Box
      sx={{
        backgroundColor: '#fff',
        boxShadow: 1,
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
         ml: { xs: 0, md: 8 }, 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <PeopleIcon sx={{ fontSize: 34, color: '#004f5e' }} />
      </Box>
      <Typography sx={{ color: '#505A5F' }}>{t('milking.milkInOut.totalMilk')}</Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
        {milkanalytics?.finalMilk}
      </Typography>
    </Box>

    {/* Card 2: Total Milk In */}
    <Box
      sx={{
        backgroundColor: '#fff',
        boxShadow: 1,
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
        // ml: 8,
         ml: { xs: 0, md: 8 }, 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <LocalShippingIcon sx={{ fontSize: 34, color: '#fa6400' }} />
      </Box>
      <Typography sx={{ color: '#505A5F' }}>{t('milking.milkInOut.totalMilkIn')}</Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
        {milkanalytics?.totalMilk}
      </Typography>
      
    </Box>

    {/* Card 3: Total Milk Out */}
    <Box
      sx={{
        backgroundColor: '#fff',
         boxShadow: 1,
        borderRadius: 2,
        p: 2,
        textAlign: 'center',
         ml: { xs: 0, md: 8 }, 
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
        <RemoveShoppingCartIcon sx={{ fontSize: 34, color: '#ff5c8a' }} />
      </Box>
      <Typography sx={{ color: '#505A5F' }}>{t('milking.milkInOut.totalMilkOut')}</Typography>
      <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
        {milkanalytics?.totalMilkOut}
      </Typography>
    </Box>
  </Box>

  {/* Milk In Section */}
  <Box
    sx={{
      backgroundColor: '#fff',
      boxShadow: 1,
      borderRadius: 2,
      p: { xs: 2, md: 4 },
      mb: { xs: 4, md: 6 },
       ml: { xs: 0, md: 8 }, 
    }}
  >
    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 4 }}>
      {t('milking.milkInOut.milkIn')}
    </Typography>
    <Box
  sx={{
    display: 'grid',
    gridTemplateColumns: { 
      xs: '1fr', 
      sm: 'repeat(2, 1fr)', 
      md: 'repeat(3, 1fr)' 
    },
    gap: { xs: 2, md: 4 }
  }}
>
  <TextField
    label={t('milking.milkInOut.milk1')}
    value={milkanalytics?.totalMilk1}
    InputProps={{
      readOnly: true,
      sx: { paddingTop: 3 }
    }}
  />

  <Box sx={{ position: 'relative' }}>
    <TextField
      label={t('milking.milkInOut.milk2')}
      value={milkanalytics?.totalMilk2}
      InputProps={{
        readOnly: true,
        sx: { paddingTop: 3 }
      }}
      sx={{ width: '100%' }}
    />
    {loading && (
      <Box
        sx={{
          position: 'absolute',
          top: {xs:'-18.75rem',md:'-40%'},
          right:{xs:'160px',md: '189px'},
         
          transform: 'translateY(-50%)',
        }}
      >
        <CircularProgress  size={isMobile ? 30 : 50}  sx={{ color: '#0f7c8f' }} />
      </Box>
    )}
  </Box>

  <TextField
    label={t('milking.milkInOut.milk3')}
    value={milkanalytics?.totalMilk3}
    InputProps={{
      readOnly: true,
      sx: { paddingTop: 3 }
    }}
  />
</Box>

  </Box>

  {/* Milk Out Section */}
  <Box
    sx={{ 
      backgroundColor: '#fff', 
      boxShadow: 1, 
      borderRadius: 2, 
       ml: { xs: 0, md: 8 }, 
       
    }}
  >
    <Typography sx={{ fontSize: '1.125rem', fontWeight: 600, mb: 1 ,
   
      p: { xs: 2, md: 3.5 }}}>
      {t('milking.milkInOut.milkOut')}
    </Typography>

    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
         gap:{xs:2,md:0},
         mb: 3,
        px: { xs: 2, md: 4 }
      }}
    >
      <TextField
        placeholder={t('common.search')}
        value={searchValue} 
        onChange={(e) => setsearchValue(e.target.value)} 
        size="small" 
        sx={{ 
          maxWidth: { xs: '100%', sm: 300 },
          width: { xs: '100%', sm: 'auto' }
        }} 
      />
      <Button 
        variant="outlined" 
        onClick={handleClick}
        sx={{ width: { xs: '100%', sm: 'auto' } }}
      >
        {t('milking.common.filter')}
      </Button>
    </Box>

    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          minWidth: '700px',
          borderCollapse: 'collapse',
          '& thead': {
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'

          },
          '& th': {
            textAlign: 'left',
            fontWeight: 600,
            color: '#111827',
            py: 1.5,
            px: 2,
            whiteSpace: 'nowrap'
          },
          '& td': {
            py: 1.5,
            px: 2,
            verticalAlign: 'middle',
            whiteSpace: 'nowrap'
          },
          '& tbody tr': {
            borderBottom: '1px solid #e2e8f0'
          }
        }}
      >
        <Box component="thead">
          <Box component="tr">
            <Box component="th">{t('milking.milkInOut.columns.consumptionType')}</Box>
            <Box component="th">{t('milking.milkInOut.columns.head')}</Box>
            <Box component="th">{t('milking.milkInOut.columns.volume')}</Box>
          </Box>
        </Box>
        <Box component="tbody">
  {Filtermilkout.map((row, index) => (
    <Box component="tr" key={index}>
      <Box component="td" sx={{ minWidth: '120px' }}>
        {t('milking.common.outTypes.' + row.outType, row.outType)}
      </Box>
      <Box component="td" sx={{ minWidth: '120px' }}>
       {row?.companies?.name
          ? row.companies.name
          : row?.category?.name
            ? row.category.name
            : t('milking.milkInOut.noSpecificOutType')}
        
      </Box>
      <Box component="td">
        <TextField
          size="small"
          value={row.volume}
          InputProps={{ 
            readOnly: true,
            sx: { 
              width: '30%',
              minWidth: '70px',
              '& input': { textAlign: 'left' }
            }
          }}
          sx={{ width: '100%' }}
        />
      </Box>
    </Box>
  ))}
</Box>
  </Box>
  </Box>
  </Box>
</PageContainer>
  );
};

export default MilkInOut;
