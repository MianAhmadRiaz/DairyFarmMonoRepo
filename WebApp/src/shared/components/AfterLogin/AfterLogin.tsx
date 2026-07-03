import React from 'react';
import { Box, Grid, Typography, keyframes } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedModule } from '../../store/userSlice';
import { usePermissions } from '../../rbac/usePermissions';
import { MODULE_VIEW_PERMISSION, PermissionName } from '../../rbac/permissions';
import { RootState } from '../../store';

// `perm` is the view-permission required to see the tile; undefined = always shown.
const modules: {
  title: string;
  blurb: string;
  icon: string;
  accent: string;
  perm?: PermissionName;
}[] = [
  {
    title: 'Herd Management',
    blurb: 'Track animals across every lifecycle stage',
    icon: '/assets/herd.png',
    accent: '#4cceac',
    perm: MODULE_VIEW_PERMISSION.herd
  },
  {
    title: 'Milk Management',
    blurb: 'Live yields, quality grades & trends',
    icon: '/assets/milking.png',
    accent: '#6870fa',
    perm: MODULE_VIEW_PERMISSION.milking
  },
  {
    title: 'Stock Management',
    blurb: 'Feed, medicine & supply inventory',
    icon: '/assets/stock.png',
    accent: '#e2a23b',
    perm: MODULE_VIEW_PERMISSION.stock
  },
  {
    title: 'Employee Payroll',
    blurb: 'Attendance, salaries & advances',
    icon: '/assets/employee.png',
    accent: '#e2726e',
    perm: MODULE_VIEW_PERMISSION.employee
  },
  {
    title: 'Feeding',
    blurb: 'Formulations & feeding schedules',
    icon: '/assets/feeding.png',
    accent: '#4cceac',
    perm: MODULE_VIEW_PERMISSION.feeding
  },
  {
    title: 'Accounts Management',
    blurb: 'Ledgers, budgets & financial health',
    icon: '/assets/accounts.png',
    accent: '#6870fa',
    perm: MODULE_VIEW_PERMISSION.accounts
  },
  {
    title: 'Admin',
    blurb: 'Users, roles & farm configuration',
    icon: '/assets/admin.png',
    accent: '#94e2cd',
    perm: MODULE_VIEW_PERMISSION.admin
  }
];

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(18px); }
  to { opacity: 1; transform: translateY(0); }
`;

const glow = keyframes`
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
`;

const routeFor = (title: string) => {
  switch (title) {
    case 'Milk Management':
      return { module: 'milking', path: '/milk-dashboard' };
    case 'Stock Management':
      return { module: 'stock', path: '/stock/dashboard' };
    case 'Employee Payroll':
      return { module: 'employee', path: '/employee/dashboard' };
    case 'Feeding':
      return { module: 'feeding', path: '/create-recipe' };
    case 'Accounts Management':
      return { module: 'accounts', path: '/accounts/dashboard' };
    case 'Herd Management':
      return { module: 'herd', path: '/herd-dashboard' };
    default:
      return { module: 'herd', path: '/herd-dashboard' };
  }
};

const AfterLogin: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { can } = usePermissions();
  const { user } = useSelector((state: RootState) => state.user);

  const allowedModules = modules.filter(m => !m.perm || can(m.perm));

  const greetingName = user?.firstname || 'there';
  const farmName = (user as any)?.['farm.name'] || (user as any)?.farm?.name || '';
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  const handleModuleClick = (title: string) => {
    const { module, path } = routeFor(title);
    dispatch(setSelectedModule(module as any));
    navigate(path);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        width: '100%',
        position: 'relative',
        overflow: 'auto',
        background: 'linear-gradient(160deg, #04222b 0%, #063947 45%, #0a5768 100%)',
        py: { xs: 5, sm: 7 },
        px: 2
      }}
    >
      {/* ambient glows */}
      <Box
        sx={{
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          top: -180,
          left: -140,
          background: 'radial-gradient(circle, rgba(76,206,172,0.28) 0%, rgba(76,206,172,0) 70%)',
          animation: `${glow} 6s ease-in-out infinite`,
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 460,
          height: 460,
          borderRadius: '50%',
          bottom: -160,
          right: -120,
          background: 'radial-gradient(circle, rgba(104,112,250,0.22) 0%, rgba(104,112,250,0) 70%)',
          animation: `${glow} 7s ease-in-out infinite`,
          animationDelay: '1s',
          pointerEvents: 'none'
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          opacity: 0.08,
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
          pointerEvents: 'none'
        }}
      />

      <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 1080, mx: 'auto' }}>
        <Box sx={{ mb: { xs: 4, sm: 5 }, animation: `${fadeUp} 0.6s ease both` }}>
          <Typography sx={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', mb: 0.75 }}>
            {timeGreeting}
          </Typography>
          <Typography
            sx={{
              color: '#fff',
              fontWeight: 800,
              fontSize: { xs: '1.7rem', sm: '2.1rem' },
              mb: 0.5
            }}
          >
            Welcome back, {greetingName} 👋
          </Typography>
          {farmName && (
            <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 14.5 }}>
              {farmName} · choose a module to get started
            </Typography>
          )}
        </Box>

        <Grid container spacing={2.5}>
          {allowedModules.map((mod, idx) => (
            <Grid item xs={12} sm={6} md={4} key={mod.title}>
              <Box
                onClick={() => handleModuleClick(mod.title)}
                sx={{
                  position: 'relative',
                  height: 190,
                  borderRadius: '18px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.14)',
                  backdropFilter: 'blur(14px)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  p: 2.5,
                  animation: `${fadeUp} 0.55s ease both`,
                  animationDelay: `${idx * 0.07}s`,
                  transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
                  '&:hover': {
                    transform: 'translateY(-6px)',
                    borderColor: mod.accent,
                    boxShadow: `0 16px 32px -12px ${mod.accent}55`
                  },
                  '&:hover .module-icon': {
                    transform: 'scale(1.08)'
                  }
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: -30,
                    right: -30,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${mod.accent}33 0%, transparent 70%)`
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, position: 'relative' }}>
                  <Box
                    className="module-icon"
                    sx={{
                      width: 52,
                      height: 52,
                      borderRadius: '14px',
                      background: 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'transform 0.25s ease',
                      flexShrink: 0
                    }}
                  >
                    <Box component="img" src={mod.icon} alt={mod.title} sx={{ width: 34, height: 34, objectFit: 'contain' }} />
                  </Box>
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      background: mod.accent,
                      ml: 'auto',
                      boxShadow: `0 0 8px 2px ${mod.accent}88`
                    }}
                  />
                </Box>

                <Box sx={{ position: 'relative' }}>
                  <Typography sx={{ color: '#fff', fontWeight: 700, fontSize: 16.5, mb: 0.4 }}>
                    {mod.title}
                  </Typography>
                  <Typography sx={{ color: 'rgba(255,255,255,0.55)', fontSize: 12.5, lineHeight: 1.4 }}>
                    {mod.blurb}
                  </Typography>
                </Box>
              </Box>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Box>
  );
};

export default AfterLogin;
