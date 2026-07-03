import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  InputAdornment
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { resetPassword } from '../../services/auth.services';

const SetNewPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Get email and OTP from navigation state (passed from previous screens)
  const email = location.state?.email || '';
  const otp = location.state?.otp || location.state?.verifiedOtp || '';

  const handleToggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleUpdatePassword = async () => {
    // Clear previous errors
    setError('');

    // Validate passwords
    if (!formData.newPassword.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (!formData.confirmPassword.trim()) {
      setError('Please confirm your password');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!otp) {
      setError('OTP not found. Please verify your code first.');
      return;
    }

    try {
      setLoading(true);
      
      const params = {
        password: formData.newPassword,
        confirmpassword: formData.confirmPassword,
        otp: parseInt(otp)
      };

      const response = await resetPassword(params);
      console.log('Password reset response:', response);
      
      // Navigate to login screen on success
      navigate('/login');
    } catch (e: any) {
      console.log('Password reset error:', e);
      setError(e.response?.data?.message || 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
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
      {/* Left side with background image */}
      <Box
        sx={{
          flex: 1,
          backgroundImage: `url(/assets/CowImage.png)`,
          backgroundSize: 'cover',
          width: { md: '65%', lg: '65%', xl: '65%' },
          height: '100vh',
          backgroundPosition: 'center',
          display: { xs: 'none', md: 'block' }
        }}
      />

      {/* Right side - Set New Password Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '35%', lg: '35%', xl: '35%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          p: { xs: 3, md: 4 },
          overflowY: 'auto',
          height: '100vh',
          backgroundColor: '#fff'
        }}
      >
        {/* Back Button */}
        <Box sx={{ alignSelf: 'flex-start', width: '100%', mb: 2 }}>
          <IconButton
            sx={{
              p: 1,
              '&:hover': {
                backgroundColor: 'rgba(0, 95, 115, 0.1)'
              }
            }}
            onClick={() => navigate('/verify-otp')}
          >
            <ArrowBackIcon sx={{ color: '#005f73' }} />
          </IconButton>
        </Box>

        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 2,
            width: '100%'
          }}
        >
          <Box
            component="img"
            src="/assets/Logo.png"
            alt="Logo"
            sx={{
              width: { xs: '220px', md: '280px' },
              height: { xs: '230px', md: '270px' },
              borderRadius: '50%',
              ml: { xs: '20px', md: '30px' } // Move logo slightly to the right
            }}
          />
        </Box>

        <Typography
          variant="h5"
          fontWeight="bold"
          textAlign="center"
          mb={1}
          sx={{
            fontSize: { xs: '1.25rem', md: '1.5rem' },
            color: '#333'
          }}
        >
          Set new Password
        </Typography>

        {/* Set New Password Form */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '280px', md: '320px' },
            p: { xs: 1.5, md: 2 },
            boxShadow: 'none'
          }}
        >
          <Typography
            variant="body2"
            sx={{
              mb: 1.5,
              fontWeight: 500,
              color: '#333',
              fontSize: '0.9rem'
            }}
          >
            New Password
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter password"
            name="newPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.newPassword}
            onChange={handleChange}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                height: '45px',
                '&:hover fieldset': {
                  borderColor: '#005f73'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#005f73'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleToggleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          <Typography
            variant="body2"
            sx={{
              mb: 1,
              fontWeight: 500,
              color: '#333',
              fontSize: '0.9rem'
            }}
          >
            Confirm Password
          </Typography>

          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter password"
            name="confirmPassword"
            type={showPassword ? 'text' : 'password'}
            value={formData.confirmPassword}
            onChange={handleChange}
            sx={{
              mb: 2,
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                height: '45px',
                '&:hover fieldset': {
                  borderColor: '#005f73'
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#005f73'
                }
              }
            }}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={handleToggleShowPassword} edge="end">
                    {showPassword ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                </InputAdornment>
              )
            }}
          />

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Update Password Button */}
          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#005f73',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '8px',
              py: 0.8,
              fontSize: '0.9rem',
              fontWeight: 500,
              '&:hover': {
                backgroundColor: '#004a5c'
              },
              mb: 2
            }}
            onClick={handleUpdatePassword}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default SetNewPassword;
