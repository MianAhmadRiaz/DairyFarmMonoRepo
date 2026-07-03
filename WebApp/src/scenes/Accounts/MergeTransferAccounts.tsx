// import React, { useState } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   Grid,
//   TextField,
//   MenuItem,
//   useTheme
// } from '@mui/material';

// // Sample account options based on the screenshot
// const ACCOUNT_OPTIONS = [
//   'Feed Asset',
//   'Medicine Asset',
//   'Semen Asset',
//   'Inventory Asset',
//   '[Sale of Product Income]',
//   '[Feed Consumption Expense (CGS)]'
// ];

// const pageBg = '#F5FAF7';

// export default function MergeAccountHead() {
//   const theme = useTheme();

//   const [mergeIn, setMergeIn] = useState < string > 'Feed Asset';
//   const [mergeFrom, setMergeFrom] = useState < string > '';

//   return (
//     <Box
//       sx={{
//         bgcolor: pageBg,
//         minHeight: '100vh',
//         py: 6,
//         pl: { md: '330px', xs: 0 },
//         overflowX: 'hidden'
//       }}
//     >
//       <Box sx={{ maxWidth: 980, px: 2, mx: 'auto' }}>
//         {/* Main Card */}
//         <Paper
//           elevation={0}
//           sx={{
//             borderRadius: 2,
//             border: `1px solid ${theme.palette.divider}`,
//             overflow: 'hidden',
//             bgcolor: 'background.paper'
//           }}
//         >
//           {/* Green Header */}
//           <Box
//             sx={{
//               bgcolor: '#4CAF50', // Green color from screenshot
//               color: '#fff',
//               px: 2.5,
//               py: 1.5
//             }}
//           >
//             <Typography variant="h6" fontWeight={600}>
//               Merge Account Head
//             </Typography>
//           </Box>

//           {/* Body */}
//           <Box sx={{ p: 4 }}>
//             <Grid container spacing={3} alignItems="center">
//               {/* Merge In Row */}
//               <Grid item xs={12} sm={3}>
//                 <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                   Merge In
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} sm={9}>
//                 <TextField
//                   select
//                   fullWidth
//                   size="small"
//                   value={mergeIn}
//                   onChange={e => setMergeIn(e.target.value)}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       backgroundColor: '#f5f5f5'
//                     }
//                   }}
//                 >
//                   {ACCOUNT_OPTIONS.map(option => (
//                     <MenuItem key={option} value={option}>
//                       {option}
//                     </MenuItem>
//                   ))}
//                 </TextField>
//               </Grid>

//               {/* Merge From Row */}
//               <Grid item xs={12} sm={3}>
//                 <Typography variant="body1" sx={{ fontWeight: 500 }}>
//                   Merge From
//                 </Typography>
//               </Grid>
//               <Grid item xs={12} sm={9}>
//                 <TextField
//                   select
//                   fullWidth
//                   size="small"
//                   value={mergeFrom}
//                   onChange={e => setMergeFrom(e.target.value)}
//                   sx={{
//                     '& .MuiOutlinedInput-root': {
//                       backgroundColor: '#f5f5f5'
//                     }
//                   }}
//                 >
//                   <MenuItem value="">
//                     <em>Select an account</em>
//                   </MenuItem>
//                   {ACCOUNT_OPTIONS.filter(option => option !== mergeIn).map(
//                     option => (
//                       <MenuItem key={option} value={option}>
//                         {option}
//                       </MenuItem>
//                     )
//                   )}
//                 </TextField>
//               </Grid>
//             </Grid>
//           </Box>
//         </Paper>
//       </Box>
//     </Box>
//   );
// }
