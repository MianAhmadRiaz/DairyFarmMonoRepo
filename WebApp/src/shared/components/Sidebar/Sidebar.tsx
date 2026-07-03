import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ProSidebar, Menu, MenuItem } from 'react-pro-sidebar';
import {
  Box,
  IconButton,
  Typography,
  useTheme,
  useMediaQuery,
  Drawer
} from '@mui/material';
import { Link } from 'react-router-dom';
import 'react-pro-sidebar/dist/css/styles.css';

import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import MapOutlinedIcon from '@mui/icons-material/MapOutlined';
import PetsOutlinedIcon from '@mui/icons-material/PetsOutlined';
import ArrowOutwardIcon from '@mui/icons-material/ArrowOutward';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import InventoryIcon from '@mui/icons-material/Inventory';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GrassIcon from '@mui/icons-material/Grass';
import { tokens } from '../../theme/theme';
import SideBarItem from './SideBarItem';
import { setAuthToken } from '../../store/userSlice';
import { RootState } from '../../store';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DownloadOutlinedIcon from '@mui/icons-material/DownloadOutlined';
import { setSidebarCollapsed } from '../../store/sidebarSlice';
// import useIsMobile from '../Hooks/useIsMobile';
import useLayoutShift from '../Hooks/useLayoutShift';
import { usePermissions } from '../../rbac/usePermissions';
import { PERMISSIONS, MODULE_VIEW_PERMISSION } from '../../rbac/permissions';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import { SIDEBAR_WIDTH_COLLAPSED, SIDEBAR_WIDTH_EXPANDED } from '../Layout/layoutConstants';
const Sidebar = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const user = useSelector((state: RootState) => state.user.user);
  const selectedModule = useSelector(
    (state: RootState) => state.user.selectedModule
  );
  // const isMobile = useMediaQuery('(max-width: 768px)');
  //  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  // const isMobile = useIsMobile();
  const [selected, setSelected] = useState('Dashboard');
  const [milkingOpen, setMilkingOpen] = useState(true);
  const [stockOpen, setStockOpen] = useState(false);
  const [feedingOpen, setFeedingOpen] = useState(false);
  const [stockInventoryOpen, setStockInventoryOpen] = useState(false);
  const [stockIssuanceOpen, setStockIssuanceOpen] = useState(false);
  const [employeeOpen, setEmployeeOpen] = useState(false);
  const [generateSalary, setgenerateSalary] = useState(false);
  const [paidSalaray, setpaidSalaray] = useState(false);
  const [advances, setadvances] = useState(false);
  const [reportsOpen, setReportsOpen] = useState(false);
  const [medicineConsumptionOpen, setMedicineConsumptionOpen] = useState(false);
  const [semenConsumptionOpen, setSemenConsumptionOpen] = useState(false);
  const [otherStockConsumptionOpen, setOtherStockConsumptionOpen] =
    useState(false);
  const [Attendance, setAttendance] = useState(false);

  const dispatch = useDispatch();
  const { can } = usePermissions();
  const { isMobile, isCollapsed } = useLayoutShift();

  useEffect(() => {
    dispatch(setSidebarCollapsed(isMobile));
  }, [isMobile, dispatch]);

  const onLogout = () => {
    dispatch(setAuthToken(''));
  };

  const sidebarContent = () => (
    <Box
      sx={{
        '& .pro-sidebar-inner': {
          background: `${colors.primary[400]} !important`,
          height: '100vh',

          overflowY: 'auto',
          '&::-webkit-scrollbar': {
            width: '6px'
          },
          '&::-webkit-scrollbar-track': {
            background: colors.primary[400]
          },
          '&::-webkit-scrollbar-thumb': {
            background: colors.grey[700],
            borderRadius: '3px'
          },
          '&::-webkit-scrollbar-thumb:hover': {
            background: colors.grey[600]
          }
        },
        '& .pro-icon-wrapper': {
          backgroundColor: 'transparent !important'
        },
        '& .pro-inner-item': {
          padding: '5px 35px 5px 15px !important'
        },
        '& .pro-inner-item:hover': {
          color: '#868dfb !important'
        },
        '& .pro-menu-item.active': {
          color: '#6870fa !important'
        }
      }}
    >
      <ProSidebar
        collapsed={isCollapsed}
        style={{
          height: '100vh',
          width: isCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
          display: isMobile && isCollapsed ? 'none' : 'block',
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          transition: 'width 0.3s ease'
        }}
      >
        <Menu iconShape="square">
          <MenuItem
            // onClick={() => setIsCollapsed(!isCollapsed)}
            onClick={() => dispatch(setSidebarCollapsed(!isCollapsed))}
            icon={isCollapsed ? <MenuOutlinedIcon /> : undefined}
            style={{
              margin: '0px 0 20px 0',
              color: colors.grey[100]
            }}
          >
            {!isCollapsed && (
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                ml="15px"
              >
                <Typography variant="h5" color={colors.grey[100]}>
                  Cattle Care
                </Typography>
                {/* <IconButton onClick={() => setIsCollapsed(!isCollapsed)}> */}
                <IconButton
                  onClick={() => dispatch(setSidebarCollapsed(!isCollapsed))}
                >
                  <MenuOutlinedIcon />
                </IconButton>
              </Box>
            )}
          </MenuItem>

          {(!isMobile || !isCollapsed) && (
            <>
              {!isCollapsed && (
                <Box mb="25px">
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                  >
                    <img
                      width="150px"
                      height="150px"
                      src={`/public/assets/user.png`}
                      style={{
                        cursor: 'pointer',
                        borderRadius: '50%'
                      }}
                    />
                  </Box>
                  <Box textAlign="center">
                    <Typography
                      variant="h6"
                      color={colors.grey[100]}
                      fontWeight="bold"
                      sx={{ m: '10px 0 0 0' }}
                    >
                      {user
                        ? `${user.firstname || ''} ${
                            user.lastname || ''
                          }`.trim() || 'User'
                        : 'User'}
                    </Typography>
                    <Typography variant="h6" color={colors.greenAccent[500]}>
                      Admin
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box paddingLeft={isCollapsed ? undefined : '10%'}>
                {selectedModule == 'feeding' &&
                  can(MODULE_VIEW_PERMISSION.feeding) && (
                  <>
                    <SideBarItem
                      title="Create Recipe"
                      to="/create-recipe"
                      icon={<GrassIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="View Recipe"
                      to="/view-recipe"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title="Shed Feed Report"
                      to="/shed-feed-report"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Date wise shed feed report"
                      to="/date-wise-shed-feed-report"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Shed feed stock print"
                      to="/shed-feed-stock-print"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Create Feed Formulation"
                      to="/create-feed-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="View Feed Formulation"
                      to="/view-feed-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Conducted Vanda Feed Formulation"
                      to="/conducted-vanda-feed-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="View conducted Vanda Formulation"
                      to="/view-conducted-vanda-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Apply Feed Recipe Shed"
                      to="/apply-feed-recipe-shed"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title="Apply Feed Recipe Adjustable Shed"
                      to="/apply-feed-recipeA-adjustable-shed"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </>
                )}
                {selectedModule == 'employee' &&
                  can(MODULE_VIEW_PERMISSION.employee) && (
                  <>
                    <SideBarItem
                      title="Dashboard"
                      to="/employee/dashboard"
                      icon={<HomeOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <MenuItem
                      icon={<Inventory2OutlinedIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setEmployeeOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Emoployee</Typography>
                        {employeeOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {employeeOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Employee"
                          to="/employee/new"
                          icon={<PersonAddAltOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Employee"
                          to="/employee/view/employee"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                    <MenuItem
                      icon={<Inventory2OutlinedIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setgenerateSalary(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Salary</Typography>
                        {generateSalary ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {generateSalary && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Generate Salary"
                          to="/employee/generate-salary"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Generate Salary"
                          to="/employee/view/generate-salary"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<Inventory2OutlinedIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setpaidSalaray(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Pay Salary</Typography>
                        {paidSalaray ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {paidSalaray && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Unpaid Salary"
                          to="/employee/unpaid-salary"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Paid Income"
                          to="/employee/view/paid-income"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<Inventory2OutlinedIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setadvances(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Advances</Typography>
                        {advances ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {advances && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Advances"
                          to="/employee/add-advance"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Edit Advances"
                          to="/employee/edit-advance"
                          icon={<EditOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Receive Advances"
                          to="/employee/receive-advance"
                          icon={<DownloadOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Advances"
                          to="/employee/view-advance"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setAttendance(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Attendance</Typography>
                        {Attendance ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>
                    {Attendance && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Mark Attendance"
                          to="/employee/attendance"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Attendance"
                          to="/employee/view-attendance-report"
                          icon={<EditOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() =>
                        setOtherStockConsumptionOpen(prev => !prev)
                      }
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Other Stock Consumption</Typography>
                        {otherStockConsumptionOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setReportsOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Reports</Typography>
                        {reportsOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>
                  </>
                )}
                {selectedModule == 'herd' &&
                  can(MODULE_VIEW_PERMISSION.herd) && (
                  <>
                    <SideBarItem
                      title="Herd Dashboard"
                      to="/herd-dashboard"
                      icon={<HomeOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Add Animal"
                      to="/add-animal"
                      icon={<PetsOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Animal Information"
                      to="/animal-info"
                      icon={<PetsOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Move to Pen"
                      to="/move-to-pen"
                      icon={<SwapHorizOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    {can(PERMISSIONS.ANIMAL_REMOVE) && (
                      <SideBarItem
                        title="Remove Animal"
                        to="/remove-animal"
                        icon={<DeleteOutlineOutlinedIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    <SideBarItem
                      title="View Calves"
                      to="/view-calves"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    {/* <SideBarItem
                      title="CMT Test"
                      to="/cmt-test"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    /> */}
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: '15px 0 5px 20px' }}
                    >
                      Health
                    </Typography>
                    <SideBarItem
                      title="Herd Alerts"
                      to="/herd-alerts"
                      icon={<AddCircleOutlineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Treatments"
                      to="/treatments"
                      icon={<AddCircleOutlineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Weight & Health"
                      to="/weight-health"
                      icon={<AddCircleOutlineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: '15px 0 5px 20px' }}
                    >
                      Events
                    </Typography>
                    <SideBarItem
                      title="Breeding Events"
                      to="/breeding-events"
                      icon={<AddCircleOutlineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                  </>
                )}
                {selectedModule == 'accounts' &&
                  can(MODULE_VIEW_PERMISSION.accounts) && (
                  <>
                    {/* Simple sidebar items */}
                    <SideBarItem
                      title="Accounts Dashboard"
                      to="/accounts/dashboard"
                      icon={<PersonOutlineIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    {/* Dropdown 1: Transactions */}
                    <MenuItem
                      icon={<Inventory2OutlinedIcon />}
                      style={{ color: colors.grey[100] }}
                      onClick={() => setStockOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Corporate Milk Dispatch</Typography>
                        {stockOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>
                    {stockOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Milk Dispatch"
                          to="/accounts/milk-dispatch"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Milk Dispatch Via Excel"
                          to="/accounts/milk-dispatch-via-excel"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Milking Payments"
                          to="/accounts/milking-payments"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Milk Dispatch"
                          to="/accounts/view-milk-dispatch"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Milk Payments"
                          to="/accounts/view-milk-payments"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                    {/* Chart of Accounts as separate menu item */}
                    <MenuItem
                      icon={<Inventory2OutlinedIcon />}
                      style={{ color: colors.grey[100] }}
                      onClick={() => setStockInventoryOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Chart of Accounts</Typography>
                        {stockInventoryOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>
                    {stockInventoryOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Account Head"
                          to="/accounts/add-account-head"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Chart of Accounts"
                          to="/accounts/chart-of-accounts"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Merge/Transfer Accounts"
                          to="/accounts/merge-transfer-accounts"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Opening Voucher Accounts"
                          to="/accounts/opening-voucher-accounts"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Charts of Accounts Levels"
                          to="/accounts/charts-of-accounts-levels"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Cash Customers"
                          to="/accounts/cash-customers"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    {/* Account Operations dropdown menu below Chart of Accounts */}
                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{ color: colors.grey[100] }}
                      onClick={() => setStockIssuanceOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Transactions</Typography>
                        {stockIssuanceOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>
                    {stockIssuanceOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Make Cash Payment Voucher"
                          to="/accounts/cpv-transaction"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Bank Payment Voucher"
                          to="/accounts/bpv-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Cash Receipt Voucher"
                          to="/accounts/crv-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Bank Receipt Voucher"
                          to="/accounts/brv-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Journal Transaction"
                          to="/accounts/make-journal-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Account Statements"
                          to="/accounts/account-statements"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Purchase Transaction"
                          to="/accounts/make-purchase-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Sales Transaction"
                          to="/accounts/make-sales-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Purchase Return"
                          to="/accounts/make-purchase-return"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Make Sales Return"
                          to="/accounts/make-sales-return"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <SideBarItem
                      title="View Transactions"
                      to="/accounts/view-transactions"
                      icon={<EditOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title="Customer Milk Sale"
                      to="/accounts/customer-milk-sale"
                      icon={<EditOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    {/* Dropdown 2: Reports */}
                    <MenuItem
                      icon={<TimelineOutlinedIcon />}
                      style={{ color: colors.grey[100] }}
                      onClick={() => setReportsOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Reports</Typography>
                        {reportsOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>
                    {reportsOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="General Ledger"
                          to="/accounts/reports/general-ledger"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Ledger Report"
                          to="/accounts/reports/ledger-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Total Milk Consumption Report"
                          to="/accounts/reports/total-milk-consumption-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Profit & Loss Report"
                          to="/accounts/reports/profit-loss-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Mini Profit & Loss Report"
                          to="/accounts/reports/mini-profit-loss-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Profit & Loss Comparison Report"
                          to="/accounts/reports/profit-loss-comparison-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Trial Balance Report"
                          to="/accounts/reports/trial-balance-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Balance Sheet"
                          to="/accounts/reports/balance-sheet"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Cash Flow Statement"
                          to="/accounts/reports/cash-flow-statement"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Payables Report"
                          to="/accounts/reports/payables-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Receivables Report"
                          to="/accounts/reports/receivables-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Purchase Register"
                          to="/accounts/reports/purchase-register"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Sales Register"
                          to="/accounts/reports/sales-register"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Main Heads Report"
                          to="/accounts/reports/main-heads-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Day Book Report"
                          to="/accounts/reports/day-book-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Cash Book"
                          to="/accounts/reports/cash-book"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Expense Report"
                          to="/accounts/reports/expense-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Sales Report"
                          to="/accounts/reports/sales-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Bills Print"
                          to="/accounts/reports/bills-print"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Milk Sales Report"
                          to="/accounts/reports/milk-sales-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Corporate Milk Payment"
                          to="/accounts/reports/corporate-milk-payment"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Day-wise Milk Sale Report"
                          to="/accounts/reports/day-wise-milk-sale-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Weekly Milk Sale"
                          to="/accounts/reports/weekly-milk-sale"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                  </>
                )}
                {selectedModule == 'milking' &&
                  can(MODULE_VIEW_PERMISSION.milking) && (
                  <>
                    <MenuItem
                      icon={<WaterDropOutlinedIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setMilkingOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Milk Management</Typography>
                        {milkingOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {milkingOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Milk Dashboard"
                          to="/milk-dashboard"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                          isCollapsed={isCollapsed}
                        />
                        <SideBarItem
                          title="Add Milking Session"
                          to="/add-milking-session"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                          isCollapsed={isCollapsed}
                        />
                        <SideBarItem
                          title="Approve Milk"
                          to="/list-of-milking"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                          isCollapsed={isCollapsed}
                        />
                        <SideBarItem
                          title="Milk Out"
                          to="/milk-out"
                          icon={<ArrowOutwardIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Milk In Out Rep."
                          to="/milk-in-out"
                          icon={<ArrowOutwardIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Daily Milk Rep."
                          to="/daily-milk-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Average milk Rep."
                          to="/average-milk-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Milk Difference Rep."
                          to="/milk-difference-report"
                          icon={<MapOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Cow Milking Graph"
                          to="/cow-milking-report"
                          icon={<MapOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                  </>
                )}
                {selectedModule == 'stock' &&
                  can(MODULE_VIEW_PERMISSION.stock) && (
                  <>
                    <SideBarItem
                      title="Stock Dashboard"
                      to="/stock/dashboard"
                      icon={<HomeOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title="Purchases"
                      to="/stock/purchases"
                      icon={<Inventory2OutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title="Suppliers"
                      to="/stock/suppliers"
                      icon={<PersonOutlineIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setStockOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Stock</Typography>
                        {stockOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {stockOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Stock Registration"
                          to="/stock-registration"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Registration"
                          to="/view-registration"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Open Voucher"
                          to="/open-voucher"
                          icon={<ArrowOutwardIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setFeedingOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Feeding Consumption</Typography>
                        {feedingOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {feedingOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Feeding Consumption"
                          to="/feeding-consumption/add"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Feeding Consumption"
                          to="/feeding-consumption/view"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Day-Wise Consume Report"
                          to="/feeding-consumption/day-wise-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Feed Cost Analysis"
                          to="/feeding-consumption/cost-analysis"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setMedicineConsumptionOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Medicine Consumption</Typography>
                        {medicineConsumptionOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {medicineConsumptionOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Medicine Consumption"
                          to="/medicine-consumption"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Medicine Consumption Report"
                          to="/medicine-consumption-report"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setSemenConsumptionOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Semen Consumption</Typography>
                        {semenConsumptionOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {semenConsumptionOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Semen Consumption"
                          to="/add-semen-consumption"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Semen Consumption Report"
                          to="/semen-consumption-report"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() =>
                        setOtherStockConsumptionOpen(prev => !prev)
                      }
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Other Stock Consumption</Typography>
                        {otherStockConsumptionOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {otherStockConsumptionOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Consumption"
                          to="/add-consumption"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Consumption Report"
                          to="/other-stock-consumption-report"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Consumption Expense wise"
                          to="/consumption-expense-wise"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setStockInventoryOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Stock Inventory </Typography>
                        {stockInventoryOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {stockInventoryOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Feeding Stock"
                          to="/feeding-stock"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Medication Stock"
                          to="/medication-stock"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Semens Stock"
                          to="/semen-stock"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Other Stock"
                          to="/other-stock"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setStockIssuanceOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>General Stock Issuance </Typography>
                        {stockIssuanceOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {stockIssuanceOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Add Stock Issuance"
                          to="/issuance/add-stock-issuance"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="View Stock Issuance"
                          to="/issuance/view-stock-issuance"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <MenuItem
                      icon={<InventoryIcon />}
                      style={{
                        color: colors.grey[100]
                      }}
                      onClick={() => setReportsOpen(prev => !prev)}
                    >
                      <Box
                        display="flex"
                        justifyContent="space-between"
                        alignItems="center"
                        width="100%"
                      >
                        <Typography>Reports </Typography>
                        {reportsOpen ? (
                          <KeyboardArrowUpIcon />
                        ) : (
                          <KeyboardArrowDownIcon />
                        )}
                      </Box>
                    </MenuItem>

                    {reportsOpen && (
                      <Box sx={{ ml: isCollapsed ? 0 : 2 }}>
                        <SideBarItem
                          title="Stock Ledger"
                          to="/reports/stock-ledger"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Stock Ledger Amount"
                          to="/reports/stock-ledger-amount"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        {/* <SideBarItem
                      title="Milk Ledger"
                      to="/reports/milk-ledger"
                      icon={<TimelineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    /> */}
                        <SideBarItem
                          title="Feeding Summary"
                          to="/reports/feeding-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Medicine Summary"
                          to="/reports/medicine-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />{' '}
                        <SideBarItem
                          title="Semen Summary"
                          to="/reports/semen-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />{' '}
                        <SideBarItem
                          title="Other Stock Summary"
                          to="/reports/other-stock-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />{' '}
                        <SideBarItem
                          title="Stock Re-Order"
                          to="/reports/stock-reorder"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Stock Re-Order(Days)"
                          to="/reports/remaining-feeding-stock-days"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title="Animal Wise Stock/Cost"
                          to="/reports/animal-wise-cost"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}
                  </>
                )}

                {(can(PERMISSIONS.ROLE_MANAGE) ||
                  can([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE])) && (
                  <>
                    <Typography
                      variant="h6"
                      color={colors.grey[300]}
                      sx={{ m: '15px 0 5px 20px' }}
                    >
                      Administration
                    </Typography>
                    {can([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE]) && (
                      <SideBarItem
                        title="User Management"
                        to="/employee/user-management"
                        icon={<ManageAccountsOutlinedIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {can(PERMISSIONS.ROLE_MANAGE) && (
                      <SideBarItem
                        title="Role Management"
                        to="/employee/role-management"
                        icon={<AdminPanelSettingsOutlinedIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                  </>
                )}

                <SideBarItem
                  onPress={onLogout}
                  title="Logout"
                  to="/login"
                  icon={<LogoutOutlinedIcon />}
                  selected={selected}
                  setSelected={setSelected}
                />
              </Box>
            </>
          )}
        </Menu>
      </ProSidebar>
    </Box>
  );

  return (
    <>
      {isMobile ? (
        <>
          {/* Mobile "open sidebar" affordance now lives in Topbar's hamburger button. */}
          {!isCollapsed && (
            <Drawer
              variant="temporary"
              open
              onClose={() => dispatch(setSidebarCollapsed(true))}
            >
              {sidebarContent()}
            </Drawer>
          )}
        </>
      ) : (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            height: '100vh',
            width: isCollapsed ? `${SIDEBAR_WIDTH_COLLAPSED}px` : `${SIDEBAR_WIDTH_EXPANDED}px`,
            backgroundColor: `${colors.background.sidebar} !important`,
            zIndex: 1000,
            transition: 'width 0.3s ease'
          }}
        >
          {sidebarContent()}
        </Box>
      )}
    </>
  );
};
export default Sidebar;
