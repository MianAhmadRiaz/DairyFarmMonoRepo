import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Menu,
  MenuItem,
  Stack,
  IconButton,
  Pagination,
  useTheme
} from '@mui/material';
import {
  Search,
  FilterList,
  FileCopy,
  Print,
  GetApp,
  PictureAsPdf,
  TableChart,
  ArrowDropDown
} from '@mui/icons-material';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { getAttendance ,Employee,getAllEmployees ,MappedAttendance } from '../../shared/services/EmployeeAPI/attendance.service';
import { tokens } from '../../shared/theme/theme';

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([]);

const [attendanceRecords, setAttendanceRecords] = useState<{ [key: string]: { [date: string]: 'present' | 'absent'|'leave' } }>({});
const [weeks, setWeeks] = useState<string[][]>([]);
const [weekPage, setWeekPage] = useState(1);
const [searchTerm, setSearchTerm] = useState("");


 const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const ITEMS_PER_PAGE = 5;
    const [page, setPage] = useState(1);
  
    const handlePageChange = (
      _event: React.ChangeEvent<unknown>,
      value: number
    ) => {
      setPage(value);
    };
  
   


  const [startDate, setstartDate] = useState('');
  const [endDate, setendDate] = useState('');
const [dates, setDates] = useState<string[]>([]);



const handleFetchAttendance = async () => {
  if (!startDate || !endDate) {
    alert("Select both start and end dates!");
    return;
  }

  try {
  
    generateDates(startDate, endDate);
    const attendanceData: MappedAttendance[] = await getAttendance(startDate, endDate);

    const records: { [key: string]: { [date: string]: 'present' | 'absent' | 'leave' } } = {};

    attendanceData.forEach((emp: MappedAttendance) => {
      if (!records[emp.userId]) records[emp.userId] = {};

      emp.attendance.forEach((att) => {
    function formatDateRaw(dateStr: string) {
  return dateStr.split("T")[0].split("-").reverse().join("-");
}
records[emp.userId][formatDateRaw(att.date)] = att.status;


      });
    });

    setAttendanceRecords(records);

  } catch (error) {
    console.error("Error fetching attendance:", error);
    alert("Failed to fetch attendance records");
  }
};





  function generateDates(start: string, end: string) {
  if (!start || !end) {
    alert("Select both dates!");
    return;
  }

  const startDate = new Date(start);
  const endDate = new Date(end);
  const dates: Array<string> = [];

  while (startDate <= endDate) {   
    const formatted = startDate
      .toISOString()
      .split("T")[0]
      .split("-")
      .reverse()
      .join("-");
    dates.push(formatted);
    startDate.setDate(startDate.getDate() + 1);
  }

  console.log(dates);
  setDates(dates);
}
 

const filteredEmployees = useMemo(() => {
  if (!searchTerm) return employees;

  const lowerSearch = searchTerm.toLowerCase();

  return employees.filter((emp) => {
   
    const matchesName = emp.name.toLowerCase().includes(lowerSearch);

    const matchesDate = weeks.flat().some((date) =>
      date.includes(lowerSearch)
    );

    return matchesName || matchesDate;
  });
}, [searchTerm, employees, weeks]);


  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees(); 
      setEmployees(data);
    } catch (err) {
      console.error(err);
      // alert('Failed to fetch employees');
    }
  };
  fetchEmployees();
}, []);

const handleChunkDates = (dates: string[], size: number = 7) => {
  const chunks: string[][] = [];
  for (let i = 0; i < dates.length; i += size) {
    chunks.push(dates.slice(i, i + size));
  }
  return chunks;
};

