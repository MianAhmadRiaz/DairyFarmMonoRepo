import React, { useState, useMemo, useEffect } from 'react';
import { getApprovedMilk } from '../../shared/services/approvedMilk.service';
import { getPen } from '../../shared/services/getPen.service';
import { getPenBasedOnPenId } from '../../shared/services/getPen.service';
import {
  Box,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { ChangeEvent } from 'react';
import { CircularProgress, Backdrop } from '@mui/material';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { useTranslation } from 'react-i18next';


interface MilkEntry {
  srNo: number;
  tagId: number;
  shed: string;
  lac: number;
  type: string;
  calvingDate: string;
  dim: number;
  milk1: number;
  milk2: number;
  milk3: number;
  total: number;
}

interface MilkData {
  [date: string]: MilkEntry[];
}

interface Pen {
  uuid: string;
  name: string;
  farmId: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

interface Tag {
  name: string;
  uuid: string;
}

interface Animal {
  name: string;
  tagId: string;
  uuid: string;
  calving_date: string;
  animalType: string;
  breedType: string;
  tag: Tag;
}

interface MilkRecord {
  uuid: string;
  penId: string;
  animalId: string;
  animal_curr_lactation: number;
  farmId: string;
  date: string;
  milk1: number;
  milk2: number;
  milk3: number;
  totalMilk: number;
  milkiQuality: string;
  approvedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  animal: Animal;
}


const DailyMilkReport = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const colors = tokens(theme.palette.mode);
  // State Management
  const [selectedDate, setSelectedDate] = useState('2024-5-2');
  const [searchValue, setSearchValue] = useState('');
  const [filterOption, setFilterOption] = useState('Sort');

  const [FiltermilkTableData, setFiltermilkTableData] = useState<MilkEntry[]>([]);
  
  const [loading, setLoading] = useState(false);

  const filteredData = useMemo(() => {
    let data = FiltermilkTableData || [];

    if (searchValue) {
      const searchLower = searchValue.toLowerCase();
      data = data.filter(
        row =>
          row.tagId.toString().includes(searchLower) ||
          row.shed.toLowerCase().includes(searchLower)
      );
    }

    if(filterOption === "High Yielders"){
      data = [...data].sort((a , b)=> b.total - a.total);
    }
    else if(filterOption === "Low Yielders"){
      data = [...data].sort((a , b)=> a.total - b.total);
    }
    return data;
  }, [selectedDate, searchValue, filterOption , FiltermilkTableData]);

  const handleDate = async function (e: ChangeEvent<HTMLInputElement>) {
    const value = e.target.value;
    setSelectedDate(value);
  };

  useEffect(() => {
    const fetchTableData = async function () {
      if (selectedDate) {
        try {
          setLoading(true);
          console.log("hello")
          const approvedMilkResponse = await getApprovedMilk(selectedDate);
          console.log("hello")
          if (approvedMilkResponse?.data?.data?.approvedMilk) {
            console.log("hello")
            const milkdata: MilkRecord[] =
              approvedMilkResponse.data.data.approvedMilk;

            const penIds = milkdata.map(record => record.penId);
            const Penresponses = await Promise.all(
              penIds.map(penId => getPenBasedOnPenId(penId))
            );

            const formattedData: MilkEntry[] = milkdata.map(
              (record: any, index: number) => {
                return {
                  srNo: index + 1,
                  tagId: record.animal.tag.name,
                  shed: Penresponses[index].data.data.name,
                  lac: record.animal_curr_lactation,
                  type: record.animal.animalType,
                  calvingDate: record.animal.calving_date || t('milking.dailyMilkReport.noDateFound'),
                  dim: calculateDIM(milkdata, record.animalId),
                  milk1: record.milk1,
                  milk2: record.milk2,
                  milk3: record.milk3,
                  total: record.totalMilk
                };
              }
            );
            setFiltermilkTableData(formattedData);
            if(formattedData.length > 0){
           //  toast.success("Data Fetched!")
            }
            setLoading(false);
          }
        } catch (error) {
          setLoading(false);
          console.log(error);
        //  toast.error("Cant't Get Data!");
        }
      }
    };
    fetchTableData();
  }, [selectedDate]);

  function calculateDIM(all_milking_cows: MilkRecord[], animal_id: string) {
    const filter = all_milking_cows.filter(item => item.animalId === animal_id);
    const uniqueDates: Array<string> = filter.map(item => item.date);

    if (uniqueDates.length) {
      return uniqueDates.length;
    }
    return 0;
  }

  return (
    <PageContainer title={t('milking.dailyMilkReport.title')} maxWidth="1200px">
    {/* Date Picker */}
    <Box sx={{ 
      display: 'flex', 
      justifyContent: { xs: 'flex-start', md: 'flex-end' }, 
      mb: { xs: 2, md: 3 },
      
         ml: {xs:0,md:9},
    }}>
      <TextField
        label={t('milking.common.selectDate')}
        type="date"
        value={selectedDate}
        onChange={handleDate}
        sx={{ width: { xs: '100%', md: 200 } }}
        InputLabelProps={{ shrink: true }}
      />
    </Box>

    <Box sx={{ 
      backgroundColor: theme.palette.background.paper,
       borderRadius: "12px",

    }}>
      {/* Search & Filter Row */}
      <Box sx={{ 
        display: 'flex', 
        flexDirection: { xs: 'column', md: 'row' },
        gap: 2, 
        mb: 1 ,
           p: { xs: 2, sm: 3, md: 3 },
      }}>
        <TextField
          placeholder={t('common.search')}
          size="small"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          sx={{ width: { xs: '100%', md: 'auto' }, flexGrow: 1,
         
 }}
        />

        <FormControl size="small" sx={{ width: { xs: '100%', md: 180 } }}>
          <InputLabel>{t('milking.common.filter')}</InputLabel>
          <Select
            value={filterOption}
            onChange={(e) => setFilterOption(e.target.value)}
          >
            <MenuItem value="Sort">{t('milking.common.sort')}</MenuItem>
            <MenuItem value="High Yielders">{t('milking.dailyMilkReport.highYielders')}</MenuItem>
            <MenuItem value="Low Yielders">{t('milking.dailyMilkReport.lowYielders')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Box sx={{ 
    
        overflowX: 'auto'
      }}>
        <Box
          component="table"
          sx={{
            width: '100%',
            minWidth: '800px',
            borderCollapse: 'collapse',
            '& thead': { borderBottom: '1px solid #e2e8f0',
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA',
               borderRadius: "12px",

             },
            '& th': {
              textAlign: 'center',
              fontWeight: 600,
              py: 1.5,
              px: { xs: 1, md: 0.5 },
              color: '#7d7d7d',
              fontSize: { xs: '0.875rem', md: '1rem' }
            },
            '& td': { 
              py: 1.5, 
              px: { xs: 1, md: 2 }, 
              verticalAlign: 'middle',
              fontSize: { xs: '0.875rem', md: '1rem' }
            },
            '& tbody tr': { borderBottom: '1px solid #e2e8f0' }
          }}
        >
          {/* Table Header */}
          <Box component="thead" sx={{backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA',}}>
            <Box component="tr">
              {[
                t('milking.common.columns.srNo'),
                t('milking.common.columns.tagId'),
                t('milking.dailyMilkReport.columns.shed'),
                t('milking.dailyMilkReport.columns.lacNo'),
                t('milking.dailyMilkReport.columns.type'),
                t('milking.dailyMilkReport.columns.calvingDate'),
                t('milking.dailyMilkReport.columns.dim'),
                t('milking.common.columns.milk1'),
                t('milking.common.columns.milk2'),
                t('milking.common.columns.milk3'),
                t('milking.common.columns.total')
              ].map((header) => (
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
        colSpan={11}
        sx={{ textAlign: 'center', py: 3 }}
      >
        <CircularProgress  size={isMobile ? 30 : 50}  sx={{ color: '#0f7c8f' }} />
      </Box>
    </Box>
  ) : filteredData.length > 0 ? (
    filteredData.map((row, idx) => (
      <Box component="tr" key={idx}>
        <Box component="td">{row.srNo}</Box>
        <Box component="td">{row.tagId}</Box>
        <Box component="td">{row.shed}</Box>
        <Box component="td">{row.lac}</Box>
        <Box component="td">{row.type}</Box>
        <Box component="td">{row.calvingDate}</Box>
        <Box component="td">{row.dim}</Box>
        <Box component="td">{row.milk1}</Box>
        <Box component="td">{row.milk2}</Box>
        <Box component="td">{row.milk3}</Box>
        <Box component="td">{row.total}</Box>
      </Box>
    ))
  ) : (
    <Box component="tr">
      <Box
        component="td"
        colSpan={11}
        sx={{ textAlign: 'center', py: 2, color: '#7d7d7d' }}
      >
        {t('milking.common.noDataAvailable')}
      </Box>
    </Box>
  )}
</Box>

        </Box>
      </Box>
    </Box>
     {/* <Backdrop
          sx={{
            backgroundColor: 'transparent',
            zIndex: (theme) => theme.zIndex.drawer + 1,
          }}
          open={loading}
        >
          <CircularProgress size={40} sx={{ color: '#0f7c8f' }} />
    </Backdrop> */}
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

export default DailyMilkReport;