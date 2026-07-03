import React, { useEffect, useState } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { useLocation } from 'react-router-dom';


import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Select,
  MenuItem,
  Divider,
  Button,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TextField,
  FormControl,
  InputLabel,
  useTheme,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { SelectChangeEvent } from '@mui/material/Select';
import { fetchDashboardStats } from '../../shared/services/herdinfo.services';
import { fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph } from '../../shared/services/herdinfo.services';
import { getanimal } from '../../shared/services/getanimal.services';
import { LactationMilkData } from '../../shared/services/herdinfo.services';
import { CircularProgress, Backdrop } from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface AnimalData {
  pregnantPercentage: number;
  totalAnimals: number;
  totalPregnant: number;
  totalNonPregnant: number;
  dry: number;
  milk: number;
  heifers: number;
}

interface MilkEntry {
  period: string;
  total_milk: number;
}

interface MilkDataResponse {
  milkData: MilkEntry[];
  today_total_milk: number;
  yesterday_total_milk: number;
  avg_milk_per_cow: number;
  currentFilterMilk: number 
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


interface MilkData {
  month: string;
  monthNumber: string;
  milk1: number;
  milk2: number;
  milk3: number;
  milk: number;
}

interface LactationData {
  animal_curr_lactation: number;
  totalMilk: number;
}

interface LactationHistory {
  lactation: number;
  daysInMilk: number;
}

interface LactationMilkResponseData {
  totalMilk: number | null;
  currentLactation: number;
  DIM: number;
  milkData: MilkData[];
  lactationData: LactationData[];
  lactationHistory: LactationHistory[];
}

interface MergedLactationInfo {
  lactation: number;
  daysInMilk: number;
  averageMilk: string;
  totalMilk: number;
}


const MilkingDashbaord: React.FC = () => {
   const theme = useTheme();
   const colors = tokens(theme.palette.mode);

   const location = useLocation();
   const { isCollapsed } = location.state || {};


    const [loading, setLoading] = useState(false);

    const [Total_Milking_Cows , setTotal_Milking_Cows] = useState<number>(0);
    const [Total_DryOff_Cows , setTotal_DryOff_Cows] = useState<number>(0);
    
    const [Today_Milk , setToday_Milk] = useState<number>(0);
    const [Yesterday_Milk , setYesterday_Milk] = useState<number>(0);
    const [Average_Milk , setAverage_Milk] = useState<number>(0);
    const [currentFilterMilk , setcurrentFilterMilk] = useState<number>(0);

    const [startDate, setStartDate] = useState<string>("");
    const [endDate, setEndDate] = useState<string>("");

    //Filter for Production Stats
    const [selectedFilterValue, setSelectedFilterValue] = useState<string>("");

    //Trend of milk
    const[trend , set_trend] = useState<number>(0.0)
    //Arrow of trend
    const [arrow, setArrow] = useState("↔");

    //Milk Production Data for Graph
    const [milkProductionData, setMilkProductionData] = useState({
      labels: [] as string[],
      datasets: [
        {
          label: 'Milk in Liters',
          data: [] as number[],
          borderColor: '#77B255',
          backgroundColor: 'rgba(119, 178, 85, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#77B255',
          pointBorderColor: 'white',
          pointBorderWidth: 2
        }
      ]
    });
    
    //Milking Cows Tags
    const [tags, setTags] = useState<Tag[]>([]);
    //Selected Tag Id
    const [tagId, settagId] = useState<string>("Select Tag ID");
    //Lactatons Data
    const [TotalMilkOfSelectedLactation, setTotalMilkOfSelectedLactation] = useState<number | null>(0);
    const [DaysInMilkOfSelectedLactation, setDaysInMilkOfSelectedLactation] = useState<number | null>(0);
    const [CurrentLactation, setCurrentLactation] = useState<number>(0);
    const [SelectedLactation , setSelectedLactation] = useState<number>();

    const [LactationTableData, setLactationTableData] = useState<MergedLactationInfo[]>();
    const [LactationLineGraph , setLactationLineGraph] = useState({
      labels: [] as string[],
      datasets: [
        {
          label: 'Milk in Liters',
          data: [] as number[],
          borderColor: '#77B255',
          backgroundColor: 'rgba(119, 178, 85, 0.2)',
          fill: true,
          tension: 0.3,
          pointRadius: 5,
          pointHoverRadius: 7,
          pointBackgroundColor: '#77B255',
          pointBorderColor: 'white',
          pointBorderWidth: 2
        }
      ]
    });
     
    //Dohnut Graph Data For Per Lactation
    const [lactationDonutData, setLactationDonutData] = useState({
      labels: [] as string[],
      datasets: [
        {
          label: 'Milk (Liters)',
          data: [] as number[],
          backgroundColor: [] as string[],
        },
      ],
    });
    
    
    useEffect(()=>{
      const Get_Total_and_Dry_Off_Animal_Data=async function(){
        const data: AnimalData = await fetchDashboardStats();
        data?.milk && setTotal_Milking_Cows(data.milk);
        data?.dry && setTotal_DryOff_Cows(data.dry);    
      }

      const Get_Tags = async function(){
         try {
            const Response = await getanimal();
            if(Response?.data?.data?.animals){
                const animals: Animal[] = Response.data.data.animals;
       
              const femaleTags: Tag[] = animals
                .filter(animal => animal.gender === 'female' && animal.tag)
                .map(animal => animal.tag);
          
              setTags(femaleTags);
            }
          }
         catch (error) {
           setLoading(false);
           console.log(error) 
         }
      }
       setLoading(true);
      Get_Total_and_Dry_Off_Animal_Data();
      Get_Tags();
      setLoading(false);
    },[])


  useEffect(() => {
      const Get_Production_Graph_Milk_Variables = async () => {
      if (!selectedFilterValue || !startDate || !endDate) { return;}
      else if (new Date(startDate) >= new Date(endDate)) {
         toast.warning("Start date must be before end date");
         return
      }
      try {
          setLoading(true);
          const data: MilkDataResponse = await fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph(
            selectedFilterValue,
            startDate,
            endDate
          );
          setToday_Milk(data.today_total_milk);
          setYesterday_Milk(data.yesterday_total_milk);
          setAverage_Milk(data.avg_milk_per_cow);
          data?.currentFilterMilk && setcurrentFilterMilk(data.currentFilterMilk); 
          const milk_trend: number = Yesterday_Milk !== 0
          ? ((Today_Milk - Yesterday_Milk) / Yesterday_Milk) * 100
          : 0;
        
          set_trend(milk_trend);
          const arrow = Today_Milk > Yesterday_Milk ? "↑" : Today_Milk < Yesterday_Milk ? "↓" : "↔";
          setArrow(arrow);
             
          if (data?.milkData) {
            const formattedData = {
              labels: data.milkData.map((item: any) =>
                new Date(item.period).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: 'short'
                })
              ),
              datasets: [
                {
                  label: 'Milk in Liters',
                  data: data.milkData.map((item: any) => item.total_milk),
                  borderColor: '#77B255',
                  backgroundColor: 'rgba(119, 178, 85, 0.2)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  pointBackgroundColor: '#77B255',
                  pointBorderColor: 'white',
                  pointBorderWidth: 2,
                  animation: {
                    duration: data.milkData.length > 50 ? 0 : 1000
                  },
                  interaction: {
                    mode: 'nearest',
                    intersect: false
                  },
                }
              ]
            };
            setMilkProductionData(formattedData);
            setLoading(false);
          }
        } catch (error: any) { 
          console.log("Something went wrong while Fetching Data");
          setLoading(false)
        }
      };
      
      Get_Production_Graph_Milk_Variables();
  }, [startDate, endDate, selectedFilterValue]);

  useEffect(()=>{
    const getLactationData = async function(){
      try {
        setLoading(true);
        const Response = await getanimal();
        const animals: Animal[] = Response.data.data.animals;
        const foundAnimal = animals.find(animal => animal.tag.name === tagId);
        if(foundAnimal){ 
          const { uuid } = foundAnimal;
          const LactationResponse: LactationMilkResponseData = await LactationMilkData(uuid);

          setCurrentLactation(LactationResponse.currentLactation);

          const MergedLactationInfo = LactationResponse.lactationData.map(ld=>{
            const history = LactationResponse.lactationHistory.find(lh=>
               lh.lactation === ld.animal_curr_lactation
            )
            const daysInMilk = history?.daysInMilk ?? 0;
            const averageMilk =
              daysInMilk !== undefined && daysInMilk > 0
                ? (ld.totalMilk / daysInMilk).toFixed(2)
                : "0.00";
            
            return {
              lactation: ld.animal_curr_lactation,
              daysInMilk,
              averageMilk,
              totalMilk: ld.totalMilk
            };
          })

          if(LactationResponse?.milkData){
            const formattedData =  {
              labels: LactationResponse.milkData.map((item: any) => item.month),
              datasets: [
                {
                  label: 'Milk in Liters',
                  data: LactationResponse.milkData.map((item: any) => item.milk),
                  borderColor: '#77B255',
                  backgroundColor: 'rgba(119, 178, 85, 0.2)',
                  fill: true,
                  tension: 0.3,
                  pointRadius: 5,
                  pointHoverRadius: 7,
                  pointBackgroundColor: '#77B255',
                  pointBorderColor: 'white',
                  pointBorderWidth: 2,
                  interaction: {
                    mode: 'nearest',
                    intersect: false
                  },
                }
              ]
            };
            setLactationLineGraph(formattedData);
          }

          if(LactationResponse?.lactationData){
            const datasets = LactationResponse.lactationData.map(item => item.totalMilk);
            const labels = LactationResponse.lactationData.map(
              item => `Lactation ${item.animal_curr_lactation} - Milk: ${item.totalMilk}L`
            );
            const backgroundColors = [
              '#77B255', '#FFC107', '#5BC0EB', '#FF5733', '#9C27B0', 
              '#FF9800', '#4CAF50', '#E91E63', '#03A9F4', '#8BC34A', 
              '#FFEB3B', '#795548'
            ];
            const updatedData = {
              labels,
              datasets: [
                {
                  label: 'Milk (Liters)',
                  data: datasets,
                  backgroundColor: backgroundColors.slice(0, labels.length),
                },
              ],
            };
         
            setLactationDonutData(updatedData);
          }

          setLactationTableData(MergedLactationInfo);
        }
        setLoading(false);
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    }
    getLactationData();
  },[tagId])


  useEffect(()=>{
    if (SelectedLactation !== undefined && tagId) {
      setLoading(true);
      const selected = LactationTableData?.find(item => item.lactation === SelectedLactation);
      if (selected) {
        setTotalMilkOfSelectedLactation(selected.totalMilk);
        setDaysInMilkOfSelectedLactation(selected.daysInMilk);
      } else {
        setTotalMilkOfSelectedLactation(null);
        setDaysInMilkOfSelectedLactation(null);
      }
      setLoading(false);
    }
  },[SelectedLactation])


  const milkProductionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 30
        }
      },
      y: {
        beginAtZero: true
      }
    }  
  };

  const lactationLineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: {
          autoSkip: true,
          maxRotation: 45,
          minRotation: 30
        }
      },
      y: {
        beginAtZero: true
      }
    }
  };
      
  const lactationDonutOptions = {
    plugins: {
      legend: {
        display: true,
        position: "left" as const,
        labels: {
          boxWidth: 12,
          padding: 20,
          textAlign: "left" as const,
        }
      }
    },
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2, 
  };


  return (
    <PageContainer title="Milking Dashboard" subtitle="Track and manage milk production data">

      <Box sx={{ display: 'flex', gap: 2 , mb:4}}>
        <TextField
          size="small"
          label="Start Date"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value as string)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          size="small"
          label="End Date"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value as string)}
          InputLabelProps={{ shrink: true
          }}
          inputProps={{
            max: new Date().toISOString().split('T')[0]
          }}
        />
      </Box>

      {/* STATISTICS CARD (ICONS + SELECT) */}
      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={styles().statsHeader}>
            <Typography variant="h6" fontWeight="bold">
              Statistics
            </Typography>
            <Select
              size="small"
              value={selectedFilterValue}
              onChange={(e) => setSelectedFilterValue(e.target.value as string)}          
              displayEmpty
              sx={{ minWidth: 120 }}
            >
              <MenuItem value="week">Week</MenuItem>
              <MenuItem value="month">Month</MenuItem>
              <MenuItem value="year">Year</MenuItem>
            </Select>
          </Box>

          <Grid container spacing={2} sx={{ mt: 2 }}>
            {/* Stat #1: Total Milking Cows */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={styles().statItem}>
                <Box sx={styles().iconWrapper}>
                  <img src="./assets/milkicon.png" alt="Total Milking Cows" style={styles().iconStyle as React.CSSProperties}/>
                </Box>
                <Box>
                  <Typography sx={styles().statValue}>{Total_Milking_Cows}</Typography>
                  <Typography sx={styles().statLabel}>Total Milking Cows</Typography>
                </Box>
              </Box>
            </Grid>
            
            {/* Stat #2: Dry off Animals */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={styles().statItem}>
                <Box sx={styles().iconWrapper}>
                  <img src="./assets/milkicon.png"alt="Dry off Animals" style={styles().iconStyle as React.CSSProperties}/>
                </Box>
                <Box>
                  <Typography sx={styles().statValue}>{Total_DryOff_Cows}</Typography>
                  <Typography sx={styles().statLabel}>Dry off Animals</Typography>
                </Box>
              </Box>
            </Grid>

            {/* Dynamic Stat Box */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={styles().statItem}>
                <Box sx={styles().iconWrapper}>
                  <img src="./assets/milkicon.png" alt="Milk Icon" style={styles().iconStyle as React.CSSProperties}/>
                </Box>
                <Box>
                  <Typography sx={styles().statValue}>
                    {currentFilterMilk}
                  </Typography>
                  <Typography sx={styles().statLabel}>
                  {selectedFilterValue === 'month'
                    ? 'Current Month Milk'
                    : selectedFilterValue === 'week'
                    ? 'Current Week Milk'
                    : 'Current Year Milk'
                  }
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Stat #4: Today Milk */}
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={styles().statItem}>
                <Box sx={styles().iconWrapper}>
                  <img src="./assets/milkicon.png" alt="Today Milk" style={styles().iconStyle as React.CSSProperties}/>
                </Box>
                <Box>
                  <Typography sx={styles().statValue}>{Today_Milk}</Typography>
                  <Typography sx={styles().statLabel}>Today Milk</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* PRODUCTION STATS (Existing Code) */}
      <Card sx={{ mb: 3, boxShadow: 2, borderRadius: 2 }}>
      <CardContent>
        {/* SECTION TITLE */}
        <Typography variant="h6" fontWeight="bold" sx={{ mb: 2 }}>
          Production Stats
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap' }}>
          {/* LEFT COLUMN: Stats */}
          <Box
            sx={{
              flex: '1 1 250px',
              display: 'flex',
              flexDirection: 'column',
              marginLeft:'250px',
              justifyContent: 'space-between',
              pr: { xs: 0, md: 3 }
            }}
          >
            {/* Today's Milk */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>
                Today’s Milk (L)
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                {Today_Milk}
              </Typography>
            </Box>

            {/* Yesterday's Milk */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>
                Yesterday’s Milk (L)
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                {Yesterday_Milk}
              </Typography>
            </Box>

            {/* Avg/Cow */}
            <Box sx={{ mb: 2 }}>
              <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>
                Avg/Cow (L)
              </Typography>
              <Typography variant="h5" fontWeight="bold" sx={{ mt: 0.5 }}>
                {Average_Milk}
              </Typography>
            </Box>

            {/* Trend */}
            <Box>
              <Typography sx={{ color: '#555', fontSize: '0.9rem' }}>Trend:</Typography>
              <Typography sx={{ color: 'green', fontSize: '1rem', fontWeight: 'bold' }}>
                {trend}% <span style={{ fontSize: '0.8rem' }}>{arrow}</span>
              </Typography>
            </Box>
          </Box>

          {/* VERTICAL DIVIDER */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', md: 'block' }, mx: 2 }}
          />

          {/* RIGHT COLUMN: Chart */}
          <Box sx={{ flex: '2 1 400px', mt: { xs: 2, md: 0 } }}>
            {/* Top row: Chart Title & Filter */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 2
              }}
            >
              <Typography variant="subtitle1" fontWeight="bold">
                Milk Production Trend
              </Typography>
            </Box>

            {/* Chart Container */}
            <Box sx={{ height: 300 }}>
              <Line data={milkProductionData} options={milkProductionOptions} />
            </Box>
          </Box>
        </Box>
      </CardContent>
     </Card>

      {/* LACTATION SECTION*/}
      <Card sx={{ boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box sx={styles().lactationFilters}>
            <Select defaultValue="Select Tag ID" value={tagId} onChange={(e) => settagId(e.target.value as string)} size="small" sx={{ mr: 2 }}>
            <MenuItem value="Select Tag ID">Select Tag ID</MenuItem>
               {tags.map((t, idx) => (
                  <MenuItem key={idx} value={t.name}>
                    {t.name}
                  </MenuItem>
                ))}

            </Select>
            <FormControl size="small" sx={{ width: '150px' }}>
              <InputLabel id="lactation-label">Select Lactation</InputLabel>
              <Select
                labelId="lactation-label"
                value={SelectedLactation}
                label="Lactation Count"
                onChange={(e) => setSelectedLactation(Number(e.target.value))}
              >
                {CurrentLactation > 0 &&
                  Array.from({ length: CurrentLactation }, (_, i) => (
                    <MenuItem key={i + 1} value={CurrentLactation - i}>
                      {CurrentLactation - i}
                    </MenuItem>
                  ))}
              </Select>
            </FormControl>
          </Box>

        <Grid container justifyContent="start" sx={{ mb: 4 }}>
          <Grid item xs={12} sm={8}>
            <Box sx={{ backgroundColor: "white", p: 3, borderRadius: 2, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: 4 }}>
              
              {/* Total Milk */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2">Total Milk of Selected Lactation</Typography>
                <Typography variant="h6" fontWeight="bold">{TotalMilkOfSelectedLactation}</Typography>
              </Box>
        
              {/* Days in Milk */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2">Days in Milk of Selected Lactation</Typography>
                <Typography variant="h6" fontWeight="bold">{DaysInMilkOfSelectedLactation}</Typography>
              </Box>
        
              {/* Current Lactation */}
              <Box sx={{ textAlign: "center" }}>
                <Typography variant="subtitle2">Current Lactation</Typography>
                <Typography variant="h6" fontWeight="bold">{CurrentLactation}</Typography>
              </Box>
        
            </Box>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ minHeight: 300 }}>
          <Grid item xs={12} md={8}>
            <Box sx={styles().chartWrapper}>
              <Line data={LactationLineGraph} options={lactationLineOptions} />
            </Box>
          </Grid>
          <Grid item xs={12} md={4}> 
              <Box sx={{ ...styles().chartWrapper, height: 400, p: 2, textAlign: 'center' }}>
                <Typography variant="h6" fontWeight="bold" mb={2}>
                  Milk Production per Lactation 
                </Typography>
                
                <Doughnut data={lactationDonutData} options={lactationDonutOptions} />
              </Box>
            </Grid>

        </Grid>

          <Table sx={styles().table}>
            <TableHead>
              <TableRow>
                <TableCell sx={styles().tableHeadCell}>Lactation #</TableCell>
                <TableCell sx={styles().tableHeadCell}>Days in Milk</TableCell>
                <TableCell sx={styles().tableHeadCell}>Avg Milk/Day</TableCell>
                <TableCell sx={styles().tableHeadCell}>Total Milk (L)</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
            {LactationTableData && LactationTableData.length > 0 ? (
               LactationTableData.map((row, index) => (
                 <TableRow key={index}>
                   <TableCell>{row.lactation}</TableCell>
                   <TableCell>{row.daysInMilk}</TableCell>
                   <TableCell>{row.averageMilk}</TableCell>
                   <TableCell>{row.totalMilk}</TableCell>
                 </TableRow>
               ))
             ) : (
               <TableRow>
                 <TableCell colSpan={4} align="center">
                   No data available
                 </TableCell>
               </TableRow>
            )}           
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    {/* <Backdrop
      sx={{
        backgroundColor: 'transparent',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={loading}
    >
      <CircularProgress sx={{ color: '#0f7c8f' }} />
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

// ----- SX styles() -----
const styles = () => ({
  // "Statistics" card top row
  statsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },

  // For each stat row with icon + text
  statItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 2
  },
  iconWrapper: {
    width: 48,
    height: 48,
    borderRadius: '50%',
    backgroundColor: '#eefaff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconStyle: {
    width: 24,
    height: 24
  },
  statValue: {
    fontSize: '1.2rem',
    fontWeight: 600
  },
  statLabel: {
    fontSize: '0.9rem',
    color: '#666'
  },

  statCard: {
    boxShadow: 2,
    borderRadius: 2
  },
  cardLabel: {
    color: 'GrayText'
  },
  cardValue: {
    mt: 1
  },

  productionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    mb: 2
  },
  productionDetails: {
    mt: 2
  },
  detailBox: {
    backgroundColor: '#f9fafb',
    p: 2,
    borderRadius: 1,
    textAlign: 'center',
    boxShadow: 1
  },
  lactationFilters: {
    display: 'flex',
    alignItems: 'center',
    mb: 2
  },
  chartWrapper: {
    backgroundColor: '#f9fafb',
    p: 2,
    height: '100%',
    borderRadius: 1,
    boxShadow: 1
  },
  statBox: {
    backgroundColor: '#f9fafb',
    p: 2,
    borderRadius: 1,
    textAlign: 'center',
    boxShadow: 1
  },
  table: {
    mt: 2
  },
  tableHeadCell: {
    fontWeight: 'bold',
    backgroundColor: '#f1f1f1'
  }
});

export default MilkingDashbaord;
