// MilkDifferenceReport.jsx

import React, { useState,useRef }  from 'react';
import { ReactElement } from "react";
import { MilkDifferenceReport as fetchMilkDifferenceReport } from '../../shared/services/milkDifference.service';
import {
  Box,
  Typography,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  SelectChangeEvent,
  useTheme,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { SxProps } from '@mui/material'; 
import PeopleIcon from '@mui/icons-material/People';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import RemoveShoppingCartIcon from '@mui/icons-material/RemoveShoppingCart';
import { useEffect } from 'react';
import { getTagBasedOnTagId } from '../../shared/services/getTagid.service';
import { CircularProgress, Backdrop } from '@mui/material';
import { ToastContainer, toast,Id } from 'react-toastify';
import { useTranslation } from 'react-i18next';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';


const MilkDifferenceReport = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { t } = useTranslation();

  interface MilkData {
    animalId: string;
    milkOnStartDate: number | null;
    milkOnEndDate: number | null;
    milkDifference: number | null;
    name: string;
    calving_date: string | null;
    lactation: number;
    breedType: string;
    animalType: string;
    pregnancyStatus: string | null;
    tagId: string;
    tagName: string;
    penName: string;
  }
  interface TableRecord {
    srNo: number;
    tagId: string;
    shed: string;
    lac: number;
    type: string;
    status: string;
    days: number | null;
    milkStart: number;
    milkEnd: number;
    diff: number;
  }
  
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [tableData, setTableData] = useState<TableRecord[]>([]);
  const [milkonStart, setmilkOnStart] = useState(0);
  const [milkonEnd, setmilkOnEnd] = useState(0);
  const [diff, setdiff] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filter, setFilter] = useState("All");
  const [filterData, setfilterData] = useState<TableRecord[]>([]);

  const [loading, setLoading] = useState(false);
  const toastId = useRef<Id | null>(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!startDate || !endDate) return;
      else if (new Date(startDate) >= new Date(endDate)) {
         toast.warning(t('milking.common.startBeforeEnd'));
          setLoading(false);
         return
      }

      try {
        setLoading(true);
        const response = await fetchMilkDifferenceReport(startDate, endDate);

        const milksArray: MilkData[] = response.data.data.milks;

        const totalMilkStart: number = milksArray.reduce(
          (acc: number, milk: MilkData) => acc + (milk.milkOnStartDate ?? 0),
          0
        );

        const totalMilkEnd: number = milksArray.reduce(
          (acc: number, milk: MilkData) => acc + (milk.milkOnEndDate ?? 0),
          0
        );
        const totalMilkDiff = Math.abs(totalMilkStart - totalMilkEnd);

        setmilkOnStart(totalMilkStart);
        setmilkOnEnd(totalMilkEnd);
        setdiff(totalMilkDiff);

        if (response?.data?.data?.milks) {
          const formattedData: TableRecord[] = milksArray.map((milk, index) => {
            const calvingDate = milk.calving_date ? new Date(milk.calving_date) : null;
            const today = new Date();
          
            const daysDifference = calvingDate
              ? Math.floor((today.getTime() - calvingDate.getTime()) / (1000 * 60 * 60 * 24))
              :null;
          
            return {
              srNo: index + 1,
              tagId: milk.tagName,
              shed: t('milking.milkDifferenceReport.penLabel', { name: milk.penName }),
              lac: milk.lactation,
              type: milk.animalType,
              status: milk.pregnancyStatus || "N/A",
              days: daysDifference,
              milkStart: milk.milkOnStartDate || 0,
              milkEnd: milk.milkOnEndDate || 0,
              diff: milk.milkDifference || 0,
            };
          });
          
          setfilterData(formattedData);
          setTableData(formattedData);
        } else {
          console.error('Unexpected response structure:', response);
         toast.error(t('milking.milkDifferenceReport.unexpectedResponse'), response);
        }
      setLoading(false);  
      } catch (error) {
         setLoading(false);
      toast.dismiss();
        toast.error(t('milking.milkDifferenceReport.fetchError'));
      }
    };
    fetchData();
  }, [startDate, endDate]);

  const handleFilterChange = (event: SelectChangeEvent) => {
    const selectedValue = event.target.value;
    setFilter(selectedValue);
    applyFilter(selectedValue);
  };
  
  const applyFilter = (selectedValue: string) => {
    if (selectedValue === "All") {
      setfilterData(tableData);
    } else {
      const filtered = tableData.filter((record) => record.status === selectedValue);
      setfilterData(filtered);
    }
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = event.target.value.toLowerCase();
    setSearchValue(value);
  
    if (value === "") {
      setfilterData(tableData);
    } else {
      const filtered = tableData.filter((record) =>
        Object.values(record).some((val) =>
          val?.toString().toLowerCase().includes(value)
        )
      );
      setfilterData(filtered);
    }
  };
  

  return (
<PageContainer title={t('milking.milkDifferenceReport.title')} maxWidth="1200px">
  <Box sx={{
    display: 'flex', 
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: { xs: 'flex-start', sm: 'flex-end' },
    gap: 2,
    mb: 3,
      ml: {xs:0,md:5},
  }}>
    <TextField
      label={t('milking.common.startDate')}
      type="date"
      sx={{ width: { xs: '100%', sm: 200 } }} 
      InputLabelProps={{ shrink: true }}
      value={startDate}
      onChange={e => setStartDate(e.target.value)}
    />
    <TextField
      label={t('milking.common.endDate')}
      type="date"
      sx={{ width: { xs: '100%', sm: 200 } }}
      InputLabelProps={{ shrink: true }}
      value={endDate}
      onChange={e => setEndDate(e.target.value)}
    />
  </Box>


  <Box
    sx={{
      display: 'grid',
      gridTemplateColumns: { 
        xs: '1fr', 
        sm: 'repeat(2, 1fr)', 
        md: 'repeat(3, 1fr)' 
      },
      gap: 3,
      mb: 4,
      //  ml: 10,
       ml: {xs:0,md:3},
    }}
  >
    <StatCard
      icon={<PeopleIcon />}
      color="#004f5e"
      label={t('milking.milkDifferenceReport.totalMilkOn', { date: startDate })}
      value={milkonStart}
    />

    <StatCard
      icon={<LocalShippingIcon />}
      color="#fa6400"
      label={t('milking.milkDifferenceReport.totalMilkOn', { date: endDate })}
      value={milkonEnd}
    />

    <StatCard
      icon={<RemoveShoppingCartIcon />}
      color="#ff5c8a"
      label={t('milking.milkDifferenceReport.difference')}
      value={diff}
      sx={{ gridColumn: { xs: '1', sm: 'span 2', md: 'auto' } }} 
    />
  </Box>
  <Box
  sx={{
  
    //  p: { xs: 2, sm: 3, md: 3 },
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
    ml:{xs:0,md:3}
  }}
>

  <Box
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { sm: 'center' },
      gap: 2,
      mb: 2,
      width: '100%',
        px: { xs: 1, sm: 0 }
    }}
  >
    <TextField
      placeholder={t('common.search')}
      size="small"
      sx={{ 
        flexGrow: 1,
         width: '100%',
         p: { xs: 2, md: 3 },
      }}
      
      value={searchValue}
      onChange={(e) => handleSearchChange(e)}
    />

    <FormControl size="small" sx={{ width: { xs: '100%', sm: 180 },
    mr:{md:3},
      px: { xs: 1.5, sm: 0 }
   }}>
      <InputLabel>{t('milking.common.filter')}</InputLabel>
      <Select label={t('milking.common.filter')} value={filter} onChange={handleFilterChange}>
        <MenuItem value="All">{t('milking.milkDifferenceReport.all')}</MenuItem>
        <MenuItem value="FRESH CALVER">{t('milking.milkDifferenceReport.filterOptions.freshCalver')}</MenuItem>
        <MenuItem value="INSEMINATED">{t('milking.milkDifferenceReport.filterOptions.inseminated')}</MenuItem>
      </Select>
    </FormControl>
  </Box>
 

  <Box
    sx={{
      backgroundColor: '#fff',
      boxShadow: 1,
      overflowX: 'auto',
       width: '100%',
         
    }}
  >
    <Box
      component="table"
      sx={{
        width: '100%',
        minWidth: { xs: '800px', sm: '100%' }, 
        borderCollapse: 'collapse',
        '& th': {
          textAlign: 'left',
          fontWeight: 600,
          py: 1.5,
          px: 2,
          color: '#111827',
          borderBottom: '1px solid #e2e8f0',
          whiteSpace: 'nowrap',
          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'
        },
        '& td': {
          py: 1.5,
          px: 2,
          borderBottom: '1px solid #e2e8f0',
          verticalAlign: 'middle',
          whiteSpace: 'nowrap'
        }
      }}
    >
      {/* Table Header */}
      <Box component="thead">
        <Box component="tr">
          <Box component="th">{t('milking.common.columns.srNo')}</Box>
          <Box component="th">{t('milking.common.columns.tagId')}</Box>
          <Box component="th">{t('milking.milkDifferenceReport.columns.shed')}</Box>
          <Box component="th">{t('milking.milkDifferenceReport.columns.lac')}</Box>
          <Box component="th">{t('milking.milkDifferenceReport.columns.type')}</Box>
          <Box component="th">{t('milking.milkDifferenceReport.columns.status')}</Box>
          <Box component="th">{t('milking.milkDifferenceReport.columns.days')}</Box>
          <Box component="th">{startDate}</Box>
          <Box component="th">{endDate}</Box>
          <Box component="th">{t('milking.milkDifferenceReport.columns.diff')}</Box>
        </Box>
      </Box>

      {/* Table Body */}
    <Box component="tbody">
  {loading ? (
    <Box component="tr">
      {/* Adjust empty columns to push loader under center */}
      <Box component="td" colSpan={4}></Box>
      <Box component="td" colSpan={2} sx={{ textAlign: 'center' }}>
        <CircularProgress sx={{ color: '#0f7c8f', my: 2 }} />
      </Box>
      <Box component="td" colSpan={4}></Box>
    </Box>
  ) : (
    filterData.map((row, index) => (
      <Box component="tr" key={index}>
        <Box component="td">{row.srNo}</Box>
        <Box component="td">{row.tagId}</Box>
        <Box component="td">{row.shed}</Box>
        <Box component="td">{row.lac}</Box>
        <Box component="td">{row.type}</Box>
        <Box component="td">
          {row.status ? (
            <Chip
              label={t('milking.milkDifferenceReport.statusValues.' + row.status, row.status)}
              sx={{
                backgroundColor: '#e6f9f0',
                color: '#0f5132',
                fontWeight: 600,
                border: '1px solid #badbcc',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            />
          ) : (
            <Chip
              label={t('milking.milkDifferenceReport.notFound')}
              sx={{
                backgroundColor: '#fcebea',
                color: '#842029',
                fontWeight: 600,
                border: '1px solid #f5c2c7',
                fontSize: { xs: '0.75rem', sm: '0.875rem' }
              }}
            />
          )}
        </Box>
        <Box component="td">{row.days}</Box>
        <Box component="td">{row.milkStart}</Box>
        <Box component="td">{row.milkEnd}</Box>
        <Box component="td">{row.diff}</Box>
      </Box>
    ))
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

interface StatCardProps {
  icon: ReactElement;
  color: string;
  label: string;
  value: number | string;
  sx?: SxProps;
}

const StatCard: React.FC<StatCardProps> = ({ icon, color, label, value, sx }) => (
  <Box
    sx={{
      backgroundColor: '#fff',
      boxShadow: 1,
      borderRadius: 2,
      p: 2,
      textAlign: 'center',
      ...sx
    }}
  >
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1 }}>
      {React.cloneElement(icon, { sx: { fontSize: 34, color } })}  
    </Box>
    <Typography sx={{ color: '#505A5F' }}>{label}</Typography>
    <Typography sx={{ fontSize: '1.5rem', fontWeight: 600 }}>
      {value}
    </Typography>
  </Box>
);

export default MilkDifferenceReport;
