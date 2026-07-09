import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  TextField,
  Typography,
  IconButton
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useTranslation } from 'react-i18next';
import { forgotPassword, login } from '../../services/auth.services';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

   const handleSubmit = async () => {
     // Clear previous errors
     setError('');

     // Validate email
     if (!email.trim()) {
       setError(t('auth.forgotPasswordScreen.errorEmailRequired'));
       return;
     }

     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
       setError(t('auth.forgotPasswordScreen.errorEmailInvalid'));
       return;
     }

     try {
       const params = {
         email,
       };
       const response = await forgotPassword(params);
       console.log('response forgot', response);

       // Navigate to OTP screen with success message and email
       navigate('/verify-code', {
         state: {
           email: email,
           message: t('auth.forgotPasswordScreen.otpSent'),
           from: 'forgot-password'
         }
       });
     } catch (e:any) {
       console.log('forgot error', { e });
       setError(e.response?.data?.message || t('auth.forgotPasswordScreen.errorGeneric'));
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
      {/* Left side with cow image */}
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

      {/* Right side - Forgot Password Form */}
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
            onClick={() => navigate('/login')}
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
            alt={t('auth.common.logoAlt')}
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
          {t('auth.forgotPasswordScreen.title')}
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="textSecondary"
          sx={{ 
            mb: 2,
            fontSize: '0.9rem',
            maxWidth: '280px'
          }}
        >
          {t('auth.forgotPasswordScreen.subtitle')}
        </Typography>

        {/* Forgot Password Form */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '280px', md: '320px' },
            p: { xs: 1.5, md: 2 },
            boxShadow: 'none'
          }}
        >
          <TextField
            fullWidth
            variant="outlined"
            placeholder={t('auth.forgotPasswordScreen.emailPlaceholder')}
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
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
          />

          {/* Error Message */}
          {error && (
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {/* Next Button */}
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
            onClick={handleSubmit}
          >
            {t('common.next')}
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ForgotPassword;