useEffect(() => {
  if (dates.length > 0) {
    const chunked = handleChunkDates(dates, 7);
    setWeeks(chunked);
    setWeekPage(1); 
  }
}, [dates]);



    const paginatedEmployees = useMemo(() => {
  return filteredEmployees.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
}, [filteredEmployees, page]);


  return (
    <PageContainer title="View Attendance Report">
      <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: '12px',
          mt: 4,
          width: {xs:'100%',md:'1000px'}
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
    flexDirection: {  md: 'row' },
    gap: 3,
    justifyContent: { xs: 'space-between', md: 'start' },
    flexWrap: 'wrap',
            }}
          >
            <Box
              sx={{
               
                width: { xs: '48%', md: 'calc(33.33% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                Start Date
              </label>
              <TextField
                size="small"
                type="date"
                placeholder="Select"
                variant="outlined"
                value={startDate}
                onChange={(e)=>setstartDate(e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
            <Box
              sx={{
                 width: { xs: '48%', md: 'calc(33.33% - 16px)' },
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              <label style={{ marginBottom: '4px', fontWeight: 'bold' }}>
                End Date
              </label>
              <TextField
                size="small"
                type="date"
                placeholder="Select"
                variant="outlined"
                value={endDate}
                onChange={(e)=>setendDate(e.target.value)}
                InputLabelProps={{
                  shrink: true
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2
                  }
                }}
              />
            </Box>
            <Box sx={{
              mt: { xs: 1.5, md: 0 },
ml: { xs: 'auto', md: 3 },
alignSelf: 'flex-end'
             }}>
              <Button
                variant="contained"
                onClick={handleFetchAttendance}
                sx={{
                  backgroundColor: '#005f73',
                  textTransform: 'none',
                  px: 5,
                  py: 0.7,
                  borderRadius: 2,
                  '&:hover': {
                    backgroundColor: '#007f91'
                  }
                }}
              >
                Get
              </Button>
            </Box>
          </Box>
        </CardContent>
      </Card>
    <Card
  sx={{
    mb: 3,
    boxShadow: 3,
    borderRadius: '12px',
    mt: 4,
    width: { xs: '100%', md: '1000px' },
    overflowX: 'auto',
  }}
>
  <CardContent>
    <Stack
  direction="row"
  spacing={2}
  flexWrap="wrap"
  useFlexGap
  alignItems={{ xs: 'stretch', sm: 'center' }}
>
  {/* Search + Filter */}
  <Stack direction="row" spacing={2} sx={{ flexGrow: 1, width: { xs: '100%', sm: 'auto' } }}>
    
<TextField
  size="small"
  placeholder="Search by name or date"
  value={searchTerm}
  onChange={(e) => {
    setSearchTerm(e.target.value);
    setPage(1); 
  }}
  InputProps={{
    startAdornment: <Search fontSize="small" sx={{ mr: 1 }} />,
  }}
  sx={{ backgroundColor: 'white', flex: 1 }}
/>

    <Button
      variant="outlined"
      startIcon={<FilterList />}
      endIcon={<ArrowDropDown />}
      sx={{ backgroundColor: 'white', whiteSpace: 'nowrap' }}
    >
      Filter
    </Button>
  </Stack>

  {/* Copy + Excel + CSV */}
  <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
    <Button variant="outlined" sx={{ backgroundColor: 'white' }} startIcon={<FileCopy />}>
      Copy
    </Button>
    <Button variant="outlined" sx={{ backgroundColor: 'white' }} startIcon={<TableChart />}>
      Excel
    </Button>
    <Button variant="outlined" sx={{ backgroundColor: 'white' }} startIcon={<GetApp />}>
      CSV
    </Button>
  </Stack>

  {/* PDF + Print */}
  <Stack direction="row" spacing={2} sx={{ width: { xs: '100%', sm: 'auto' } }}>
    <Button variant="outlined" sx={{ backgroundColor: 'white' }} startIcon={<PictureAsPdf />}>
      PDF
    </Button>
    <Button
      variant="outlined"
      sx={{ backgroundColor: 'white' }}
      startIcon={<Print />}
      endIcon={<ArrowDropDown />}
    >
      Print
    </Button>
  </Stack>
</Stack>

  </CardContent>
</Card>


       <Card
        sx={{
          mb: 3,
          boxShadow: 3,
          borderRadius: 4,
          mt: 4,
          width: {xs:'100%',md:'1000px'},
         
        }}
      >

        <CardContent
  sx={{
    mt: -2,
    mx: -2,
  }}
>
  <Box sx={{ width: "100%", overflowX: "auto" }}>
    <Box
      component="table"
      sx={{
        width: "100%",
        borderCollapse: "collapse",
        minWidth: { xs: "400px", md: "100%" },
        "& thead": {
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA',
        },

        "& th": {
          fontWeight: 600,
          color: "#111827",
          py: 1.5,
          whiteSpace: "nowrap",
          ...(weeks.flat().length > 0
            ? {
                
                px: 1.5,
                textAlign: "center",
              }
            : {
                
                px: 8.2,
                textAlign: "left",
              }),
        },
        "& td": {
          py: 1.5,
          verticalAlign: "middle",
          whiteSpace: "nowrap",
          ...(weeks.flat().length > 0
            ? {
                px: 5,
                textAlign: "center",
              }
            : {
                px: 8.5,
                textAlign: "left",
              }),
        },
        "& tbody tr": {
          borderBottom: "1px solid #e2e8f0",
        },
      }}
    >
      <thead>
        <tr>
          <th>Sr#</th>
          <th>Employee</th>

          {weeks.flat().map((date) => (
            <th key={date}>{date}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {paginatedEmployees.map((emp, index) => (
          <tr key={emp.uuid}>
            <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
            <td>{emp.name}</td>

            {weeks.flat().map((date, i) => (
              <td key={i}>
                {attendanceRecords[emp.uuid]?.[date] || "–"}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </Box>
  </Box>
</CardContent>

   

      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end',pb:2 }}>
       

        <Pagination
  count={Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)}
  page={page}
  onChange={handlePageChange}
  color="primary"
/>

      </Box>
         </Card>
    </PageContainer>
  );
}
