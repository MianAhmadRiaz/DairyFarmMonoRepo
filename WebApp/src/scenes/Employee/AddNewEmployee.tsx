import React from 'react';
import { useState, useRef } from 'react';
import { ToastContainer, toast, Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { addNewEmployee, EmployeeData } from '../../shared/services/EmployeeAPI/addemployee.service';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { tokens } from '../../shared/theme/theme';

import {
  Box,
  Typography,
  Button,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Grid,
  CircularProgress,
  useTheme
} from '@mui/material';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Name is required'),
  father_name: Yup.string().required('Father Name is required'),
  cnic: Yup.string()
    .matches(/^\d{5}-\d{7}-\d$/, 'CNIC must be in the format xxxxx-xxxxxxx-x')
    .nullable(),
  phone: Yup.string()
    .matches(/^\d{4}-\d{7}$/, 'Phone must be in format xxxx-xxxxxxx')
    .required('Phone is required'),
  city: Yup.string().required('City is required'),
  gender: Yup.string().required('Gender is required'),
  dob: Yup.string().required('Date of Birth is required'),
  marital_status: Yup.string().required('Marital Status is required'),
  designation: Yup.string().required('Designation is required'),
  department: Yup.string().required('Department is required'),
  doj: Yup.string().required('Date of Joining is required'),
  leave_allow: Yup.number().required('Leave Allow is required'),
  salary: Yup.number().required('Salary is required'),
  acc_no: Yup.string(),
  opening_advance: Yup.number().nullable(),
  address: Yup.string().required('Address is required')
});

