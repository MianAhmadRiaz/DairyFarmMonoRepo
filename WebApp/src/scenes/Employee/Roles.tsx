import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Container,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  IconButton
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  DesignationService,
  Designation
} from '../../shared/services/EmployeeAPI/designation.service';

export default function RolesScreen() {
  const [designations, setDesignations] = useState<Designation[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const loadDesignations = async () => {
    setLoading(true);
    try {
      const data = await DesignationService.getDesignations();
      setDesignations(data);
    } catch (error) {
      console.error('Failed to load designations', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDesignations();
  }, []);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setSaving(true);
    try {
      await DesignationService.addDesignation({
        name: name.trim(),
        description: description.trim() || undefined
      });
      setOpen(false);
      setName('');
      setDescription('');
      await loadDesignations();
    } catch (error) {
      console.error('Failed to create designation', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await DesignationService.deleteDesignation(id);
      await loadDesignations();
    } catch (error) {
      console.error('Failed to delete designation', error);
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: '#f2f8f7',
        minHeight: '100vh',
        py: 4,
        marginLeft: '200px'
      }}
    >
      <Container maxWidth="md">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">
            <strong>Roles / Designations</strong>{' '}
            <span style={{ color: '#888' }}>({designations.length} Total)</span>
          </Typography>
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            sx={{ borderRadius: '8px', backgroundColor: '#045D56' }}
          >
            New Role
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'lightgrey' }}>
                <TableCell>
                  <strong>DATE</strong>
                </TableCell>
                <TableCell>
                  <strong>ROLE TITLE</strong>
                </TableCell>
                <TableCell>
                  <strong>DESCRIPTION</strong>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : designations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No roles found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                designations.map((role) => (
                  <TableRow key={role.uuid}>
                    <TableCell>
                      {role.createdAt
                        ? new Date(role.createdAt).toLocaleDateString()
                        : '-'}
                    </TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {role.name}
                    </TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(role.uuid)}
                      >
                        <DeleteOutlineIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>New Role / Designation</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Role Title"
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label="Description"
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving || !name.trim()}
            sx={{ backgroundColor: '#045D56' }}
          >
            {saving ? 'Saving...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
