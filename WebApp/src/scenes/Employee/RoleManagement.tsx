import React, { useEffect, useMemo, useState } from 'react';
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
  IconButton,
  Chip,
  Checkbox,
  FormControlLabel,
  Collapse,
  Divider,
  Tooltip,
  Alert
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import {
  Role,
  PermissionModule,
  getRoles,
  createRole,
  updateRole,
  deleteRole,
  getPermissionCatalog
} from '../../shared/services/rbac.service';
import { usePermissions } from '../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../shared/rbac/permissions';

const PRIMARY = '#045D56';

export default function RoleManagement() {
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.ROLE_MANAGE);

  const [roles, setRoles] = useState<Role[]>([]);
  const [catalog, setCatalog] = useState<PermissionModule[]>([]);
  const [loading, setLoading] = useState(false);

  // dialog state
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const [r, c] = await Promise.all([getRoles(), getPermissionCatalog()]);
      setRoles(r);
      setCatalog(c);
    } catch (e) {
      console.error('Failed to load roles/permissions', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canManage) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canManage]);

  const openCreate = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setSelectedPerms([]);
    setError('');
    setExpandedModules({});
    setOpen(true);
  };

  const openEdit = (role: Role) => {
    if (role.isOwner) return;
    setEditingRole(role);
    setName(role.name);
    setDescription(role.description || '');
    setSelectedPerms(role.permissions || []);
    setError('');
    setExpandedModules({});
    setOpen(true);
  };

  const togglePerm = (permName: string) => {
    setSelectedPerms((prev) =>
      prev.includes(permName)
        ? prev.filter((p) => p !== permName)
        : [...prev, permName]
    );
  };

  const moduleState = (mod: PermissionModule) => {
    const names = mod.permissions.map((p) => p.name);
    const selectedCount = names.filter((n) => selectedPerms.includes(n)).length;
    return {
      all: selectedCount === names.length && names.length > 0,
      some: selectedCount > 0 && selectedCount < names.length
    };
  };

  const toggleModule = (mod: PermissionModule, checked: boolean) => {
    const names = mod.permissions.map((p) => p.name);
    setSelectedPerms((prev) => {
      if (checked) return Array.from(new Set([...prev, ...names]));
      return prev.filter((p) => !names.includes(p));
    });
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Role name is required.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      if (editingRole) {
        await updateRole({
          roleId: editingRole.uuid,
          name: name.trim(),
          description: description.trim(),
          permissions: selectedPerms
        });
      } else {
        await createRole({
          name: name.trim(),
          description: description.trim() || undefined,
          permissions: selectedPerms
        });
      }
      setOpen(false);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to save role.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem || role.isOwner) return;
    if (!window.confirm(`Delete role "${role.name}"?`)) return;
    try {
      await deleteRole(role.uuid);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to delete role.');
    }
  };

  const totalPermsInCatalog = useMemo(
    () => catalog.reduce((acc, m) => acc + m.permissions.length, 0),
    [catalog]
  );

  if (!canManage) {
    return (
      <Box sx={{ minHeight: '100vh', py: 6, marginLeft: '200px' }}>
        <Container maxWidth="sm">
          <Alert severity="warning">
            You don't have permission to manage roles.
          </Alert>
        </Container>
      </Box>
    );
  }

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
            <strong>Role Management</strong>{' '}
            <span style={{ color: '#888' }}>({roles.length} Total)</span>
          </Typography>
          <Button
            variant="contained"
            onClick={openCreate}
            sx={{ borderRadius: '8px', backgroundColor: PRIMARY }}
          >
            Add Role
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'lightgrey' }}>
                <TableCell>
                  <strong>NAME</strong>
                </TableCell>
                <TableCell>
                  <strong>DESCRIPTION</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>PERMISSIONS</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>TYPE</strong>
                </TableCell>
                <TableCell align="right"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : roles.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    No roles found. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                roles.map((role) => (
                  <TableRow key={role.uuid}>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {role.name}
                    </TableCell>
                    <TableCell>{role.description || '-'}</TableCell>
                    <TableCell align="center">
                      {role.isOwner ? 'All' : role.permissions?.length ?? 0}
                    </TableCell>
                    <TableCell align="center">
                      {role.isOwner ? (
                        <Chip label="Owner" color="primary" size="small" />
                      ) : role.isSystem ? (
                        <Chip label="System" color="default" size="small" />
                      ) : (
                        <Chip label="Custom" variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={
                          role.isOwner
                            ? 'Owner role cannot be edited'
                            : 'Edit role'
                        }
                      >
                        <span>
                          <IconButton
                            onClick={() => openEdit(role)}
                            disabled={role.isOwner}
                          >
                            <EditOutlinedIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          role.isSystem || role.isOwner
                            ? 'System/Owner roles cannot be deleted'
                            : 'Delete role'
                        }
                      >
                        <span>
                          <IconButton
                            color="error"
                            onClick={() => handleDelete(role)}
                            disabled={role.isSystem || role.isOwner}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingRole ? 'Edit Role' : 'Add Role'}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label="Role Name"
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

          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            mt={2}
            mb={1}
          >
            <Typography variant="subtitle1" fontWeight="bold">
              Permissions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {selectedPerms.length} / {totalPermsInCatalog} selected
            </Typography>
          </Box>
          <Divider sx={{ mb: 1 }} />

          {catalog.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No permission catalog available.
            </Typography>
          ) : (
            catalog.map((mod) => {
              const state = moduleState(mod);
              const expanded = expandedModules[mod.module] ?? true;
              return (
                <Box
                  key={mod.module}
                  sx={{
                    border: '1px solid #e0e0e0',
                    borderRadius: 2,
                    mb: 1
                  }}
                >
                  <Box
                    display="flex"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ px: 1, py: 0.5, backgroundColor: '#f7f7f7' }}
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={state.all}
                          indeterminate={state.some}
                          onChange={(e) => toggleModule(mod, e.target.checked)}
                        />
                      }
                      label={
                        <Typography
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        >
                          {mod.module}
                        </Typography>
                      }
                    />
                    <IconButton
                      size="small"
                      onClick={() =>
                        setExpandedModules((prev) => ({
                          ...prev,
                          [mod.module]: !expanded
                        }))
                      }
                    >
                      {expanded ? (
                        <KeyboardArrowUpIcon />
                      ) : (
                        <KeyboardArrowDownIcon />
                      )}
                    </IconButton>
                  </Box>
                  <Collapse in={expanded}>
                    <Box
                      sx={{
                        display: 'grid',
                        gridTemplateColumns: {
                          xs: '1fr',
                          sm: '1fr 1fr',
                          md: '1fr 1fr 1fr'
                        },
                        px: 2,
                        py: 1
                      }}
                    >
                      {mod.permissions.map((perm) => (
                        <FormControlLabel
                          key={perm.uuid}
                          control={
                            <Checkbox
                              size="small"
                              checked={selectedPerms.includes(perm.name)}
                              onChange={() => togglePerm(perm.name)}
                            />
                          }
                          label={
                            <Tooltip title={perm.description || perm.name}>
                              <Typography variant="body2">
                                {perm.description || perm.name}
                              </Typography>
                            </Tooltip>
                          }
                        />
                      ))}
                    </Box>
                  </Collapse>
                </Box>
              );
            })
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            sx={{ backgroundColor: PRIMARY }}
          >
            {saving ? 'Saving...' : editingRole ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
