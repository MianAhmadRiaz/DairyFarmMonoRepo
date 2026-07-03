import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography
} from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { register } from '../../services/auth.services'; // Import the register function




const SignUp = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    phoneNumber:'',
    email: '',
    password: '',
    confirmpassword: '',
    name:''

  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleToggleShowPassword = () => {
    setShowPassword(prev => !prev);
  };

  const handleChange = (e: { target: { name: any, value: any } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Convert Pakistani phone number format to international format
  const formatPhoneNumber = (phoneNumber: string) => {
    // Remove any existing country code and spaces/dashes
    let cleanNumber = phoneNumber.replace(/\s|-|\+92/g, '');
    
    // If number starts with 0, replace it with +92
    if (cleanNumber.startsWith('0')) {
      cleanNumber = '+92' + cleanNumber.substring(1);
    }
    // If number doesn't start with +92, add it (assuming it's already without leading 0)
    else if (!cleanNumber.startsWith('+92')) {
      cleanNumber = '+92' + cleanNumber;
    }
    
    return cleanNumber;
  };

  // Handle sign-up submission
const handleSignUp = async () => {
  try {
    setLoading(true);
    setError('');

    // Format phone number before sending to backend
    const formattedPhoneNumber = formatPhoneNumber(formData.phoneNumber);

    const payload = {
      firstname: formData.firstname,
      lastname: formData.lastname,
      email: formData.email,
      password: formData.password,
      confirmpassword: formData.confirmpassword,
      phoneNumber: formattedPhoneNumber,
      name: formData.name
    };

    console.log('Sending sign-up request with data:', payload);

    const response = await register(payload);

    console.log('API response:', response);

    navigate('/login');
  } catch (error: any) {
    const errorMessage =
      error?.response?.data?.message || 'Something went wrong, please try again.';
    setError(errorMessage);
    console.error('Sign-up failed:', errorMessage);
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
          backgroundImage: 'url(/assets/CowImage.png)',
          backgroundSize: 'cover',
          width: { md: '65%', lg: '65%', xl: '65%' },
          height: '100vh',
          backgroundPosition: 'center',
          display: { xs: 'none', md: 'block' }
        }}
      />

      {/* Right side - Sign Up Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '35%', lg: '35%', xl: '35%' },
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          p: { xs: 2, md: 3 },
          overflowY: 'auto',
          height: '100vh',
          backgroundColor: '#fff'
        }}
      >
        {/* Logo */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            mb: 1.5,
            width: '100%',
            mt: 1
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
          variant="h6" 
          fontWeight="bold" 
          textAlign="center" 
          mb={1.5}
          sx={{ 
            fontSize: { xs: '1.1rem', md: '1.25rem' },
            color: '#333'
          }}
        >
          Create Account
        </Typography>

        <Box
          sx={{
            width: '100%',
            maxWidth: { xs: '280px', md: '320px' },
            p: { xs: 0.5, md: 1 },
            boxShadow: 'none'
          }}
        >
          <Stack spacing={0.8}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="First Name"
              name="firstname"
              value={formData.firstname}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
                  '&:hover fieldset': {
                    borderColor: '#005f73'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005f73'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Last Name"
              name="lastname"
              value={formData.lastname}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
                  '&:hover fieldset': {
                    borderColor: '#005f73'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005f73'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Phone Number"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleChange}
              inputProps={{
                inputMode: 'numeric',
                pattern: '[0-9]*'
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
                  '&:hover fieldset': {
                    borderColor: '#005f73'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005f73'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Farm Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
                  '&:hover fieldset': {
                    borderColor: '#005f73'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005f73'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
                  '&:hover fieldset': {
                    borderColor: '#005f73'
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#005f73'
                  }
                }
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
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
                    <IconButton onClick={handleToggleShowPassword} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Confirm Password"
              name="confirmpassword"
              type={showPassword ? 'text' : 'password'}
              value={formData.confirmpassword}
              onChange={handleChange}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  height: '36px',
                  fontSize: '0.8rem',
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
                    <IconButton onClick={handleToggleShowPassword} edge="end" size="small">
                      {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Stack>

          {error && (
            <Typography variant="body2" color="error" sx={{ mt: 1.5, fontSize: '0.8rem' }}>
              {error}
            </Typography>
          )}

          <Button
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: '#005f73',
              color: '#fff',
              textTransform: 'none',
              borderRadius: '8px',
              py: 0.6,
              fontSize: '0.85rem',
              fontWeight: 500,
              '&:hover': { 
                backgroundColor: '#004a5c' 
              },
              mt: 2,
              mb: 1
            }}
            onClick={handleSignUp}
            disabled={loading}
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </Button>
        </Box>

        <Typography 
          variant="body2" 
          textAlign="center"
          sx={{ 
            fontSize: '0.8rem',
            color: '#666',
            mb: 1
          }}
        >
          Already have an account?{' '}
          <Typography
            component="span"
            sx={{ 
              color: '#005f73', 
              cursor: 'pointer', 
              fontWeight: 500,
              fontSize: '0.8rem',
              '&:hover': {
                textDecoration: 'underline'
              }
            }}
            onClick={() => navigate('/login')}
          >
            Log in
          </Typography>
        </Typography>
      </Box>
    </Box>
  );
};

export default SignUp;
