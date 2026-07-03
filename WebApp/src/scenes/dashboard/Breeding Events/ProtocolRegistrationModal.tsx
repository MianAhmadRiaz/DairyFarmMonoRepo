import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Modal,
  Typography,
  TextField,
  MenuItem,
  Grid,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  addInjection,
  addProtocol,
  fetchInjectionsList
} from '../../../shared/services/breeds.services';

// const injectionOptions = ["GnRH", "PGF2α", "Estradiol"];

const ProtocolRegistrationModal = ({ open, onClose }) => {
  const [injectionOptions, setInjectionOptions] = useState(['']);
  const [protocolName, setProtocolName] = useState('');
  const [minDim, setMinDim] = useState('');
  const [maxDim, setMaxDim] = useState('');
  const [aiTime, setAiTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [injections, setInjections] = useState([
    { id: 1, name: '', interval: '01' }
  ]);

  const [newModalOpen, setNewModalOpen] = useState(false);
  const [isHidden, setIsHidden] = useState(false); // Tracks visibility of the main modal
  const [alert, setAlert] = useState({ open: false, type: '', message: '' });

  const handleAddInjection = () => {
    setInjections([
      ...injections,
      {
        id: injections.length + 1,
        name: injectionOptions[0]?.name || '',
        interval: '01'
      }
    ]);
  };

  const handleRemoveInjection = id => {
    setInjections(injections.filter(inj => inj.id !== id));
  };

  useEffect(() => {
    const loadInjections = async () => {
      try {
        const injectionsData = await fetchInjectionsList();
        console.log('Loaded Injections =>', injectionsData);
        setInjectionOptions(injectionsData);
        setInjections(prev =>
          prev.length === 1 && !prev[0].name
            ? [{ id: 1, name: injectionsData[0]?.name || '', interval: '01' }]
            : prev
        );
      } catch (error) {
        console.error('Failed to load tags:', error);
      }
    };

    loadInjections();
  }, []);

  useEffect(() => {
  if (open) {
    setAlert({ open: false, type: '', message: '' });
  }
}, [open]);

  // const handleAddEvent = async () => {
  //   setIsLoading(true);
  //   // Gather form data
  //   const data = {
  //     name: protocolName,
  //     min_DIM: minDim,
  //     max_DIM: maxDim,
  //     ai_time: aiTime,
  //     injections: injections.map(inj => ({
  //       name: inj.name,
  //       interval: parseInt(inj.interval, 10)
  //     })) // Extract only the required fields
  //   };
  //   console.log('Add New Event data:', data);
  //   try {
  //     console.log('Add New Event data:', data);
  //     await addProtocol(data);
  //     setAlert({
  //       open: true,
  //       type: 'success',
  //       message: 'New event added successfully!'
  //     });

  //     // Reset form fields
  //     setProtocolName('');
  //     setMinDim('');
  //     setMaxDim('');
  //     setAiTime('');
  //     setInjections([
  //       {
  //         id: 1,
  //         name: injectionOptions[0]?.name || '',
  //         interval: '01'
  //       }
  //     ]);
  //     onClose();
  //   } catch (error) {
  //     setAlert({
  //       open: true,
  //       type: 'warn',
  //       message: 'Failed to add new event!'
  //     });
  //     console.error('Failed to add new event:', error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const handleAddEvent = async () => {
  // Close any previous snackbar
  setAlert(prev => ({ ...prev, open: false }));

  // Field validation
  if (!protocolName || !minDim || !maxDim || !aiTime) {
    setAlert({
      open: true,
      type: 'error',
      message: 'Please fill all required fields.'
    });
    return;
  }

  setIsLoading(true);

  const data = {
    name: protocolName,
    min_DIM: minDim,
    max_DIM: maxDim,
    ai_time: aiTime,
    injections: injections
      .filter(inj => inj.name && inj.interval)
      .map(inj => ({
        name: inj.name,
        interval: parseInt(inj.interval, 10)
      }))
  };

  try {
    await addProtocol(data);

    
    setAlert({
      open: true,
      type: 'success',
      message: 'New event added successfully!'
    });

   
    setTimeout(() => {
      // Reset form
      setProtocolName('');
      setMinDim('');
      setMaxDim('');
      setAiTime('');
      setInjections([
        {
          id: 1,
          name: injectionOptions[0]?.name || '',
          interval: '01'
        }
      ]);
      onClose();
    }, 800); // Show toast briefly before closing modal

  } catch (error) {
    setAlert({
      open: true,
      type: 'error',
      message: 'Failed to add new event!'
    });
    console.error('Failed to add new event:', error);
  } finally {
    setIsLoading(false);
  }
};


  return (
    <>
      {/* Protocol Registration Modal (hidden instead of closed) */}
      <Modal open={open && !isHidden} onClose={onClose}>
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: {xs:'50%',md:'55%'},
            transform: 'translate(-50%, -50%)',
            // width: '70vw',
             width: { xs: '90vw', md: '70vw' },
            bgcolor: 'white',
            boxShadow: 24,
            borderRadius: '12px',
            // p: 4
                p: { xs: 2, md: 4 }

          }}
        >
          <Typography variant="h6" fontWeight="bold" mb={2} textAlign="center">
            Protocol Registration
          </Typography>

          {/* <Snackbar
            open={alert.open}
            autoHideDuration={4000}
            onClose={() => setAlert({ ...alert, open: false })}
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Alert
              onClose={() => setAlert({ ...alert, open: false })}
              severity={alert.type}
              sx={{ width: '100%',
                 backgroundColor: 'white',
                 boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
               }}
            >
              {alert.message}
            </Alert>
          </Snackbar> */}

          {alert.open && (
  <Snackbar
    open={alert.open}
    autoHideDuration={4000}
    onClose={() => setAlert({ ...alert, open: false })}
    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
  >
    <Alert
      onClose={() => setAlert({ ...alert, open: false })}
      severity={alert.type}
      sx={{
        width: '100%',
        backgroundColor: 'white',
        boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
      }}
    >
      {alert.message}
    </Alert>
  </Snackbar>
)}


          {/* Protocol Information Fields */}
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Protocol Name"
                value={protocolName}
                onChange={e => setProtocolName(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Min DIM"
                value={minDim}
                onChange={e => setMinDim(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="Max DIM"
                value={maxDim}
                onChange={e => setMaxDim(e.target.value)}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                fullWidth
                label="AI Time (Hours)"
                value={aiTime}
                onChange={e => setAiTime(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Injection List */}
          <Box mt={3}>
            <Grid container spacing={2} sx={{ alignItems: 'center', pb: 1 }}>
              <Grid item xs={1}>
                <Typography fontWeight="bold">#</Typography>
              </Grid>
              {/* <Grid display="flex" gap={1} item xs={5}> */}
              {/* <Grid display="flex" gap={1} item xs={12} md={5} flexDirection={{ xs: 'column', sm: 'row' }}>
                <Typography fontWeight="bold">Injections</Typography>
                <Button
                  variant="contained"
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#005f73',
                    padding: '5px 10px',
                    borderRadius: '8px',
                    marginLeft: '10px',
                    transform: 'translateY(-5px)', // Adjust this value as needed

                    '&:hover': { backgroundColor: '#007f91' }
                  }}
              
                  onClick={() => {
                  setAlert({ open: false, type: '', message: '' }); 
                 setIsHidden(true); 
                 setTimeout(() => {
                 setNewModalOpen(true); 
                  }, 100); 
                  }}

                >
                  New Injection
                </Button>
              </Grid> */}
              <Grid
  item
  xs={12}
  md={5}
  display="flex"
  flexDirection="row" // ✅ force side-by-side on all screen sizes
  alignItems="center"
  gap={4}
  flexWrap="wrap" // ✅ allows wrap if screen is very narrow
>
  <Typography fontWeight="bold">Injections</Typography>
  <Button
    variant="contained"
    sx={{
      textTransform: 'none',
      backgroundColor: '#005f73',
      padding: '5px 10px',
      borderRadius: '8px',
      transform: 'translateY(-2px)',
      whiteSpace: 'nowrap', // ✅ prevent text wrapping on button
      '&:hover': {
        backgroundColor: '#007f91'
      }
    }}
    onClick={() => {
      setAlert({ open: false, type: '', message: '' });
      setIsHidden(true);
      setTimeout(() => {
        setNewModalOpen(true);
      }, 100);
    }}
  >
    New Injection
  </Button>
</Grid>

              <Grid item xs={4}>
                <Typography fontWeight="bold">Interval</Typography>
              </Grid>
              <Box display="flex" justifyContent="flex-end">
                <Button
                  variant="contained"
                  onClick={handleAddInjection}
                  sx={{
                    textTransform: 'none',
                    backgroundColor: '#005f73',
                    marginRight: '125px', // Adjust this value as needed
                    padding: '5px 10px',
                    borderRadius: '8px',
                    '&:hover': {
                      backgroundColor: '#007f91'
                    }
                  }}
                >
                  Add Intervals
                </Button>
              </Box>
            </Grid>

            {injections.map((inj, index) => (
              <Grid
                container
                spacing={2}
                key={inj.id}
                sx={{ alignItems: 'center', pb: 1 }}
              >
                <Grid item xs={1}>
                  <Typography>{index + 1}</Typography>
                </Grid>
                <Grid item xs={5}>
                  <TextField
                    select
                    fullWidth
                    value={inj.name}
                    onChange={e => {
                      const updatedInjections = [...injections];
                      updatedInjections[index].name = e.target.value;
                      setInjections(updatedInjections);
                    }}
                  >
                    {injectionOptions.map(option => (
                      <MenuItem key={option.uuid} value={option.name}>
                        {option.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    fullWidth
                    value={inj.interval}
                    onChange={e => {
                      const updatedInjections = [...injections];
                      updatedInjections[index].interval = e.target.value;
                      setInjections(updatedInjections);
                    }}
                  />
                </Grid>
                <Grid item xs={2}>
                  <IconButton
                    onClick={() => handleRemoveInjection(inj.id)}
                    color="error"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
            ))}
          </Box>

          {/* Save and Close Buttons */}
          <Box mt={2} display="flex" justifyContent="center" gap={8}>
            <Button
              variant="contained"
              color="primary"
              sx={{
                textTransform: 'none',
                backgroundColor: '#005f73',
                padding: '6px 55px',
                borderRadius: '12px',
                '&:hover': { backgroundColor: '#007f91' }
              }}
              onClick={handleAddEvent}
            >
              Save
            </Button>

            <Button
              variant="contained"
              sx={{
                textTransform: 'none',
                backgroundColor: '#e0e0e0',
                borderRadius: '12px',
                color: '#000',
                padding: '6px 55px',
                border: '1px solid #d6d6d6'
              }}
              onClick={onClose}
            >
              Close
            </Button>
          </Box>
        </Box>
      </Modal>

      {/* New Injection Modal */}
      <NewInjectionModal
        open={newModalOpen}
        onClose={() => {
          setNewModalOpen(false);
          setIsHidden(false); // Show the main modal again
        }}
        addInjection={addInjection}
      />
    </>
  );
};

const NewInjectionModal = ({ open, onClose, addInjection }) => {
  const [newInjectionName, setNewInjectionName] = useState('');
 const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success'

  });
  const handleSaveInjection = async () => {
    if (!newInjectionName.trim()) {
      setSnackbar({
        open: true,
        message: 'Injection name cannot be empty!',
        type: 'error'
      });
      return;
    }
    

    // Prepare data
    const data = { name: newInjectionName.trim() };

    try {
      console.log('Adding New Injection:', data);
      await addInjection(data);
      
      setSnackbar({
        open: true,
        message: 'New injection added successfully!',
        type: 'success'
      });


      // Reset state and close modal
    
         setTimeout(() => {
      setNewInjectionName('');
      onClose();
    }, 1000);
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to add new injection!',
        type: 'error'
      });
      console.error('Error adding injection:', error);
    }
  };

  return (
    <>
    <Modal open={open} onClose={onClose}>
      <Box
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
       
          bgcolor: 'white',
          boxShadow: 24,
          borderRadius: '12px',
          width: { xs: '85vw', md: '40vw' },
          p: 4
        }}
      >
        <Typography variant="h6" fontWeight="bold" mb={2}>
          New Injection
        </Typography>
        <TextField
          fullWidth
          label="Enter New Injection Here"
          value={newInjectionName}
          onChange={e => setNewInjectionName(e.target.value)}
        />

        <Box mt={2} display="flex" justifyContent="center" gap={2}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#005f73',
              borderRadius: '8px',
              padding: '6px 35px'
            }}
            onClick={handleSaveInjection}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{
              textTransform: 'none',
              backgroundColor: '#e0e0e0',
              borderRadius: '8px',
              color: '#000',
              padding: '6px 35px',
              border: '1px solid #d6d6d6'
            }}
            onClick={onClose}
          >
            Close
          </Button>
        </Box>
        <Snackbar
  open={snackbar.open}
  autoHideDuration={800}
  onClose={() => setSnackbar({ ...snackbar, open: false })}
  anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
>
  <Alert
    onClose={() => setSnackbar({ ...snackbar, open: false })}
    severity={snackbar.type}
    sx={{
      backgroundColor: 'white',
   
      color:'black',
      border:'!px solid black',
      fontWeight: 'bold',
      boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
      width: '100%'
    }}
  >
    {snackbar.message}
  </Alert>
</Snackbar>

      </Box>
       
    
    </Modal>

     
      </>
  );
};

export default ProtocolRegistrationModal;










