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
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
                  {t('common.appName')}
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
                          }`.trim() || t('common.user')
                        : t('common.user')}
                    </Typography>
                    <Typography variant="h6" color={colors.greenAccent[500]}>
                      {t('topbar.admin')}
                    </Typography>
                  </Box>
                </Box>
              )}

              <Box paddingLeft={isCollapsed ? undefined : '10%'}>
                {selectedModule == 'feeding' &&
                  can(MODULE_VIEW_PERMISSION.feeding) && (
                  <>
                    <SideBarItem
                      title={t('nav.createRecipe')}
                      to="/create-recipe"
                      icon={<GrassIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.viewRecipe')}
                      to="/view-recipe"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title={t('nav.shedFeedReport')}
                      to="/shed-feed-report"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.dateWiseShedFeedReport')}
                      to="/date-wise-shed-feed-report"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.shedFeedStockPrint')}
                      to="/shed-feed-stock-print"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.createFeedFormulation')}
                      to="/create-feed-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.viewFeedFormulation')}
                      to="/view-feed-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.conductedVandaFeedFormulation')}
                      to="/conducted-vanda-feed-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.viewConductedVandaFormulation')}
                      to="/view-conducted-vanda-formulation"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.applyFeedRecipeShed')}
                      to="/apply-feed-recipe-shed"
                      icon={<VisibilityOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title={t('nav.applyFeedRecipeAdjustableShed')}
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
                      title={t('nav.dashboard')}
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
                        <Typography>{t('nav.employee')}</Typography>
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
                          title={t('nav.addEmployee')}
                          to="/employee/new"
                          icon={<PersonAddAltOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewEmployee')}
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
                        <Typography>{t('nav.salary')}</Typography>
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
                          title={t('nav.generateSalary')}
                          to="/employee/generate-salary"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewGenerateSalary')}
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
                        <Typography>{t('nav.paySalary')}</Typography>
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
                          title={t('nav.unpaidSalary')}
                          to="/employee/unpaid-salary"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewPaidIncome')}
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
                        <Typography>{t('nav.advances')}</Typography>
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
                          title={t('nav.addAdvances')}
                          to="/employee/add-advance"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.editAdvances')}
                          to="/employee/edit-advance"
                          icon={<EditOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.receiveAdvances')}
                          to="/employee/receive-advance"
                          icon={<DownloadOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewAdvances')}
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
                        <Typography>{t('nav.attendance')}</Typography>
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
                          title={t('nav.markAttendance')}
                          to="/employee/attendance"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewAttendance')}
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
                        <Typography>{t('nav.otherStockConsumption')}</Typography>
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
                        <Typography>{t('nav.reports')}</Typography>
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
                      title={t('nav.herdDashboard')}
                      to="/herd-dashboard"
                      icon={<HomeOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.addAnimal')}
                      to="/add-animal"
                      icon={<PetsOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.animalInformation')}
                      to="/animal-info"
                      icon={<PetsOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.moveToPen')}
                      to="/move-to-pen"
                      icon={<SwapHorizOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    {can(PERMISSIONS.ANIMAL_REMOVE) && (
                      <SideBarItem
                        title={t('nav.removeAnimal')}
                        to="/remove-animal"
                        icon={<DeleteOutlineOutlinedIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    <SideBarItem
                      title={t('nav.viewCalves')}
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
                      {t('nav.health')}
                    </Typography>
                    <SideBarItem
                      title={t('nav.herdAlerts')}
                      to="/herd-alerts"
                      icon={<AddCircleOutlineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.treatments')}
                      to="/treatments"
                      icon={<AddCircleOutlineOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.weightHealth')}
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
                      {t('nav.events')}
                    </Typography>
                    <SideBarItem
                      title={t('nav.breedingEvents')}
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
                      title={t('nav.accountsDashboard')}
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
                        <Typography>{t('nav.corporateMilkDispatch')}</Typography>
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
                          title={t('nav.milkDispatch')}
                          to="/accounts/milk-dispatch"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.milkDispatchViaExcel')}
                          to="/accounts/milk-dispatch-via-excel"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.milkingPayments')}
                          to="/accounts/milking-payments"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewMilkDispatch')}
                          to="/accounts/view-milk-dispatch"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewMilkPayments')}
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
                        <Typography>{t('nav.chartOfAccounts')}</Typography>
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
                          title={t('nav.addAccountHead')}
                          to="/accounts/add-account-head"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.chartOfAccounts')}
                          to="/accounts/chart-of-accounts"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.mergeTransferAccounts')}
                          to="/accounts/merge-transfer-accounts"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.openingVoucherAccounts')}
                          to="/accounts/opening-voucher-accounts"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.chartsOfAccountsLevels')}
                          to="/accounts/charts-of-accounts-levels"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.cashCustomers')}
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
                        <Typography>{t('nav.transactions')}</Typography>
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
                          title={t('nav.makeCashPaymentVoucher')}
                          to="/accounts/cpv-transaction"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makeBankPaymentVoucher')}
                          to="/accounts/bpv-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makeCashReceiptVoucher')}
                          to="/accounts/crv-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makeBankReceiptVoucher')}
                          to="/accounts/brv-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makeJournalTransaction')}
                          to="/accounts/make-journal-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.accountStatements')}
                          to="/accounts/account-statements"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makePurchaseTransaction')}
                          to="/accounts/make-purchase-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makeSalesTransaction')}
                          to="/accounts/make-sales-transaction"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makePurchaseReturn')}
                          to="/accounts/make-purchase-return"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.makeSalesReturn')}
                          to="/accounts/make-sales-return"
                          icon={<AddCircleOutlineIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                      </Box>
                    )}

                    <SideBarItem
                      title={t('nav.viewTransactions')}
                      to="/accounts/view-transactions"
                      icon={<EditOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />
                    <SideBarItem
                      title={t('nav.customerMilkSale')}
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
                        <Typography>{t('nav.reports')}</Typography>
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
                          title={t('nav.generalLedger')}
                          to="/accounts/reports/general-ledger"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.ledgerReport')}
                          to="/accounts/reports/ledger-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.totalMilkConsumptionReport')}
                          to="/accounts/reports/total-milk-consumption-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.profitLossReport')}
                          to="/accounts/reports/profit-loss-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.miniProfitLossReport')}
                          to="/accounts/reports/mini-profit-loss-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.profitLossComparisonReport')}
                          to="/accounts/reports/profit-loss-comparison-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.trialBalanceReport')}
                          to="/accounts/reports/trial-balance-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.balanceSheet')}
                          to="/accounts/reports/balance-sheet"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.cashFlowStatement')}
                          to="/accounts/reports/cash-flow-statement"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.payablesReport')}
                          to="/accounts/reports/payables-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.receivablesReport')}
                          to="/accounts/reports/receivables-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.purchaseRegister')}
                          to="/accounts/reports/purchase-register"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.salesRegister')}
                          to="/accounts/reports/sales-register"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.mainHeadsReport')}
                          to="/accounts/reports/main-heads-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.dayBookReport')}
                          to="/accounts/reports/day-book-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.cashBook')}
                          to="/accounts/reports/cash-book"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.expenseReport')}
                          to="/accounts/reports/expense-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.salesReport')}
                          to="/accounts/reports/sales-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.billsPrint')}
                          to="/accounts/reports/bills-print"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.milkSalesReport')}
                          to="/accounts/reports/milk-sales-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.corporateMilkPayment')}
                          to="/accounts/reports/corporate-milk-payment"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.dayWiseMilkSaleReport')}
                          to="/accounts/reports/day-wise-milk-sale-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.weeklyMilkSale')}
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
                        <Typography>{t('nav.milkManagement')}</Typography>
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
                          title={t('nav.milkDashboard')}
                          to="/milk-dashboard"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                          isCollapsed={isCollapsed}
                        />
                        <SideBarItem
                          title={t('nav.addMilkingSession')}
                          to="/add-milking-session"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                          isCollapsed={isCollapsed}
                        />
                        <SideBarItem
                          title={t('nav.approveMilk')}
                          to="/list-of-milking"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                          isCollapsed={isCollapsed}
                        />
                        <SideBarItem
                          title={t('nav.milkOut')}
                          to="/milk-out"
                          icon={<ArrowOutwardIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.milkInOutReport')}
                          to="/milk-in-out"
                          icon={<ArrowOutwardIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.dailyMilkReport')}
                          to="/daily-milk-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.averageMilkReport')}
                          to="/average-milk-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.milkDifferenceReport')}
                          to="/milk-difference-report"
                          icon={<MapOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.cowMilkingGraph')}
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
                      title={t('nav.stockDashboard')}
                      to="/stock/dashboard"
                      icon={<HomeOutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title={t('nav.purchases')}
                      to="/stock/purchases"
                      icon={<Inventory2OutlinedIcon />}
                      selected={selected}
                      setSelected={setSelected}
                    />

                    <SideBarItem
                      title={t('nav.suppliers')}
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
                        <Typography>{t('nav.stock')}</Typography>
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
                          title={t('nav.stockRegistration')}
                          to="/stock-registration"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewRegistration')}
                          to="/view-registration"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.openVoucher')}
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
                        <Typography>{t('nav.feedingConsumption')}</Typography>
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
                          title={t('nav.addFeedingConsumption')}
                          to="/feeding-consumption/add"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewFeedingConsumption')}
                          to="/feeding-consumption/view"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.dayWiseConsumeReport')}
                          to="/feeding-consumption/day-wise-report"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.feedCostAnalysis')}
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
                        <Typography>{t('nav.medicineConsumption')}</Typography>
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
                          title={t('nav.addMedicineConsumption')}
                          to="/medicine-consumption"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.medicineConsumptionReport')}
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
                        <Typography>{t('nav.semenConsumption')}</Typography>
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
                          title={t('nav.addSemenConsumption')}
                          to="/add-semen-consumption"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.semenConsumptionReport')}
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
                        <Typography>{t('nav.otherStockConsumption')}</Typography>
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
                          title={t('nav.addConsumption')}
                          to="/add-consumption"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.consumptionReport')}
                          to="/other-stock-consumption-report"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.consumptionExpenseWise')}
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
                        <Typography>{t('nav.stockInventory')}</Typography>
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
                          title={t('nav.feedingStock')}
                          to="/feeding-stock"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.medicationStock')}
                          to="/medication-stock"
                          icon={<VisibilityOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.semenStock')}
                          to="/semen-stock"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.otherStock')}
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
                        <Typography>{t('nav.generalStockIssuance')}</Typography>
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
                          title={t('nav.addStockIssuance')}
                          to="/issuance/add-stock-issuance"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.viewStockIssuance')}
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
                        <Typography>{t('nav.reports')}</Typography>
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
                          title={t('nav.stockLedger')}
                          to="/reports/stock-ledger"
                          icon={<AddCircleOutlineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.stockLedgerAmount')}
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
                          title={t('nav.feedingSummary')}
                          to="/reports/feeding-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.medicineSummary')}
                          to="/reports/medicine-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />{' '}
                        <SideBarItem
                          title={t('nav.semenSummary')}
                          to="/reports/semen-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />{' '}
                        <SideBarItem
                          title={t('nav.otherStockSummary')}
                          to="/reports/other-stock-summary"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />{' '}
                        <SideBarItem
                          title={t('nav.stockReorder')}
                          to="/reports/stock-reorder"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.stockReorderDays')}
                          to="/reports/remaining-feeding-stock-days"
                          icon={<TimelineOutlinedIcon />}
                          selected={selected}
                          setSelected={setSelected}
                        />
                        <SideBarItem
                          title={t('nav.animalWiseStockCost')}
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
                      {t('nav.administration')}
                    </Typography>
                    {can([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE]) && (
                      <SideBarItem
                        title={t('nav.userManagement')}
                        to="/employee/user-management"
                        icon={<ManageAccountsOutlinedIcon />}
                        selected={selected}
                        setSelected={setSelected}
                      />
                    )}
                    {can(PERMISSIONS.ROLE_MANAGE) && (
                      <SideBarItem
                        title={t('nav.roleManagement')}
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
                  title={t('topbar.logout')}
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
