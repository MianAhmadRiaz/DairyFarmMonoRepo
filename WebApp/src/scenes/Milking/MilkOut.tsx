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
  Divider,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Pagination,
  SelectChangeEvent,
  useTheme,
  useMediaQuery,
  Tooltip,
} from '@mui/material';
import { tokens } from '../../shared/theme/theme';
import { usePermissions } from '../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../shared/rbac/permissions';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {Avatar, Paper } from '@mui/material';
import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { getMilkByDate } from '../../shared/services/milkbydate.service';
import { getCompanies } from '../../shared/services/companies.services';
import { addNewCompany } from '../../shared/services/companies.services';
import { MilkOutPayload ,MilkConsumption } from '../../shared/services/milkout.service';
import { milk_out } from '../../shared/services/milkout.service';
import { getInternalConsumptions } from '../../shared/services/InternalConsumptions.service';
import { createInternalConsumptions } from '../../shared/services/InternalConsumptions.service';
import { CircularProgress, Backdrop } from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';


interface MilkByDate{
  total_milk: number,
  total_milk1: number,
  total_milk2: number,
  total_milk3: number,
  totalMilkOut: number,
  totalRemainingMilk: number,
}

interface Company {
  uuid: string;
  name: string;
  country: string;
  arrival_date: string;
}

interface OthersConsumptions {
  uuid: string;
  name: string;
}


interface Approved {
  firstname: string;
  lastname: string;
  email: string;
}

interface Company {
  uuid: string;
  name: string;
  country: string;
}

interface Category {
  uuid: string;
  name: string;
}

interface MilkTransaction {
  date: string;
  volume: number;
  outType: string;
  companyId: string | null;
  approved: Approved;
  companies: Company | null;  
  category: Category | null; 
}


