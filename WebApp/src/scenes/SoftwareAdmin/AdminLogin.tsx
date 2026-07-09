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
import { adminSignin, adminVerifyOtp } from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const AdminLogin: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [qrUrl, setQrUrl] = useState<string | undefined>(undefined);
  const [pendingUser, setPendingUser] = useState<any>(null);
  const [tempToken, setTempToken] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error(t('softwareAdmin.login.emailPasswordRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await adminSignin(email.trim().toLowerCase(), password);
      // Keep the temporary 2FA token local; storing it in redux would flip the
      // app to the admin shell before OTP verification completes.
      setTempToken(data.token);
      setPendingUser(data);
      setQrUrl(data.url);
      setStep('otp');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.login.signInFailed'));
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error(t('softwareAdmin.login.authCodeRequired'));
      return;
    }
    setLoading(true);
    try {
      const data = await adminVerifyOtp(otp.trim(), tempToken);
      dispatch(setUser({ ...pendingUser, ...data }));
      dispatch(setSoftwareAdmin(true));
      dispatch(setAuthToken(data.token));
      navigate('/software-admin/dashboard', { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || t('softwareAdmin.login.invalidAuthCode'));
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
            {step === 'credentials'
              ? t('softwareAdmin.login.credentialsSubtitle')
              : t('softwareAdmin.login.otpSubtitle')}
          </Typography>

          {step === 'credentials' && (
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
          )}

          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp}>
              {qrUrl && (
                <Box textAlign="center" mb={2}>
                  <Typography variant="body2" mb={1}>
                    {t('softwareAdmin.login.scanQr')}
                  </Typography>
                  <img src={qrUrl} alt={t('softwareAdmin.login.qrAlt')} style={{ width: 180, height: 180 }} />
                </Box>
              )}
              <TextField
                fullWidth
                label={t('softwareAdmin.login.authCode')}
                value={otp}
                onChange={e => setOtp(e.target.value)}
                margin="normal"
                inputProps={{ inputMode: 'numeric', maxLength: 6 }}
                autoFocus
              />
              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={22} /> : t('softwareAdmin.login.verifySignIn')}
              </Button>
              <Button
                fullWidth
                onClick={() => setStep('credentials')}
                sx={{ mt: 1 }}
                disabled={loading}
              >
                {t('softwareAdmin.login.back')}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default AdminLogin;
