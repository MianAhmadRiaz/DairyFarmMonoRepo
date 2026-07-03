import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  useTheme,
  Menu,
  MenuItem,
  Divider,
  Typography,
  Avatar,
  ListItemIcon
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { ColorModeContext, tokens } from '../../theme/theme';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import MenuOutlinedIcon from '@mui/icons-material/MenuOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined';
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined';
import { setAuthToken } from '../../store/userSlice';
import { setSidebarCollapsed } from '../../store/sidebarSlice';
import { RootState } from '../../store';
import useLayoutShift from '../Hooks/useLayoutShift';
import { getSidebarOffset, TOPBAR_HEIGHT } from '../Layout/layoutConstants';

const Topbar: React.FC = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const colorMode = useContext(ColorModeContext);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isMobile, isCollapsed } = useLayoutShift();
  const offset = getSidebarOffset(isMobile, isCollapsed);

  const user = useSelector((state: RootState) => state.user.user);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(setAuthToken(''));
    navigate('/login', { replace: true });
  };

  const getInitials = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname[0]}${user.lastname[0]}`.toUpperCase();
    }
    if (user?.firstname) {
      return user.firstname[0].toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return 'U';
  };

  const getFullName = () => {
    if (user?.firstname && user?.lastname) {
      return `${user.firstname} ${user.lastname}`;
    }
    if (user?.firstname) {
      return user.firstname;
    }
    return 'User';
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        ml: { xs: 0, md: `${offset}px` },
        width: { xs: '100%', md: `calc(100% - ${offset}px)` },
        transition: 'margin-left 0.3s ease, width 0.3s ease',
        zIndex: (t) => t.zIndex.drawer + 1,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}
    >
      <Toolbar sx={{ height: TOPBAR_HEIGHT, minHeight: `${TOPBAR_HEIGHT}px !important`, justifyContent: 'space-between', gap: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => dispatch(setSidebarCollapsed(false))}
            sx={{ display: { xs: 'flex', md: 'none' } }}
            aria-label="Open sidebar menu"
          >
            <MenuOutlinedIcon />
          </IconButton>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 0.25, sm: 1 } }}>
          <IconButton onClick={() => navigate('/after-login')} aria-label="Home">
            <HomeOutlinedIcon />
          </IconButton>

          <IconButton onClick={colorMode.toggleColorMode} aria-label="Toggle color mode">
            {theme.palette.mode === 'dark' ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
          </IconButton>

          <IconButton
            onClick={handleMenuOpen}
            aria-controls={open ? 'user-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: colors.greenAccent[500],
                fontSize: '0.875rem'
              }}
            >
              {getInitials()}
            </Avatar>
          </IconButton>

          <Menu
            id="user-menu"
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            onClick={handleMenuClose}
            slotProps={{
              paper: {
                elevation: 3,
                sx: {
                  minWidth: 280,
                  mt: 1.5,
                  overflow: 'visible',
                  filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.15))',
                  bgcolor: theme.palette.background.paper,
                  '&:before': {
                    content: '""',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: theme.palette.background.paper,
                    transform: 'translateY(-50%) rotate(45deg)',
                    zIndex: 0
                  }
                }
              }
            }}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Box display="flex" alignItems="center" gap={1.5}>
                <Avatar
                  sx={{
                    width: 48,
                    height: 48,
                    bgcolor: colors.greenAccent[500],
                    fontSize: '1.2rem'
                  }}
                >
                  {getInitials()}
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {getFullName()}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.greenAccent[400] }}>
                    Admin
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Divider sx={{ my: 1 }} />

            {user?.email && (
              <MenuItem sx={{ py: 1, pointerEvents: 'none' }}>
                <ListItemIcon>
                  <EmailOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2" noWrap>
                  {user.email}
                </Typography>
              </MenuItem>
            )}

            {user?.phoneNumber && (
              <MenuItem sx={{ py: 1, pointerEvents: 'none' }}>
                <ListItemIcon>
                  <PhoneOutlinedIcon fontSize="small" />
                </ListItemIcon>
                <Typography variant="body2">{user.phoneNumber}</Typography>
              </MenuItem>
            )}

            <Divider sx={{ my: 1 }} />

            <MenuItem
              onClick={handleLogout}
              sx={{
                py: 1.5,
                color: colors.redAccent[400],
                '&:hover': {
                  bgcolor: theme.palette.mode === 'dark' ? colors.redAccent[900] : colors.redAccent[100]
                }
              }}
            >
              <ListItemIcon>
                <LogoutIcon fontSize="small" sx={{ color: colors.redAccent[400] }} />
              </ListItemIcon>
              <Typography variant="body2" fontWeight="500">
                Sign Out
              </Typography>
            </MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Topbar;