const DayWiseMilking: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { can } = usePermissions();
  const canDispatch = can(PERMISSIONS.MILK_DISPATCH);
  // State
  const [selectedRole, setselectedRole] = useState < string > ("");

  const [isModalOpen, setModalOpen] = useState(false);
  const [OtherConsumptionModal , setOtherConsumptionModal] = useState(false);

  const [selectedDate, setselectedDate] = useState("");

  //Consumptions States
  const [companies , setCompanies] = useState<Company[]>([]);
  const [InternalConsumptions , setInternalConsumptions] = useState<OthersConsumptions[]>([]);

  //Selected Consumption States
  const [SelectedCompany , setSelectedCompany] = useState<string>("");
  const [OthersConsumption , setOthersConsumption] = useState<string>("");

  const [quantity , setquantity] = useState<number>();
  const [pricePerLitre, setPricePerLitre] = useState<string>("");
  const [fat, setFat] = useState<string>("");
  const [snf, setSnf] = useState<string>("");

  const [milkData, setMilkData] = useState([
    { value: 0, label: 'Total Milk (Liters)', icon: '🥛' },
    { value: 0, label: 'Total Milk Out (Liters)', icon: '⛔' },
    { value: 0, label: 'Remaining Milk (Liters)', icon: '⌛' },
  ]);

  const [loading, setLoading] = useState(false);

  //Transactions Data states
  const [filteredData, setfilteredData] = useState<MilkTransaction[]>([]);
  const [currentRows, setCurrentRows] = useState<MilkTransaction[]>([]);

  const [IsPreviousTransactionClick, setIsPreviousTransactionClick] = useState(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [TotalPages, setTotalPages] = useState(0);
  
  //Pagination Handlers
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number): void => {
    setCurrentPage(page);
  };
  
  const handleRowsPerPageChange = (event: SelectChangeEvent<number>): void => {
    setRowsPerPage(Number(event.target.value));
    setCurrentPage(1);
  };
  
  const toastId = useRef<Id | null>(null);
  useEffect(() => {
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    setTotalPages(totalPages);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const endIdx = startIdx + rowsPerPage;
    const paginatedRows = filteredData.slice(startIdx, endIdx);
    setCurrentRows(paginatedRows);

  }, [filteredData, currentPage, rowsPerPage]);

  //Add new Company Modal
  const AddNewCompany = async function(){
    setModalOpen(true)
  }
  

  const handleSave = async function () {
  const isSale = selectedRole === "Company";
  // Required field check
  const isFormValid =
    selectedDate &&
    selectedRole &&
    Number(quantity) > 0 &&
    (!isSale || SelectedCompany) &&
    (selectedRole !== "Others" || OthersConsumption);

  if (!isFormValid) {
    const errorMessage = "Please fill all the missing required fields";
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(errorMessage);
    }
    return;
  }

  if (isSale && !(Number(pricePerLitre) > 0)) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning("Please enter the price per litre for a milk sale");
    }
    return;
  }

  try {
    setLoading(true);
    toast.dismiss(); // dismiss previous error if any

    const remainingMilkEntry = milkData.find(item => item.label === 'Remaining Milk (Liters)');
    const remainingMilk = remainingMilkEntry?.value ?? 0;

    if (quantity !== undefined && quantity > remainingMilk) {
      toast.warning("Milk should be less than or equal to remaining milk!");
      return;
    }

    // Company sale → sell; internal category → other; direct types map 1:1
    const roleToOutType: Record<string, string> = {
      Company: "sell",
      Others: "other",
      "Suckler (Calves)": "suckler",
      Employee: "employee",
      Dumped: "dumped",
    };
    const outType = roleToOutType[selectedRole] || "other";

    let uuid: string | undefined;
    if (isSale) {
      uuid = companies.find(c => c.name === SelectedCompany)?.uuid;
      if (!uuid) {
        toast.error("Selected company not found.");
        return;
      }
    } else if (selectedRole === "Others") {
      uuid = InternalConsumptions.find(c => c.name === OthersConsumption)?.uuid;
      if (!uuid) {
        toast.error("Selected consumption category not found.");
        return;
      }
    }

    const ConsumptionPayload: MilkOutPayload = {
      outType,
      ...(isSale ? { companyId: uuid! } : {}),
      ...(selectedRole === "Others" ? { categoryId: uuid! } : {}),
      date: selectedDate,
      volume: quantity || 0,
      ...(isSale ? { pricePerLitre: Number(pricePerLitre) } : {}),
      ...(fat ? { fat: Number(fat) } : {}),
      ...(snf ? { snf: Number(snf) } : {}),
    } as MilkOutPayload;

    const response = await MilkConsumption(ConsumptionPayload);
    if (response?.status >= 200 && response?.status < 300) {
      toast.success("Consumption Added Successfully!");
      fetchMilkData();
      setSelectedCompany("");
      setOthersConsumption("");
      setquantity(0);
      setPricePerLitre("");
      setFat("");
      setSnf("");
      setselectedRole("");
    } else {
      toast.error("Something went wrong while adding consumption.");
    }
  } catch (error: any) {
    toast.error(error?.response?.data?.message || "Can't add consumption!");
    console.log(error?.response?.data?.message);
  } finally {
    setLoading(false);
  }
};

  //Modal Cancel Button Handler
  const handleCancel = () => {
    setselectedRole("");
    setquantity(0);
    setSelectedCompany("");
  };

  //Handle Previous Transaction Click
  const handlePreviousTransachtion =async function() {
    setLoading(true);
    setIsPreviousTransactionClick(true);
    setLoading(false);
  }


  const handleCloseModal = () => {
    setModalOpen(false);
  };
  const handleOthersCloseModal = () => {
    setOtherConsumptionModal(false);
  };

  const Companies = async function(){
    try {
          //Get Companies
          const ComapnyResponse = await getCompanies();
          setCompanies(ComapnyResponse?.data?.data?.companies);

          //Get Internal Consumptions
          const OthersConsumptionsResponse = await getInternalConsumptions();
          setInternalConsumptions(OthersConsumptionsResponse?.data?.data?.categories);

        } catch (error: any) {
          console.log(error.response.data.message);
        }
  }

  const fetchMilkData = async () => {
    if (!selectedDate) return;
  
    try {
      setLoading(true);
  
      const milkResponse = await getMilkByDate(selectedDate);
      const data: MilkByDate = milkResponse?.data?.data;
  
      setMilkData([
        { value: data.total_milk ?? 0, label: 'Total Milk (Liters)', icon: '🥛' },
        { value: data.totalMilkOut ?? 0, label: 'Total Milk Out (Liters)', icon: '⛔' },
        { value: data.totalRemainingMilk ?? 0, label: 'Remaining Milk (Liters)', icon: '⌛' },
      ]);
  
      //Get Transactions Data
      const response = await milk_out(selectedDate);
      const transactions: MilkTransaction[] = response?.data?.data?.milks;
      setfilteredData(transactions);
  
    } catch (error: any) {
      toast.error("Can't Fetched Data");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (selectedDate) {
      fetchMilkData();
      Companies();
    }
  }, [selectedDate]);
  
