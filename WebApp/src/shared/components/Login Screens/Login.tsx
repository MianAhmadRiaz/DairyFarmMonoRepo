import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  keyframes
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import LockOutlineIcon from '@mui/icons-material/LockOutlined';
import { useDispatch, useSelector } from 'react-redux';
import {
  setAuthToken,
  setRememberMe,
  setUser
} from '../../store/userSlice';
import { login } from '../../services/auth.services';
import { RootState } from '../../store';
import SmartFarmScene from './SmartFarmScene';

const fadeUp = keyframes`
  from { opacity: 0; transform: translateY(14px); }
  to { opacity: 1; transform: translateY(0); }
`;

const ACCENT = '#0f7c8f';
const ACCENT_DARK = '#0a5768';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { rememberMe, user, authToken } = useSelector((state: RootState) => state.user);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Check if user is already authenticated and redirect
  useEffect(() => {
    if (authToken && user) {
      // User is already logged in, redirect to dashboard
      navigate('/after-login', { replace: true });
    }
  }, [authToken, user, navigate]);

  const handleToggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleLogin = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const params = { email, password };
      const response = await login(params);
      const token = response?.data.data?.token;
      const userData = response?.data.data;
      dispatch(setAuthToken(token));
      dispatch(setUser(userData));
      // Use replace to prevent going back to login screen
      navigate('/after-login', { replace: true });
    } catch (e: any) {
      console.log('login error', { e });
      setError(e?.response?.data?.message || t('auth.signInError'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        width: '100%',
        overflow: 'hidden'
      }}
    >
      {/* Left side — animated smart-farm scene (replaces static cow photo) */}
      <Box
        sx={{
          width: { md: '60%', lg: '62%' },
          height: '100vh',
          display: { xs: 'none', md: 'block' }
        }}
      >
        <SmartFarmScene />
      </Box>

      {/* Right side - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '40%', lg: '38%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, md: 4 },
          overflowY: 'auto',
          height: '100vh',
          background: 'linear-gradient(180deg, #ffffff 0%, #f4f9f8 100%)'
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: 300, md: 340 },
            animation: `${fadeUp} 0.6s ease both`
          }}
        >
          {/* Logo */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 1.5 }}>
            <Box
              component="img"
              src="/assets/Logo.png"
              alt="CattleCare"
              sx={{
                width: { xs: 96, md: 108 },
                height: { xs: 96, md: 108 },
                borderRadius: '50%',
                boxShadow: '0 8px 24px rgba(15,124,143,0.18)'
              }}
            />
          </Box>

          <Typography
            textAlign="center"
            sx={{ color: '#6b7a79', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', mb: 0.5 }}
          >
            CattleCare
          </Typography>
          <Typography
            variant="h5"
            fontWeight={800}
            textAlign="center"
            sx={{ fontSize: { xs: '1.4rem', md: '1.6rem' }, color: '#0d2b2f', mb: 0.5 }}
          >
            {t('auth.welcomeBack')}
          </Typography>
          <Typography textAlign="center" sx={{ color: '#7c8d8c', fontSize: 13.5, mb: 3.5 }}>
            {t('auth.subtitle')}
          </Typography>

          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: '#22403f', fontSize: '0.85rem' }}>
            {t('auth.email')}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('auth.emailPlaceholder')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                height: '46px',
                backgroundColor: '#fafcfc',
                transition: 'box-shadow 0.2s ease',
                '&:hover fieldset': { borderColor: ACCENT },
                '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: 2 },
                '&.Mui-focused': { boxShadow: `0 0 0 4px ${ACCENT}1a` }
              }
            }}
          />

          <Typography variant="body2" sx={{ mb: 0.75, fontWeight: 600, color: '#22403f', fontSize: '0.85rem' }}>
            {t('auth.password')}
          </Typography>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('auth.passwordPlaceholder')}
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              mb: 1.5,
              '& .MuiOutlinedInput-root': {
                borderRadius: '10px',
                height: '46px',
                backgroundColor: '#fafcfc',
                transition: 'box-shadow 0.2s ease',
                '&:hover fieldset': { borderColor: ACCENT },
                '&.Mui-focused fieldset': { borderColor: ACCENT, borderWidth: 2 },
                '&.Mui-focused': { boxShadow: `0 0 0 4px ${ACCENT}1a` }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleToggleShowPassword} edge="end" size="small">
                    {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Remember Me Section */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 2
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  size="small"
                  checked={rememberMe}
                  onChange={e => dispatch(setRememberMe(e.target.checked))}
                  sx={{ color: ACCENT, '&.Mui-checked': { color: ACCENT } }}
                />
              }
              label={
                <Typography variant="body2" sx={{ fontSize: '0.83rem', color: '#4c5a59' }}>
                  {t('auth.rememberMe')}
                </Typography>
              }
            />
            <Typography
              variant="body2"
              sx={{
                color: ACCENT,
                cursor: 'pointer',
                fontSize: '0.83rem',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => navigate('/forgot-password')}
            >
              {t('auth.forgotPassword')}
            </Typography>
          </Box>

          {error && (
            <Typography
              variant="body2"
              sx={{
                mb: 2,
                color: '#b3261e',
                background: '#fdecea',
                borderRadius: '8px',
                px: 1.5,
                py: 1,
                fontSize: '0.8rem'
              }}
            >
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            disabled={submitting || !email || !password}
            sx={{
              background: `linear-gradient(90deg, ${ACCENT_DARK}, ${ACCENT})`,
              color: '#fff',
              textTransform: 'none',
              borderRadius: '10px',
              py: 1.05,
              fontSize: '0.92rem',
              fontWeight: 600,
              boxShadow: '0 10px 24px rgba(15,124,143,0.28)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              '&:hover': {
                background: `linear-gradient(90deg, ${ACCENT_DARK}, ${ACCENT})`,
                transform: 'translateY(-1px)',
                boxShadow: '0 14px 28px rgba(15,124,143,0.34)'
              },
              '&.Mui-disabled': { color: '#fff', opacity: 0.6 },
              mb: 2.5
            }}
            onClick={handleLogin}
            startIcon={
              submitting ? (
                <CircularProgress size={16} sx={{ color: '#fff' }} />
              ) : (
                <LockOutlineIcon sx={{ fontSize: 18 }} />
              )
            }
          >
            {submitting ? t('auth.signingIn') : t('auth.logIn')}
          </Button>

          <Typography variant="body2" textAlign="center" sx={{ fontSize: '0.83rem', color: '#7c8d8c' }}>
            {t('auth.noAccount')}{' '}
            <Typography
              component="span"
              variant="body2"
              sx={{
                color: ACCENT,
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.83rem',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => navigate('/sign-up')}
            >
              {t('auth.signUp')}
            </Typography>
          </Typography>

          <Typography
            component="div"
            variant="body2"
            textAlign="center"
            sx={{
              mt: 1.5,
              fontSize: '0.78rem',
              color: '#9aa8a7',
              cursor: 'pointer',
              fontWeight: 500,
              '&:hover': { color: ACCENT, textDecoration: 'underline' }
            }}
            onClick={() => navigate('/software-admin/login')}
          >
            {t('auth.softwareOwnerLogin')}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;
