import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  TextField,
  Typography
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import {
  setAuthToken,
  setUser,
  setSoftwareAdmin
} from '../../shared/store/userSlice';
import { adminSignin } from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // The authenticator-app (TOTP) flow is disabled server-side: /signin already
  // returns a full session token, so we log the admin in directly with no OTP
  // step. The verify-otp endpoint and its UI can be restored when 2FA is re-enabled.
  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('softwareAdmin.login.emailPasswordRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await adminSignin(email.trim().toLowerCase(), password);
      dispatch(setUser(data));
      dispatch(setSoftwareAdmin(true));
      dispatch(setAuthToken(data.token));
      navigate('/software-admin/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.login.signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg,#1f2937,#111827)',
        p: 2
      }}
    >
      <Card sx={{ width: 420, maxWidth: '100%', borderRadius: 3, boxShadow: 6 }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h5" fontWeight={700} textAlign="center" gutterBottom>
            {t('softwareAdmin.login.portalTitle')}
          </Typography>
          <Typography variant="body2" color="text.secondary" textAlign="center" mb={3}>
            {t('softwareAdmin.login.credentialsSubtitle')}
          </Typography>

          <form onSubmit={handleCredentials}>
            <TextField
              fullWidth
              label={t('softwareAdmin.login.email')}
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              margin="normal"
              autoComplete="username"
            />
            <TextField
              fullWidth
              label={t('softwareAdmin.login.password')}
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              margin="normal"
              autoComplete="current-password"
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{ mt: 2 }}
            >
              {loading ? <CircularProgress size={22} /> : t('softwareAdmin.login.continue')}
            </Button>
          </form>
        </CardContent>
      </Card>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default AdminLogin;