return (
  <PageContainer title="Milk Out" maxWidth="900px">
    <Card
     
        sx={{
  backgroundColor: 'transparent',
     margin: 0,
  }}
  elevation={0}
    >
      <CardHeader
        title="Milk Out"
        titleTypographyProps={{ variant: 'h5', fontWeight: 600 }}
        sx={{
          pb:{ xs:1,md:2},
          mb: 1,
        }}
      />

           <CardContent sx={{ display: 'flex', flexDirection: 'column', backgroundColor: theme.palette.background.paper,
                   p: { xs: 0.5, sm: 3, md: 1},
          borderRadius: "12px",
          boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
              }}>

    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', p: 2,
      
     }}>

      <TextField
        label="Select Date"
        type="date"
        value={selectedDate}
        onChange={(e) => setselectedDate(e.target.value as string)}
        sx={{ 
          width: { xs: '100%', md: 270 },
          m: 0,
          '& .MuiInputBase-root': { height: '56px' }
        }}
        InputLabelProps={{ shrink: true }}
      />
    </Box>

      <CardContent>
        {/* Milk Stats Row */}
       <Grid container spacing={2} mb={4}>
          {milkData.map((milk, index) => (
            <Grid
              item
              xs={12}
              sm={6}
              md={4}
              key={index}
              sx={{ display: 'flex', flexDirection: 'column' }}
            >
              <div className="flex flex-col h-full">
                <Paper
                  elevation={2}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2,
                    borderRadius: 3,
                    height: '100%',
                  }}
                >
                  <Avatar sx={{ bgcolor: '#e0f7fa', mr: 2 }}>
                    {milk.icon}
                  </Avatar>
                  <Box>
                    <Typography variant="h6" fontWeight="bold">
                      {milk.value}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {milk.label}
                    </Typography>
                  </Box>
                </Paper>
              </div>
            </Grid>
          ))}
        </Grid>

        {/* Form Controls Section */}
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel id="milk-product-label">Select</InputLabel>
              <Select
                labelId="report-to"
                label="Report to"
                value={selectedRole}
                onChange={(e) => setselectedRole(e.target.value as string)}
                required
              >
                <MenuItem value="Company">Company (Sale)</MenuItem>
                <MenuItem value="Suckler (Calves)">Suckler (Calves)</MenuItem>
                <MenuItem value="Employee">Employee</MenuItem>
                <MenuItem value="Dumped">Dumped / Withheld</MenuItem>
                <MenuItem value="Others">Others</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {selectedRole === "Company" && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="company-label">Company</InputLabel>
                  <Select
                    labelId="company-label"
                    label="Company"
                    value={SelectedCompany}
                    onChange={(e) => setSelectedCompany(e.target.value as string)}
                    required
                  >
                    {companies?.map((user) => (
                      <MenuItem value={user.name} key={user.name}>
                        {user.name}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem
                      onClick={AddNewCompany}
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      ➕ Add Company
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Quantity"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={quantity}
                  onChange={(e) => setquantity(Number(e.target.value))}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Price / Litre"
                  inputProps={{ min: 0, step: "0.01" }}
                  fullWidth
                  required
                  value={pricePerLitre}
                  onChange={(e) => setPricePerLitre(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Fat %"
                  inputProps={{ min: 0, step: "0.1" }}
                  fullWidth
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="SNF %"
                  inputProps={{ min: 0, step: "0.1" }}
                  fullWidth
                  value={snf}
                  onChange={(e) => setSnf(e.target.value)}
                />
              </Grid>
            </>
          )}

          {(selectedRole === "Suckler (Calves)" || selectedRole === "Employee" || selectedRole === "Dumped") && (
            <Grid item xs={12} md={4}>
              <TextField
                type="number"
                label="Quantity"
                inputProps={{ min: 0 }}
                fullWidth
                value={quantity}
                onChange={(e) => setquantity(Number(e.target.value))}
              />
            </Grid>
          )}

          {selectedRole === "Others" && (
            <>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <InputLabel id="other-label">Internal</InputLabel>
                  <Select
                    labelId="other-label"
                    label="Others"
                    value={OthersConsumption}
                    onChange={(e) => setOthersConsumption(e.target.value as string)}
                    required
                  >
                     {InternalConsumptions?.map((Consumptions) => (
                      <MenuItem value={Consumptions.name} key={Consumptions.name}>
                        {Consumptions.name}
                      </MenuItem>
                    ))}
                    <Divider />
                    <MenuItem
                      onClick={() => setOtherConsumptionModal(true)}
                      sx={{ fontWeight: "bold", color: "primary.main" }}
                    >
                      ➕ Add Internal Consumptions
                    </MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={4}>
                <TextField
                  type="number"
                  label="Quantity"
                  inputProps={{ min: 0 }}
                  fullWidth
                  value={quantity}
                  onChange={(e) => setquantity(Number(e.target.value))}
                  required
                />
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>

      <CardActions sx={{ p: 3 }}>
        <Tooltip title={canDispatch ? '' : 'No permission'}>
          <span>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={!canDispatch}
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none',
            mr: 2,
            width: 120,
              height: 45
          }}
        >
          {loading ? (
    <CircularProgress size={24} sx={{ color: "#0F7C8F" }} />
  ) : (
    "Save"
  )}
        </Button>
          </span>
        </Tooltip>
        <Button
          variant="outlined"
          onClick={handleCancel}
          sx={{
            textTransform: 'none',
            borderColor: '#ccc',
            color: '#333',
            width: 120
          }}
        >
          Cancel
        </Button>
      </CardActions>
      
      {!IsPreviousTransactionClick && (
      <CardActions sx={{ p: 3 }}>
       <Button
          variant="contained"
          onClick={handlePreviousTransachtion}
          sx={{
            backgroundColor: '#455a64',
            ':hover': { backgroundColor: '#37474f' },
            textTransform: 'none',
            mr: 2,
            mb: 0,
            width: 180,
          }}
        >
          See Previous Transactions
        </Button>
      </CardActions>
      )}

    {IsPreviousTransactionClick && (
      <Box
        sx={{
            mt: 2,
            width: '95%',
            margin: '0 auto', 
            backgroundColor: '#f9f9f9',
            borderRadius: '12px',
            p: 3,
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Previous Transactions
          </Typography>

          <TableContainer component={Paper} sx={{ borderRadius: '12px', overflowX: 'auto' }}>
            <Table sx={{ minWidth: 700 }}>
              <TableHead>
                <TableRow>
                  <TableCell>SR#</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Volume</TableCell>
                  <TableCell>Created By</TableCell>
                  <TableCell>Consumption Type</TableCell>
                  <TableCell>Consumption Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {currentRows.length > 0 ? (
                  currentRows.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell>{row.date}</TableCell>
                      <TableCell>{row.volume}</TableCell>
                      <TableCell>{row.approved.firstname + " " + row.approved.lastname}</TableCell>
                      <TableCell>{row.outType}</TableCell>
                      <TableCell>
                        {row.companies?.name ? row.companies.name : row.category?.name}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 2, color: '#7d7d7d' }}>
                      No data available for selected date.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination Controls */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mt: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2">Rows per page:</Typography>
              <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                <MenuItem value={5}>5</MenuItem>
                <MenuItem value={10}>10</MenuItem>
                <MenuItem value={15}>15</MenuItem>
              </Select>
            </Box>

            <Pagination
              count={TotalPages}
              page={currentPage}
              onChange={handlePageChange}
              variant="outlined"
              shape="rounded"
              color="primary"
            />
          </Box>
        </Box>
      )}
      {IsPreviousTransactionClick && (
        <CardActions sx={{ p: 3 , mt: 2}}>
            <Button
              variant="contained"
              onClick={() => setIsPreviousTransactionClick(!IsPreviousTransactionClick)}
              sx={{
                backgroundColor: '#455a64',
                ':hover': { backgroundColor: '#37474f' },
                textTransform: 'none',
                mr: 2,
                width: 180,
              }}
            >
              Hide Transactions
            </Button>
        </CardActions>
      )}
      </CardContent>
    </Card>

    <AddCompanyModal
      openCompany={isModalOpen}
      onCloseUpdate={handleCloseModal}
      LoadCompaniesandOthers={Companies}
    />
    <AddOtherConsumptionsModal
      openOthersConsumption={OtherConsumptionModal}
      onCloseUpdate={handleOthersCloseModal}
      LoadCompaniesandOthers={Companies}
    />

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
}
export default DayWiseMilking;

interface AddCompanyModalProps {
  openCompany: boolean;
  onCloseUpdate: () => void;
  LoadCompaniesandOthers: () => void;
}

const AddCompanyModal: React.FC<AddCompanyModalProps> = ({
  openCompany,
  onCloseUpdate,
  LoadCompaniesandOthers,
})=>{
  const [companyName, setcompanyName] = useState("");

  const handleCancel = () => {
    setcompanyName("");
    LoadCompaniesandOthers();
    onCloseUpdate();
  };

  const handleAddCompany = async function(){
    if(!companyName){toast.warning("Enter Company Name!"); return;}

    const CompanyPayload = {
        name: companyName,
        country: "Pakistan",
        arrival_date: new Date(),
    }
   
    addNewCompany(CompanyPayload)
      .then((response)=>{
        toast.success("New Company has been added!");
      })
      .catch((error)=>{
        toast.error(error.response.data.message);
      })
    handleCancel();
  };

  return(
    <Dialog open={openCompany} onClose={(_, __) => handleCancel()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Add Company</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 , mt: 2}}>
          <FormControl fullWidth>
            <TextField
               label="Comapny Name"
               type="text"
               value={companyName}
               onChange={(e) => setcompanyName(e.target.value as string)}
               fullWidth
            />
          </FormControl>
          <TextField
            label="Country"
            type="text"
            value="Pakistan"
            InputProps={{readOnly: true}}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{ textTransform: 'none', mr: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddCompany}
          variant="contained"
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none',
          }}
        >
          Add
        </Button>
      </DialogActions>
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
    </Dialog>
  );
}

interface AddOtherConsumptionModalProps {
  openOthersConsumption: boolean;
  onCloseUpdate: () => void;
  LoadCompaniesandOthers: () => void;
}

const AddOtherConsumptionsModal: React.FC<AddOtherConsumptionModalProps>=({
  openOthersConsumption,
  onCloseUpdate,
  LoadCompaniesandOthers
})=>{

  const [OthersName, setOthersName] = useState("");

  const handleCancel = () => {
    setOthersName("");
    LoadCompaniesandOthers();
    onCloseUpdate();
  };

  const handleAddOthersConsumption = async function(){
    try {
      if(!OthersName){toast.warning("Consumption name must be valid!")}
      const OthersPayload = {
        name: OthersName,
      } 
      createInternalConsumptions(OthersPayload)
        .then((response)=>{
          toast.success("Internal Consumptions has been added successfully!");
        })
        .catch((error)=>{
          toast.error("Can't add other consumptions!")
        })
        handleCancel();
    } catch (error: any) {
      console.log(error.response.data.message);
    }
  }
 return(
    <Dialog open={openOthersConsumption} onClose={(_, __) => handleCancel()} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 'bold' }}>Add Consumption</DialogTitle>

      <DialogContent>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 , mt: 2}}>
          <FormControl fullWidth>
            <TextField
               label="Consumption Name"
               type="text"
               value={OthersName}
               onChange={(e) => setOthersName(e.target.value as string)}
               fullWidth
            />
          </FormControl>
        </Box>
      </DialogContent>

      <DialogActions sx={{ pr: 3, pb: 2 }}>
        <Button
          onClick={handleCancel}
          variant="outlined"
          sx={{ textTransform: 'none', mr: 2 }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleAddOthersConsumption}
          variant="contained"
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none',
          }}
        >
          Add
        </Button>
      </DialogActions>
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
    </Dialog>
  );
}