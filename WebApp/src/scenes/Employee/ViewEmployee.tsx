import React, { useState,useEffect } from 'react';
import { useScrollToTopOnMount } from '../../shared/components/Hooks/useScrollToTop';
import {
  Box,
  Typography,
  TextField,
  Button,
  IconButton,
  Chip,
  Pagination,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  CircularProgress,
  useTheme
} from '@mui/material';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { tokens } from '../../shared/theme/theme';
import { getAllEmployees , GetEmployeeResponse,deleteEmployee,updateEmployee} from '../../shared/services/EmployeeAPI/viewemployee.service';


export default function ViewEmployees() {
  // Ensure page starts from top when component mounts
  useScrollToTopOnMount();
  const navigate = useNavigate();

const [employees, setEmployees] = useState<GetEmployeeResponse[]>([]);
const [searchQuery, setSearchQuery] = useState('');
 const [openConfirmDialog, setOpenConfirmDialog] = useState(false);
const [selectedUuid, setSelectedUuid] = useState<string | null>(null);
const [openEditDialog, setOpenEditDialog] = useState(false);
const [selectedEmployee, setSelectedEmployee] = useState<GetEmployeeResponse | null>(null);
 const [isSubmitting, setIsSubmitting] = useState(false);
const [selectedSrNo, setSelectedSrNo] = useState<number | null>(null);
const capitalize = (str: string | undefined): string => {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};


const handleOpenDialog = (uuid: string) => {
  setSelectedUuid(uuid);
  setOpenConfirmDialog(true);
}; 

const handleEditClick = (employee: GetEmployeeResponse,srNo: number) => {
  setSelectedEmployee(employee);
   setSelectedSrNo(srNo); 
  setOpenEditDialog(true);
};


const formatDate = (dateStr: string | undefined): string => {
  if (!dateStr) return '';
  
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('default', { month: 'short' }); // "Jan", "Feb", ...
  const year = date.getFullYear();

  // Add ordinal suffix to day (1st, 2nd, 3rd, 4th...)
  const getOrdinal = (n: number) => {
    if (n > 3 && n < 21) return `${n}th`;
    switch (n % 10) {
      case 1: return `${n}st`;
      case 2: return `${n}nd`;
      case 3: return `${n}rd`;
      default: return `${n}th`;
    }
  };

  return `${getOrdinal(day)}-${month}-${year}`;
};


const handleDelete = async (uuid: string) => {
  try {
    await deleteEmployee(uuid);
    const updatedList = await getAllEmployees();
    setEmployees(updatedList);
  } catch (error) {
    console.error('Failed to delete employee:', error);
  }
};


const handleUpdateSubmit = async () => {
  if (!selectedEmployee) return;
  setIsSubmitting(true);

  try {
    await updateEmployee(selectedEmployee.uuid, selectedEmployee); 
    const updatedList = await getAllEmployees(); 
    setEmployees(updatedList);
    setOpenEditDialog(false); 
    setSelectedEmployee(null); 
  } catch (error) {
    console.error('Failed to update employee:', error);
  }
  finally {
    setIsSubmitting(false); 
  }
};


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
 const filteredEmployees = employees.filter((emp) => {
  const query = searchQuery.toLowerCase();
  return (
    emp.name.toLowerCase().includes(query) ||
    emp.phone.toLowerCase().includes(query) ||
    String(emp.salary).toLowerCase().includes(query)
  );
});
const paginatedEmployees = filteredEmployees.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );
 
  useEffect(() => {
  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      setEmployees(data);
      // console.log("Employee data from backend:", data);
      // console.log("API Response:", data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  fetchEmployees();
}, []);

  return (
    <PageContainer title="View Employees">
      <Box sx={{backgroundColor: theme.palette.background.paper,
       
          borderRadius: 2,
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.05)'
      }}>

  
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { sm: 'center' },
          justifyContent: 'space-between',
          gap: 2,
    
          p:{xs:2,md:3}
        }}
      >
        <TextField
          placeholder="Search by Name , Phone Number or Salary"
          size="small"
           value={searchQuery}
           onChange={(e) => setSearchQuery(e.target.value)}
          sx={{
            width: '100%',
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#fff',
            border: '1px solid #ccc',
            borderRadius: 2,
            '& .MuiInputBase-root': {
              borderRadius: 1
            }
          }}
        />
      </Box>

      <Box sx={{ overflowX: 'auto',  width: '100%', }}>
        <Box
          component="table"
          sx={{
            width: '100%',
           minWidth: { xs: '600px', md: '100%' }, 
            borderCollapse: 'collapse',
            '& thead': {
              borderBottom: '1px solid #e2e8f0',
              backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f9fA'
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
          <thead>
            <tr>
              <th>Sr#</th>
              <th>Name</th>
              <th>Father Name</th>
              <th>Hire Date</th>
              <th>Phone Number</th>
              <th>Designation</th>
              <th>Department</th>
              <th>Salary</th>
              <th>Edit</th>
            </tr>
          </thead>
          <tbody>
            {paginatedEmployees.map((emp, index) => (
              <tr key={index}>
                <td>{(page - 1) * ITEMS_PER_PAGE + index + 1}</td>
                
             
                  <td>{emp.name}</td>
                {/* <td>{capitalize(emp.father_name)}</td> */}
                <td>{emp.father_name}</td>
                <td>{formatDate(emp.doj)}</td>
                <td>{emp.phone}</td>
                <td>{emp.designation}</td>
                <td>{emp.department}</td>
                <td>{emp.salary}</td>
                
                <td>
                  <Box>
                    <IconButton
                      size="small"
                      color="info"
                      onClick={() => navigate(`/employee/profile/${emp.uuid}`)}
                    >
                      <VisibilityIcon fontSize="small" />
                    </IconButton>
                      <IconButton 
          size="small" 
          color="primary"  
          onClick={() => handleEditClick(emp, (page - 1) * ITEMS_PER_PAGE + index + 1)}
        >
          <EditIcon fontSize="small" />
        </IconButton>
                    <IconButton size="small" color="error"  onClick={() => handleDelete(emp.uuid)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Box>
                </td>
              </tr>
            ))}
          </tbody>
        </Box>
      </Box>
       
      {/* Pagination */}
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end',pb:2 }}>
        <Pagination
          count={Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE)}
          page={page}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>
    </Box>

<Dialog
  open={openEditDialog}
  onClose={() => setOpenEditDialog(false)}

  fullWidth
 
      PaperProps={{
      sx: {
      minHeight: '45vh',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid white',
      borderRadius: 4,
      maxWidth:'1200px',
      left:'8%'
      
    }

   }}
>
  <DialogTitle sx={{ fontWeight: 'bold' , textAlign: 'center' ,mt:0.5}}>
    Edit Employee
  </DialogTitle>

  <DialogContent>
    <Box sx={{ overflowX: 'auto' }}>
      <Box
        component="table"
        sx={{
          width: '100%',
          minWidth: '900px',
          borderCollapse: 'collapse',
          mt:2,

          '& thead': {
            borderBottom: '1px solid #e2e8f0',
            backgroundColor: '#F8F9FA',
          },
          '& th': {
            textAlign: 'left',
            fontWeight: 600,
            color: '#111827',
            py: 1.5,
            px: 2,
            whiteSpace: 'nowrap',
          },
          '& td': {
            py: 1.5,
            px: 1,
            verticalAlign: 'middle',
            whiteSpace: 'nowrap',
          },
          '& tbody tr': {
            borderBottom: '1px solid #e2e8f0',
          },
        }}
      >
        <thead>
          <tr>
            <th>Sr#</th>
            <th>Name</th>
            <th>Father Name</th>
            <th>Hire Date</th>
            <th>Phone</th>
            <th>Designation</th>
            <th>Department</th>
            <th>Salary</th>
            {/* <th>Status</th> */}
          </tr>
        </thead>
        <tbody>
          <tr key={selectedEmployee?.uuid|| 'edit-row'}>
             <td>{selectedSrNo}</td> 
            <td>
              <input
                type="text"
                // value={capitalize(selectedEmployee?.name || '')}
                 value={selectedEmployee?.name || ''}

                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee!,
                    name: e.target.value,
                  })
                }
                style={{
                  width: '110px',
                   padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </td>
            <td>
              <input
                type="text"
                // value={capitalize(selectedEmployee?.father_name || '')}
                   value={selectedEmployee?.father_name || ''}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee!,
                    father_name: e.target.value,
                  })
                }
                style={{
                  width: '110px',
                  padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </td>
            <td>
              <input
                type="date"
                value={selectedEmployee?.doj || ''}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee!,
                    doj: e.target.value,
                  })
                }
                style={{
                  width: '150px',
                  padding: '6px',
                
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </td>
            <td>
              <input
                type="text"
                value={selectedEmployee?.phone || ''}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee!,
                    phone: e.target.value,
                  })
                }
                style={{
                  width: '120px',
                  padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </td>
            <td>
           
 <FormControl >
  <Select
    value={selectedEmployee?.designation || 'Manager'}
     size="small"
    onChange={(e) =>
      setSelectedEmployee({
        ...selectedEmployee!,
        designation: e.target.value,
       
      })
    }
    
                   sx={{ 
                   width: '120px',
                  // border: '1px solid #ccc',
                  borderRadius: '6px',
                   height: 33,
                  
                   }}
  >
    <MenuItem value="Manager">Manager</MenuItem>
    <MenuItem value="Supervisor">Supervisor</MenuItem>
  </Select>
</FormControl>

            </td>
            <td>
          

<FormControl>
  <Select
    value={selectedEmployee?.department || 'HR'}
     size="small"
    onChange={(e) =>
      setSelectedEmployee({
        ...selectedEmployee!,
        department: e.target.value,
      })
    }
     sx={{ width: '110px',
      height: 34,
 
                  // border: '1px solid #ccc',
                  borderRadius: '6px',
      }}
  >
    <MenuItem value="HR">HR</MenuItem>
    <MenuItem value="Finance">Finance</MenuItem>
  </Select>
</FormControl>

            </td>
            <td>
              <input
                type="number"
                value={selectedEmployee?.salary || 0}
                onChange={(e) =>
                  setSelectedEmployee({
                    ...selectedEmployee!,
                    salary: Number(e.target.value),
                  })
                }
                style={{
                  width: '100px',
                  padding: '6px',
                  border: '1px solid #ccc',
                  borderRadius: '6px',
                }}
              />
            </td>
           
          </tr>
        </tbody>
      </Box>
    </Box>
  </DialogContent>



   <Box
          sx={{
          
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
             mb:{xs:1,md:5}
          }}
        >
          <Button
           onClick={() => setOpenEditDialog(false)}
            variant="contained"
            sx={{
              px: 6,
              py: 0.75,
              fontSize: '0.85rem',
              fontWeight: '500',
              textTransform: 'none',
              backgroundColor: '#d3d3d3',
              color: '#000',
              '&:hover': { backgroundColor: '#bcbcbc' },
              boxShadow: 1,
              borderRadius: 1
            }}
            
          
          >
            Cancel
          </Button>
        
          <Button
            variant="contained"
            onClick={handleUpdateSubmit}
             disabled={isSubmitting} 
            sx={{
              px: 6,
              py: 0.75,
              fontSize: '0.85rem',
              fontWeight: '500',
              textTransform: 'none',
              backgroundColor: '#005f73',
              '&:hover': { backgroundColor: '#007f91' },
              boxShadow: 1,
              borderRadius: 1
            }}
           
          >
           {/* Update */}
            {isSubmitting ? (
                 <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> 
               ) : ( 
                 "Update"
                )} 
          </Button>
        </Box>
</Dialog>


     </PageContainer>
  );
}