const EmployeeRegistration = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const toastId = useRef<Id | null>(null);

  const formik = useFormik({
    initialValues: {
      name: '',
      father_name: '',
      cnic: '',
      phone: '',
      city: '',
      gender: 'female',
      dob: '',
      marital_status: '',
      designation: '',
      department: '',
      doj: '',
      leave_allow: '',
      salary: '',
      acc_no: '',
      opening_advance: '',
      address: ''
    },
    validationSchema: validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        const formatString = (value: string) =>
          value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  

         const formatCapitalizeWords = (value: string) => {
          return value
            .toLowerCase()
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')
            .trim();
        };
        const formatDate = (dateString: string) => {
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };

        const payload = {
          ...values,
        name: formatCapitalizeWords(values.name),           
        father_name: formatCapitalizeWords(values.father_name),
          gender: formatString(values.gender),
          marital_status: formatString(values.marital_status),
          designation: formatString(values.designation),
           department: values.department.toUpperCase(),
            // department: values.department,
           city: formatCapitalizeWords(values.city),
          address: formatCapitalizeWords(values.address),
          dob: formatDate(values.dob),
          doj: formatDate(values.doj),
          leave_allow: Number(values.leave_allow),
          salary: Number(values.salary),
          opening_advance: Number(values.opening_advance) || 0

        };
        console.log("Submitting payload:", payload);
        await addNewEmployee(payload);
        toast.success('Employee registered successfully!');
        resetForm();
      } catch (error: any) {
        console.error('Error Response:', error.response?.data);
        toast.error(error.response?.data?.message || 'Something went wrong.');
      }
    }
  });

  const formatCNIC = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 5) return digits;
    if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12, 13)}`;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 4) return digits;
    return `${digits.slice(0, 4)}-${digits.slice(4, 11)}`;
  };

  return (
    <PageContainer title="Employee Registration">
      {/* Registration Form */}
      <Box
        component="form"
        onSubmit={formik.handleSubmit}
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: 6,
          p: { xs: 2, md: 3 },
          boxShadow: 2
        }}
      >
        <Grid container spacing={3}>
          {/* Personal Details Column */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ backgroundColor: '#E7FFCE', textAlign: 'center', py: 1.5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#313131' }}>
                  Personal Details
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {[
                    { label: 'Name', name: 'name', required: true, placeholder: 'Employee Name' },
                    { label: 'Father Name', name: 'father_name', required: true, placeholder: 'Father Name' },
                    { label: 'CNIC', name: 'cnic', required: false, placeholder: 'xxxxx-xxxxxxx-x' },
                    { label: 'Phone', name: 'phone', required: true, placeholder: 'xxxx-xxxxxxx' },
                    { label: 'City', name: 'city', required: true, placeholder: 'City' }
                  ].map((field) => (
                    <Grid item xs={12} key={field.name}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                          {field.label}
                          {field.required && <span style={{ color: 'red' }}>*</span>}:
                        </Typography>
                        <TextField
                          fullWidth
                          name={field.name}
                          value={formik.values[field.name as keyof typeof formik.values]}
                          onChange={(e) => {
                            if (field.name === 'cnic') {
                              formik.setFieldValue('cnic', formatCNIC(e.target.value));
                            } else if (field.name === 'phone') {
                              formik.setFieldValue('phone', formatPhone(e.target.value));
                            } else {
                              formik.handleChange(e);
                            }
                          }}
                          onBlur={formik.handleBlur}
                          error={formik.touched[field.name as keyof typeof formik.touched] && 
                                Boolean(formik.errors[field.name as keyof typeof formik.errors])}
                          helperText={formik.touched[field.name as keyof typeof formik.touched] && 
                                    formik.errors[field.name as keyof typeof formik.errors]}
                          required={field.required}
                          size="small"
                          placeholder={field.placeholder}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 1,
                              '& fieldset': { border: '1px solid #ccc' }
                            }
                          }}
                        />
                      </Box>
                    </Grid>
                  ))}

                  {/* Gender */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Gender<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <RadioGroup
                        row
                        name="gender"
                        value={formik.values.gender}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                      >
                        {['female', 'male'].map(gender => (
                          <FormControlLabel
                            key={gender}
                            value={gender}
                            control={
                              <Radio sx={{ '&.Mui-checked': { color: 'green' } }} />
                            }
                            label={gender.charAt(0).toUpperCase() + gender.slice(1)}
                            sx={{
                              mr: 3,
                              '& .MuiFormControlLabel-label': {
                                color: formik.values.gender === gender ? 'green' : '#000'
                              }
                            }}
                          />
                        ))}
                      </RadioGroup>
                    </Box>
                    {formik.touched.gender && formik.errors.gender && (
                      <Typography sx={{ color: 'red', ml: 19, fontSize: 12 }}>
                        {formik.errors.gender}
                      </Typography>
                    )}
                  </Grid>

                  {/* Date of Birth */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Date of Birth<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <TextField
                        type="date"
                        name="dob"
                        value={formik.values.dob}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.dob && Boolean(formik.errors.dob)}
                        helperText={formik.touched.dob && formik.errors.dob}
                        required
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Marital Status */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Marital Status<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <FormControl fullWidth size="small">
                        <Select
                          name="marital_status"
                          value={formik.values.marital_status}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.marital_status && Boolean(formik.errors.marital_status)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #ccc'
                            }
                          }}
                        >
                          <MenuItem value="single">Single</MenuItem>
                          <MenuItem value="married">Married</MenuItem>
                        </Select>
                        {formik.touched.marital_status && formik.errors.marital_status && (
                          <Typography color="error" variant="caption" sx={{ mt: 0.5 }}>
                            {formik.errors.marital_status}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>

          {/* Official Details Column */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                borderRadius: 8,
                overflow: 'hidden',
                boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
                backgroundColor: theme.palette.background.paper
              }}
            >
              <Box sx={{ backgroundColor: '#E7FFCE', textAlign: 'center', py: 1.5 }}>
                <Typography variant="h6" fontWeight="bold" sx={{ color: '#313131' }}>
                  Official Details
                </Typography>
              </Box>

              <Box sx={{ p: 3 }}>
                <Grid container spacing={2}>
                  {/* Designation */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Designation<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <FormControl fullWidth required size="small">
                        <Select
                          name="designation"
                          value={formik.values.designation}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.designation && Boolean(formik.errors.designation)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #ccc'
                            }
                          }}
                        >
                          <MenuItem value="manager">Manager</MenuItem>
                          <MenuItem value="supervisor">Supervisor</MenuItem>
                        </Select>
                        {formik.touched.designation && formik.errors.designation && (
                          <Typography variant="caption" color="error">
                            {formik.errors.designation}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Department */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Department<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <FormControl fullWidth required size="small">
                        <Select
                          name="department"
                          value={formik.values.department}
                          onChange={formik.handleChange}
                          onBlur={formik.handleBlur}
                          error={formik.touched.department && Boolean(formik.errors.department)}
                          sx={{
                            '& .MuiOutlinedInput-notchedOutline': {
                              border: '1px solid #ccc'
                            }
                          }}
                        >
                          <MenuItem value="hr">HR</MenuItem>
                          <MenuItem value="finance">Finance</MenuItem>
                        </Select>
                        {formik.touched.department && formik.errors.department && (
                          <Typography variant="caption" color="error">
                            {formik.errors.department}
                          </Typography>
                        )}
                      </FormControl>
                    </Box>
                  </Grid>

                  {/* Date of Joining */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Date of Joining<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <TextField
                        type="date"
                        name="doj"
                        value={formik.values.doj}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.doj && Boolean(formik.errors.doj)}
                        helperText={formik.touched.doj && formik.errors.doj}
                        required
                        size="small"
                        fullWidth
                        InputLabelProps={{ shrink: true }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Leave Allow */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Leave Allow<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <TextField
                        name="leave_allow"
                        value={formik.values.leave_allow}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            formik.setFieldValue('leave_allow', e.target.value);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.leave_allow && Boolean(formik.errors.leave_allow)}
                        helperText={formik.touched.leave_allow && formik.errors.leave_allow}
                        required
                        fullWidth
                        size="small"
                        placeholder="Leave Allow"
                          inputProps={{
    inputMode: 'numeric',
    pattern: '[0-9]*'
  }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Salary */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Salary<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <TextField
                        name="salary"
                        value={formik.values.salary}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            formik.setFieldValue('salary', e.target.value);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.salary && Boolean(formik.errors.salary)}
                        helperText={formik.touched.salary && formik.errors.salary}
                        required
                        fullWidth
                        size="small"
                        placeholder="Salary"
                          inputProps={{
    inputMode: 'numeric',
    pattern: '[0-9]*'
  }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Account Number */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Account Number:
                      </Typography>
                      <TextField
                        name="acc_no"
                        value={formik.values.acc_no}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.acc_no && Boolean(formik.errors.acc_no)}
                        helperText={formik.touched.acc_no && formik.errors.acc_no}
                        fullWidth
                        size="small"
                        placeholder="Bank Account"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Opening Advance */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold' }}>
                        Opening Advance:
                      </Typography>
                      <TextField
                        name="opening_advance"
                        value={formik.values.opening_advance}
                        onChange={(e) => {
                          if (/^\d*$/.test(e.target.value)) {
                            formik.setFieldValue('opening_advance', e.target.value);
                          }
                        }}
                        onBlur={formik.handleBlur}
                        error={formik.touched.opening_advance && Boolean(formik.errors.opening_advance)}
                        helperText={formik.touched.opening_advance && formik.errors.opening_advance}
                        fullWidth
                        size="small"
                        placeholder="Amount"
                          inputProps={{
    inputMode: 'numeric',
    pattern: '[0-9]*'
  }}
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>

                  {/* Address */}
                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Typography sx={{ minWidth: 150, fontWeight: 'bold', pt: '6px' }}>
                        Address<span style={{ color: 'red' }}>*</span>:
                      </Typography>
                      <TextField
                        name="address"
                        value={formik.values.address}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        error={formik.touched.address && Boolean(formik.errors.address)}
                        helperText={formik.touched.address && formik.errors.address}
                        fullWidth
                        size="small"
                        placeholder="Address"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: 1,
                            '& fieldset': { border: '1px solid #ccc' }
                          }
                        }}
                      />
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </Box>
          </Grid>
        </Grid>

        {/* Submit Button */}
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            type="submit"
            disabled={formik.isSubmitting}
            sx={{
              px: 6,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 'semi-bold',
              textTransform: 'none',
              backgroundColor: '#005f73',
              '&:hover': { backgroundColor: '#007f91' },
              boxShadow: 2,
              borderRadius: 2
            }}
          >
            {formik.isSubmitting ? <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> : "Register Employee"}
          </Button>
        </Box>
      </Box>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </PageContainer>
  );
};

export default EmployeeRegistration;