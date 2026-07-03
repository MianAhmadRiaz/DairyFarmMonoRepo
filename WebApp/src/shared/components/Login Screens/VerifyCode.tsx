import React, { useState, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  Typography,
  IconButton,
  InputBase
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

// Import local images

const VerifyCode = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [code, setCode] = useState(['', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) return; // Only allow one digit per input
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto-focus next input if current input has a value and not the last input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    // Move to previous input on backspace if current input is empty
    if (event.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = () => {
    const enteredCode = code.join('');
    if (enteredCode === '1234') {
      // Replace with actual verification logic
      // Get email from location state (passed from forgot password)
      const email = location.state?.email || '';
      
      // Navigate to set new password screen with email and verified OTP
      navigate('/set-new-password', { 
        state: { 
          email: email,
          otp: enteredCode,
          verifiedOtp: enteredCode
        } 
      });
    } else {
      alert('Invalid code, please try again.');
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

      {/* Right side - Code Verification Form */}
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
            onClick={() => navigate('/forgot-password')}
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
          Verify OTP
        </Typography>
        <Typography
          variant="body2"
          textAlign="center"
          color="textSecondary"
          sx={{
            mb: 2,
            fontSize: '0.85rem',
            maxWidth: '300px',
            mx: 'auto'
          }}
        >
          We sent a reset link to dummy.....com. Enter the 4-digit code that was
          mentioned in the email.
        </Typography>

        {/* Code Input Fields */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '280px', md: '320px' },
            p: { xs: 1.5, md: 2 },
            boxShadow: 'none',
            display: 'flex',
            justifyContent: 'center',
            gap: 1.5,
            mb: 2
          }}
        >
          {code.map((digit, index) => (
            <InputBase
              key={index}
              type="text"
              value={digit}
              onChange={e => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e as React.KeyboardEvent<HTMLInputElement>)}
              inputRef={(el: HTMLInputElement | null) => {
                inputRefs.current[index] = el;
              }}
              inputProps={{
                maxLength: 1,
                style: {
                  textAlign: 'center',
                  fontSize: '20px',
                  width: '45px',
                  height: '45px',
                  border: '2px solid #e0e0e0',
                  borderRadius: '8px',
                  backgroundColor: '#fff',
                  outline: 'none'
                }
              }}
              sx={{
                '& input:focus': {
                  borderColor: '#005f73 !important'
                }
              }}
            />
          ))}
        </Box>

        {/* Verify Button */}
        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '280px', md: '320px' }
          }}
        >
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
            onClick={handleVerify}
          >
            Verify Code
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default VerifyCode;
