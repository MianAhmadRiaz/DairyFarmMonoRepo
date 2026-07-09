import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { Averagemilk } from '../../shared/services/averageMilk.service';
import { CircularProgress, Backdrop } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { useTranslation } from 'react-i18next';

interface MilkReport {
  date: string;
  totalMilk: number;
  totalAnimals: string; 
  averageMilk: number;
  maxMilk: number;
  minMilk: number;
}

interface TableDataInterface{
    srNo: number,
    date: string,
    production: number,
    animals: number,
    average: number,
    max: number,
    min: number,
}

const AverageMilkReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = tokens(theme.palette.mode);
  // States for date filtering, search, and filter options
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [searchValue, setSearchValue] = useState('');
  const [filterOption, setFilterOption] = useState('Sort');
  const [FinalData , setFinalData] = useState<TableDataInterface[]>([])
  const [loading, setLoading] = useState(false);

  useEffect(()=>{ 
      const fetchData = async function(){
      if(!startDate || !endDate){return;}
      else if(new Date(startDate) >= new Date(endDate)){
        toast.warning(t('milking.common.startBeforeEnd'));
        return;
      }
       try {
       setLoading(true);
       const averageMilkResponse = await Averagemilk(startDate , endDate);

       if(!(averageMilkResponse?.data?.data?.milks)){alert(t('milking.common.noDataForInterval')); return}
       
       const data: MilkReport[] = averageMilkResponse.data.data.milks;
       const formattedData: TableDataInterface[] = data.map((record: any , index: number)=>{
        return{
           srNo: index+1,
           date: record.date,
           production: record.totalMilk,
           animals: record.totalAnimals,
           average: record.averageMilk,
           max: record.maxMilk,
           min: record.minMilk,
        }
       })
       setFinalData(formattedData);
       setLoading(false);

       } catch (error) {
       //  toast.error("Can't Get Data");
         console.log(error);
         setLoading(false);
       }
      }
    fetchData();
  },[startDate , endDate])

  // Function to filter data based on start & end date, search, and filter
  const filteredData = useMemo(() => {
    let data = FinalData.filter(row => {
      const rowDate = new Date(row.date);
      const from = startDate ? new Date(startDate) : null;
      const to = endDate ? new Date(endDate) : null;
  
      // Check if row date is within selected range
      const isWithinDateRange =
        (!from || rowDate >= from) && (!to || rowDate <= to);
  
      const search = searchValue.toLowerCase().trim();
      
      // Check if row matches search input
      const matchesSearch =
        (row.date && row.date.toString().includes(search)) ||
        (row.animals && row.animals.toString().includes(search));
  
      return isWithinDateRange && matchesSearch;
    });
  
    if (filterOption === "High Production") {
      data.sort((a, b) => b.production - a.production); 
    } else if (filterOption === "Low Production") {
      data.sort((a, b) => a.production - b.production);
    }
  
    return data;
  }, [startDate, endDate, searchValue, filterOption, FinalData]);
  
  

  return (
   <PageContainer title={t('milking.averageMilkReport.title')} maxWidth="1200px">
  {/* Date Picker Row */}
  <Box
    sx={{
      display: 'flex',
      gap: 2,
      justifyContent: { xs: 'flex-start', sm: 'flex-end' },
      mb: 3,
      flexDirection: { xs: 'column', sm: 'row' },
      ml: {xs:0,md:9},
    }}
  >
    <TextField
      label={t('milking.common.startDate')}
      type="date"
      value={startDate}
      onChange={e => setStartDate(e.target.value)}
      sx={{ width: { xs: '100%', sm: 200 } }}
      InputLabelProps={{ shrink: true }}
    />
    <TextField
      label={t('milking.common.endDate')}
      type="date"
      value={endDate}
      onChange={e => setEndDate(e.target.value)}
      sx={{ width: { xs: '100%', sm: 200 } }}
      InputLabelProps={{ shrink: true }}
    />
  </Box>

  <Box
    sx={{
      backgroundColor: theme.palette.background.paper,
      borderRadius: 2,
    }}
  >
    {/* Search & Filter Row */}
    <Box 
      sx={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap:2,
        mb: 2,
        flexDirection: { xs: 'column', sm: 'row' },
         p: { xs: 2, md: 3 }
      }}
    >
      <TextField
        placeholder={t('common.search')}
        size="small"
        value={searchValue}
        onChange={e => setSearchValue(e.target.value)}
        sx={{ 
          flexGrow: 1, 
          width: '100%',
          maxWidth: { xs: '100%', sm: 1500 } ,
          

        }}
      />

      <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 } }}>
        <InputLabel>{t('milking.common.filter')}</InputLabel>
        <Select
          value={filterOption}
          onChange={e => setFilterOption(e.target.value)}
        >
          <MenuItem value="Sort">{t('milking.common.sort')}</MenuItem>
          <MenuItem value="High Production">{t('milking.common.highProduction')}</MenuItem>
          <MenuItem value="Low Production">{t('milking.common.lowProduction')}</MenuItem>
        </Select>
      </FormControl>
    </Box>

    {/* Table Container */}
    <Box
      sx={{ 
        backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#fff', 
        boxShadow: 1, 
        overflowX: 'auto', 
      }}
    >
      <Box
        component="table"
        sx={{
          width: '100%',
          minWidth: '600px',
          borderCollapse: 'collapse',
          '& thead': { borderBottom: '1px solid #e2e8f0',
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'
           },
          '& th': {
            textAlign: 'left',
            fontWeight: 600,
            py: 1.5,
            px: 2,
            color: '#7d7d7d',
            fontSize: { xs: '0.875rem', sm: 'inherit' }
          },
          '& td': { 
            py: 1.5, 
            px: 2, 
            verticalAlign: 'middle',
            fontSize: { xs: '0.875rem', sm: 'inherit' }
          },
          '& tbody tr': { borderBottom: '1px solid #e2e8f0' }
        }}
      >
        {/* Table Header */}
        <Box component="thead">
          <Box component="tr">
            {[
              t('milking.common.columns.srNo'),
              t('milking.common.columns.date'),
              t('milking.common.columns.production'),
              t('milking.common.columns.animals'),
              t('milking.averageMilkReport.columns.average'),
              t('milking.averageMilkReport.columns.max'),
              t('milking.averageMilkReport.columns.min')
            ].map(header => (
              <Box component="th" key={header}>
                {header}
              </Box>
            ))}
          </Box>
        </Box>

        {/* Table Body */}
       <Box component="tbody">
  {loading ? (
    <Box component="tr">
      <Box
        component="td"
        colSpan={7}
        sx={{ textAlign: 'center', py: 3 }}
      >
        <CircularProgress  size={isMobile ? 30 : 50}  sx={{ color: '#0f7c8f' }} />
      </Box>
    </Box>
  ) : filteredData.length > 0 ? (
    filteredData.map((row, idx) => (
      <Box component="tr" key={idx}>
        <Box component="td">{row.srNo}</Box>
        <Box component="td">
          {new Date(row.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
          })}
        </Box>
        <Box component="td">{row.production}</Box>
        <Box component="td">{row.animals}</Box>
        <Box component="td">{row.average}</Box>
        <Box component="td">{row.max}</Box>
        <Box component="td">{row.min}</Box>
      </Box>
    ))
  ) : (
    <Box component="tr">
      <Box
        component="td"
        colSpan={7}
        sx={{ textAlign: 'center', py: 2, color: '#7d7d7d' }}
      >
        {t('milking.common.noDataForFilters')}
      </Box>
    </Box>
  )}
</Box>

      </Box>
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

export default AverageMilkReport;
