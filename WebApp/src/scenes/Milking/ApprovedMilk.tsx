import React, { useState, ChangeEvent, useEffect,useRef } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TableFooter,
  TablePagination,
  Tooltip,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { tokens } from '../../shared/theme/theme';
import useMediaQuery from '@mui/material/useMediaQuery';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { getlistOfMilking } from '../../shared/services/listOfMilking.services';
import { getRoles } from '../../shared/services/getUsers.services';
import { createMilkingSession } from '../../shared/services/MilkingSession.service';
import { updateMilkSession } from '../../shared/services/MilkingSession.service';
import { ApproveMilkSession } from '../../shared/services/approvedMilk.service';
import { GetPendingApprovalDates } from '../../shared/services/PendingMilkApprovalDates.service';
import { CircularProgress, Backdrop } from '@mui/material';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useLocation } from 'react-router-dom';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { usePermissions } from '../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../shared/rbac/permissions';
import { useTranslation } from 'react-i18next';


interface MilkingSessionTime {
  milkingTime: 'morning' | 'afternoon' | 'evening';
  milk: number;
}

interface AnimalMilkingSession {
  uuid: string;
  name: string;
  penId: string;
  tagId: string;
  tagName: string;
  lactation: number;
  date: string; 
  sessions: MilkingSessionTime[];
}


const ListOfMilkingAnimals: React.FC = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { can } = usePermissions();
  const canApprove = can(PERMISSIONS.MILK_APPROVE);

  const location = useLocation();
  // const { isCollapsed } = location.state || {};

  //Search States
  const [search, setSearch] = useState('');

  const [selectedDate, setSelectedDate] = useState('');
  const [filterData , setfilterData] = useState<AnimalMilkingSession[]>([]);
 
  //Roles
  const [roles , setRoles] = useState([]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [isUpdateModalOpen, setUpdateModalOpen] = useState(false);

  const [selectedCowUUid, setSelectedCowUUid] = useState<string>("");
  const [selectedCowTag, setSelectedCowTag] = useState<string>("");
  const [selectedCowDate, setSelectedCowDate] = useState<string>("");

  //Add and Update Modal selected Milking Time
  const [UpdateselectedMilkingTime, setUpdateselectedMilkingTime] = useState<string>("");
  const [AddselectedMilkingTime, setAddselectedMilkingTime] = useState<string>("");

  //Pending approval Dates
  const [PendingApprovalDates , setPendingApprovalDates] = useState<string[]>([]);

  //Loading State
  const [loading, setLoading] = useState(false);
  const [buttonLoading, setButtonLoading] = useState(false);
  const toastId = useRef<Id | null>(null);

  //Pagination States
  const [page, setPage] = useState(0);
  const rowsPerPage = 10;

  const handleChangePage = (
   event: React.MouseEvent<HTMLButtonElement> | null,
   newPage: number
   ) => {
   setPage(newPage);
  };

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
  };
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
    getListData(e.target.value);
  };

  const getListData = async function(date: string){
    try {
      setLoading(true);
      const response = await getlistOfMilking(date);
      const res = await getRoles();

      if(res?.data?.data?.Users){setRoles(res.data.data.Users)}
      if(response?.data?.data?.milkingSessions){
        const data: AnimalMilkingSession[] = response.data.data.milkingSessions;
        setfilterData(data);
      }
      setLoading(false);
    } catch (error) {
      console.log("Error Fetching Data " + error);
    }
  }

  // Open modal when clicking "Add New"
  const handleAddNewClick = (cowId: string , cowTag: string , date:string , milkingTime: string) => {
    setSelectedCowUUid(cowId);
    setSelectedCowTag(cowTag);
    setSelectedCowDate(date);
    setAddselectedMilkingTime(milkingTime)
    setModalOpen(true);
  };

   // Open Update modal when clicking on Milk
   const handleUpdateModalClick = (cowId: string , cowTag: string , date:string , milk:number , Time: string) => {
    setSelectedCowUUid(cowId);
    setSelectedCowTag(cowTag);
    setSelectedCowDate(date);
    setUpdateselectedMilkingTime(Time);
    setUpdateModalOpen(true);
  };

  // Close modal
  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedCowUUid("");
    setSelectedCowTag("");
    setSelectedCowDate("");
  };

   // Close Update modal
   const handleCloseUpdateModal = () => {
    setUpdateModalOpen(false);
    setSelectedCowUUid("");
    setSelectedCowTag("");
    setSelectedCowDate("");
  };

  const filteredData = filterData
  .filter((item) => {
    const matchesDate = item.date === selectedDate;
    const matchesSearch = search
      ? item.tagName?.toLowerCase().includes(search.toLowerCase())
      : true;
    return matchesDate && matchesSearch && item.tagName !== null;
  })
  .map((session) => {
    const sessionMap = Object.fromEntries(
      session.sessions.map((s) => [s.milkingTime, s.milk])
    );

    return {
      uuid: session.uuid,
      tagName: session.tagName || t('milking.common.unknown'),
      date: session.date,
      milk1: sessionMap["morning"] || 0,
      milk2: sessionMap["afternoon"] || 0,
      milk3: sessionMap["evening"] || 0,
    };
  });

  // Renders "Add New" if milkVal is 0
  const milkCell = (milkVal?: number, cowId?: string , cowTag?: string , date?: string , milkingTime?: string) =>
    !milkVal ? (
      <Typography
        sx={{ color: '#6bad44', fontWeight: 500, cursor: 'pointer' }}
        onClick={() => cowId && cowTag && handleAddNewClick(cowId! , cowTag! , date! , milkingTime!)}
      >
        {t('milking.common.addNew')}
      </Typography>
    ) : (
      String(milkVal).padStart(2, '0')
    );

  const handleMilkClick = (milkValue: number, uuid: string, tagName: string, date: string , Time:string) => {
    if(!milkValue){return;}
    handleUpdateModalClick(uuid , tagName , date , milkValue , Time);
  };

  const handlePendingApproval = (value: string) => {
    setSelectedDate(value);
    getListData(value);
  }


