import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Box, List, ListItemButton, ListItemIcon, ListItemText, Typography, Divider } from '@mui/material';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import AgricultureOutlinedIcon from '@mui/icons-material/AgricultureOutlined';
import WorkspacePremiumOutlinedIcon from '@mui/icons-material/WorkspacePremiumOutlined';
import SubscriptionsOutlinedIcon from '@mui/icons-material/SubscriptionsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import PaidOutlinedIcon from '@mui/icons-material/PaidOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';

import { onLogout } from '../../shared/store/userSlice';

const DRAWER_WIDTH = 250;

const AdminLayout: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const navItems = [
    { label: t('softwareAdmin.layout.nav.dashboard'), to: '/software-admin/dashboard', icon: <DashboardOutlinedIcon /> },
    { label: t('softwareAdmin.layout.nav.farms'), to: '/software-admin/farms', icon: <AgricultureOutlinedIcon /> },
    { label: t('softwareAdmin.layout.nav.plans'), to: '/software-admin/plans', icon: <WorkspacePremiumOutlinedIcon /> },
    { label: t('softwareAdmin.layout.nav.subscriptions'), to: '/software-admin/subscriptions', icon: <SubscriptionsOutlinedIcon /> },
    { label: t('softwareAdmin.layout.nav.payments'), to: '/software-admin/payments', icon: <ReceiptLongOutlinedIcon /> },
    { label: t('softwareAdmin.layout.nav.revenue'), to: '/software-admin/revenue', icon: <PaidOutlinedIcon /> },
    { label: t('softwareAdmin.layout.nav.auditLog'), to: '/software-admin/audit-logs', icon: <HistoryOutlinedIcon /> }
  ];

  const handleLogout = () => {
    dispatch(onLogout());
    navigate('/software-admin/login', { replace: true });
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          bgcolor: '#111827',
          color: '#fff',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={700}>
            CattleCare
          </Typography>
          <Typography variant="caption" sx={{ color: '#9ca3af' }}>
            {t('softwareAdmin.layout.ownerPanel')}
          </Typography>
        </Box>
        <Divider sx={{ borderColor: '#374151' }} />
        <List sx={{ flex: 1 }}>
          {navItems.map(item => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              sx={{
                color: '#d1d5db',
                '&.active': { bgcolor: '#1f2937', color: '#fff', borderLeft: '3px solid #22c55e' }
              }}
            >
              <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider sx={{ borderColor: '#374151' }} />
        <ListItemButton onClick={handleLogout} sx={{ color: '#f87171' }}>
          <ListItemIcon sx={{ color: 'inherit', minWidth: 40 }}>
            <LogoutOutlinedIcon />
          </ListItemIcon>
          <ListItemText primary={t('softwareAdmin.layout.logout')} />
        </ListItemButton>
      </Box>

      <Box sx={{ flexGrow: 1, ml: `${DRAWER_WIDTH}px`, p: 3, bgcolor: '#f3f4f6', minHeight: '100vh' }}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default AdminLayout;