const ApprovedMilk = async function () {
  toast.dismiss();

  if (!selectedDate) {
    toast.warn(t('milking.approvedMilk.selectDateFirst'));
    return;
  }

  try {
    setButtonLoading(true);

    const cleanData = filterData
      .filter(item =>
        item.uuid &&
        item.name &&
        item.penId &&
        item.tagId &&
        item.date &&
        item.lactation
      )
      .map(({ tagName, ...rest }) => rest);

    const response = await ApproveMilkSession({ sessionsData: cleanData });

    toast.success(t('milking.approvedMilk.approvedSuccess'));
    setSelectedDate("");
  } catch (error: any) {
    // Surface the API reason — e.g. animals blocked by treatment withdrawal
    toast.error(error?.response?.data?.message || t('milking.approvedMilk.approveError'), { autoClose: 8000 });
  } finally {
    setButtonLoading(false);
  }
};


  useEffect(()=>{
    const getPendingDates = async function (){
      try {
        const response = await GetPendingApprovalDates();
        setPendingApprovalDates(response.data.data.pendingMilkApprovalDates);
      } catch (error: any) {
        console.log(error.response.data.message);
      }
    }
    getPendingDates();
  }, [])
  
    

  return (

    <PageContainer title={t('milking.approvedMilk.title')} maxWidth="1200px">
  <Box sx={{
    display: 'flex',
    flexDirection: { xs: 'column', sm: 'row' },
    justifyContent: 'flex-end',
    alignItems: { xs: 'flex-start', sm: 'center' },
    mb: 2,
    gap: 2
  }}>
    <Tooltip title={canApprove ? '' : t('milking.common.noPermission')}>
      <span>
    <Button
      variant="contained"
       disabled={buttonLoading || !canApprove}
      sx={{
        backgroundColor: '#295d5d',
        ':hover': { backgroundColor: '#1f4848' },
        textTransform: 'none',
        fontWeight: 500,
        width: { xs: '100%', sm: 'auto' },
      }}
      onClick={() => ApprovedMilk()}
    >
      {buttonLoading ? (
    <CircularProgress size={20} sx={{ color: '#0F7C8F' }} />
  ) : (
    t('milking.approvedMilk.approveMilk')
  )}

    </Button>
      </span>
    </Tooltip>
  </Box>

  {/* Search & date filter row */}

  <Box>
    <Box   sx={{
  
    //  p: { xs: 2, sm: 3, md: 3 },
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
  }}>
 
  <Box
    component={Paper}
    elevation={0}
    sx={{
      display: 'flex',
      flexDirection: { xs: 'column', sm: 'row' },
      alignItems: { xs: 'stretch', sm: 'center' },
      justifyContent: 'space-between',
      p:{xs:1,md:3} ,
      borderRadius: 2,
       mb: 1,
      gap: 2,
    }}
  >
    <TextField
      placeholder={t('common.search')}
      size="small"
      value={search}
      onChange={handleSearchChange}
      sx={{
        width: { xs: '100%', sm: 200 },
        backgroundColor: '#fff',
        borderRadius: 1,
        '& .MuiInputBase-root': {
          height: '48px',
        }
      }}
    />
  
    <Box sx={{ 
      display: 'flex', 
      gap: 2, 
      width: { xs: '100%', sm: 'auto' },
      flexDirection: { xs: 'column', sm: 'row' } 
    }}>
      <FormControl fullWidth sx={{ 
    maxWidth: { xs: '100%', sm: 100 },
     minWidth: 200 ,
   
  }}>
        <InputLabel id="pending-approvals-label" shrink>
          {t('milking.approvedMilk.pending')}
        </InputLabel>
        <Select
          labelId="pending-approvals-label"
          label={t('milking.approvedMilk.pendingApprovals')}
          onChange={(e) => handlePendingApproval(e.target.value as string)}
          displayEmpty
          fullWidth
          size="small"
          sx={{
        height: '48px',
        '& .MuiSelect-select': {
          display: 'flex',
          alignItems: 'center',
          height: '48px',
          paddingTop: '0px',
          paddingBottom: '0px',
        },
        '& .MuiInputBase-root': {
          height: '48px',
        }
      }}
        >
          {PendingApprovalDates.map((date) => (
            <MenuItem key={date} value={date}>
              {date}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <TextField
        type="date"
        label={t('milking.common.date')}
        size="small"
        value={selectedDate}
        onChange={handleDateChange}
        InputLabelProps={{ shrink: true }}
        inputProps={{
          max: new Date().toISOString().split('T')[0]
        }}
        sx={{
      maxWidth: { xs: '100%', sm: 100 },
      minWidth: 200,
      '& .MuiInputBase-root': {
        height: '48px',
      }
    }}
        fullWidth
      />
    </Box>
  </Box>

 
  <Box sx={{ overflowX: 'auto' }}>
      <TableContainer
        component={Paper}
        sx={{
   
             width: '100%',
          minWidth: 600
        }}
      >
        <Table  sx={{ width: '100%' }}>
          <TableHead sx={{ backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA' }}>
            <TableRow>
              <TableCell sx={{ fontWeight: 600 }}>{t('milking.approvedMilk.columns.cowId')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('milking.approvedMilk.columns.milk1')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('milking.approvedMilk.columns.milk2')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('milking.approvedMilk.columns.milk3')}</TableCell>
              <TableCell sx={{ fontWeight: 600 }}>{t('milking.approvedMilk.columns.totalMilk')}</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
  {loading ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        <CircularProgress size={isMobile ? 30 : 50} sx={{ color: '#0f7c8f' }} />
      </TableCell>
    </TableRow>
  ) : filteredData.length === 0 ? (
    <TableRow>
      <TableCell colSpan={5} align="center">
        {t('milking.common.noDataFound')}
      </TableCell>
    </TableRow>
  ) : (
    filteredData
      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
      .map((row) => {
        const total = (row.milk1 || 0) + (row.milk2 || 0) + (row.milk3 || 0);
        return (
          <TableRow key={`${row.tagName}-${row.date}`}>
            <TableCell>{row.tagName}</TableCell>
            <TableCell>
              <span
                style={{ cursor: 'pointer', color: 'black' }}
                onClick={() =>
                  handleMilkClick(row.milk1, row.uuid, row.tagName, row.date, 'morning')
                }
              >
                {milkCell(row.milk1, row.uuid, row.tagName, row.date, 'morning')}
              </span>
            </TableCell>
            <TableCell>
              <span
                style={{ cursor: 'pointer', color: 'black' }}
                onClick={() =>
                  handleMilkClick(row.milk2, row.uuid, row.tagName, row.date, 'afternoon')
                }
              >
                {milkCell(row.milk2, row.uuid, row.tagName, row.date, 'afternoon')}
              </span>
            </TableCell>
            <TableCell>
              <span
                style={{ cursor: 'pointer', color: 'black' }}
                onClick={() =>
                  handleMilkClick(row.milk3, row.uuid, row.tagName, row.date, 'evening')
                }
              >
                {milkCell(row.milk3, row.uuid, row.tagName, row.date, 'evening')}
              </span>
            </TableCell>
            <TableCell>{total}</TableCell>
          </TableRow>
        );
      })
  )}
</TableBody>


          {filteredData.length > 0 && (
            <TableFooter>
              <TableRow>
                <TablePagination
                  rowsPerPageOptions={[10]}
                  count={filteredData.length}
                  rowsPerPage={rowsPerPage}
                  page={page}
                  onPageChange={handleChangePage}
                />
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </TableContainer>
    </Box>
</Box>
</Box>
  {/* Modals */}
  <AddMilkingModal
    open={isModalOpen}
    cowUUid={selectedCowUUid}
    cowTag={selectedCowTag}
    date={selectedCowDate}
    roles={roles}
    milkingTime={AddselectedMilkingTime}
    onClose={handleCloseModal}
    getListData={getListData}
  />

  <UpdateMilkingModal
    openUpdate={isUpdateModalOpen}
    cowUUid={selectedCowUUid}
    date={selectedCowDate}
    milkingTime={UpdateselectedMilkingTime}
    onCloseUpdate={handleCloseUpdateModal}
    getListData={getListData}
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
};

export default ListOfMilkingAnimals;



interface UpdateMilkingModalProps {
  openUpdate: boolean;
  cowUUid: string;
  date : string;
  milkingTime: string,
  onCloseUpdate: () => void;
  getListData: (date: string) => void;
}

const UpdateMilkingModal: React.FC<UpdateMilkingModalProps> = ({
  openUpdate,
  cowUUid: cowUUid,
  date : date,
  milkingTime: milkingTime,
  onCloseUpdate,
  getListData,
})=>{
  const { t } = useTranslation();
  const [Quantity, setQuantity] = useState('0');

  const handleCancel = () => {
    // setMilkingTime('');
    setQuantity('0');
    onCloseUpdate();
  };

  const handleUpdate = async function(){
    const milkingSessionPayload = {
      animalId: cowUUid,
      date: date,
      milk: parseInt(Quantity) || 0,
      milkingTime: milkingTime,
    }
   
    updateMilkSession(milkingSessionPayload)
      .then((response)=>{
        toast.success(t('milking.approvedMilk.milkUpdated'))
        getListData(date);
      })
      .catch((error)=>{
        toast.error(t('milking.approvedMilk.milkUpdateError'));
      })
    handleCancel();
  };
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return(
     <Dialog 
      open={openUpdate} 
      onClose={(_, __) => handleCancel()} 
      maxWidth="md" 
      fullWidth
      fullScreen={fullScreen}
    >
      <DialogTitle sx={{ fontWeight: 'bold' }}>{t('milking.approvedMilk.updateMilk')}</DialogTitle>
      <DialogContent>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: { xs: 'column', sm: 'row' }, 
          gap: 2, 
          mb: 2, 
          mt: 2 
        }}>
         <FormControl fullWidth>
            <TextField
               label={t('milking.common.milkingTime')}
               type="text"
               value={t('milking.common.milkingTimes.' + milkingTime, milkingTime)}
               fullWidth
               InputProps={{ readOnly: true }}
            />

          </FormControl>
          <TextField
            label={t('milking.common.amountInLiters')}
            type="number"
            value={Quantity}
            onChange={(e) => setQuantity(e.target.value)}
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
          {t('common.cancel')}
        </Button>
        <Button
          onClick={handleUpdate}
          variant="contained"
          sx={{
            backgroundColor: '#295d5d',
            ':hover': { backgroundColor: '#1f4848' },
            textTransform: 'none',
          }}
        >
          {t('milking.approvedMilk.update')}
        </Button>
      </DialogActions>
       {/* <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      /> */}
    </Dialog>
  );
}

interface Role{
  uuid: string
  name: string;
}

interface User {
  firstname: string;
  lastname: string;
  role: Role
}


interface AddMilkingModalProps {
  open: boolean;
  cowUUid: string;
  cowTag : string;
  date : string;
  roles: User[] | null;
  milkingTime: string
  onClose: () => void;
  getListData: (date: string) => void;
}

const AddMilkingModal: React.FC<AddMilkingModalProps> = ({
  open,
  cowUUid: cowUUid,
  cowTag: cowTag,
  date: date,
  roles,
  milkingTime: Time,
  onClose,
  getListData,
}) => {
  const { t } = useTranslation();
  const [liters, setLiters] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [tech, setTech] = useState('');
  const [Tag, setSelectedCowTag] = useState<string | 'Select'>(
    cowTag || 'Select'
  );
  const [addLoading, setAddLoading] = useState(false);


const handleSave = async function () {
  // Dismiss existing toasts first
  toast.dismiss();

  // Validate required fields
  if (!liters || !remarks || !tech || !Time || !cowUUid || !date) {
    toast.warn(t('milking.common.fillRequiredFields'));
    return;
  }

  setAddLoading(true);

  const milkingSessionPayload = {
    animalId: cowUUid,
    date: date,
    milk: parseInt(liters) || 0,
    milkingTime: Time,
    remarks: remarks,
  };

  try {
    await createMilkingSession(milkingSessionPayload);
    toast.success(t('milking.approvedMilk.milkAdded'));
    getListData(date);
    handleCancel();
  } catch (error) {
    toast.error(t('milking.approvedMilk.milkAddError'));
  } finally {
    setAddLoading(false);
  }
};

  const handleCancel = () => {
    setLiters('0');
    setRemarks('');
    setTech('');
    setSelectedCowTag(cowTag || '');
    onClose();
  };
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
  return (

  <Dialog 
  open={open} 
  onClose={(_, __) => handleCancel()} 
  maxWidth="md" 
  fullWidth
  fullScreen={fullScreen}
>
  <DialogTitle sx={{ fontWeight: 'bold' }}>{t('milking.common.addNew')}</DialogTitle>
  <DialogContent>
    <Box sx={{ 
      display: 'flex', 
      flexDirection: { xs: 'column', sm: 'row' }, 
      gap: 2, 
      mb: 2, 
      mt: 2 
    }}>
      <FormControl fullWidth>
        <TextField
          label={t('milking.common.milkingTime')}
          type="text"
          value={t('milking.common.milkingTimes.' + Time, Time)}
          fullWidth
          InputProps={{ readOnly: true }}
        />
      </FormControl>
      <TextField
        label={t('milking.common.amountInLiters')}
        type="number"
        value={liters}
        onChange={(e) => setLiters(e.target.value)}
        fullWidth
      />
    </Box>

    <Box sx={{ mb: 2 }}>
      <TextField
        label={t('milking.common.remarks')}
        multiline
        rows={4}
        value={remarks}
        onChange={(e) => setRemarks(e.target.value)}
        fullWidth
      />
    </Box>

    <Box sx={{ width: { xs: '100%', sm: '32%' } }}>
      <FormControl fullWidth>
        <InputLabel id="report-to-label">{t('milking.common.reportTo')}</InputLabel>
        <Select
          labelId="report-to-label"
          label={t('milking.common.selectTech')}
          value={tech}
          onChange={(e) => setTech(e.target.value as string)}
        >
          {roles
            ?.filter(user => user.role.name.toLowerCase() === 'doctor')
            .map(user => (
              <MenuItem 
                value={`${user.firstname} ${user.lastname}`} 
                key={user.role.name}
              >
                {`${user.firstname} ${user.lastname}`}
              </MenuItem>
            ))}
        </Select>
      </FormControl>
    </Box>
  </DialogContent>

  <DialogActions sx={{ pr: 3, pb: 2 }}>
    <Button
      onClick={handleCancel}
      variant="outlined"
      sx={{ textTransform: 'none', mr: 2 }}
    >
      {t('common.cancel')}
    </Button>
    <Button
      onClick={handleSave}
      variant="contained"
       disabled={addLoading}
      sx={{
        backgroundColor: '#295d5d',
        ':hover': { backgroundColor: '#1f4848' },
        textTransform: 'none',
          display: 'flex',
    alignItems: 'center',
    gap: 1,
    minWidth: '80px',
      }}
    >
       {addLoading ? (
    <CircularProgress size={20} sx={{ color: '#0F7C8F' }} />
  ) : (
    t('common.add')
  )}
    </Button>
  </DialogActions>
</Dialog>
  );
};