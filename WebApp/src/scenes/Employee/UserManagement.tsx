import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Tooltip
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Role,
  FarmUser,
  getRoles,
  getFarmUsers,
  createFarmUser,
  updateUserRole,
  deleteFarmUser,
  CreateFarmUserPayload
} from '../../shared/services/rbac.service';
import { usePermissions } from '../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../shared/rbac/permissions';

const PRIMARY = '#045D56';

const emptyForm: CreateFarmUserPayload = {
  email: '',
  password: '',
  confirmpassword: '',
  firstname: '',
  lastname: '',
  phoneNumber: '',
  roleId: ''
};

export default function UserManagement() {
  const { t } = useTranslation();
  const { can } = usePermissions();
  const canManage = can(PERMISSIONS.USER_MANAGE);
  const canView = can([PERMISSIONS.USER_VIEW, PERMISSIONS.USER_MANAGE]);

  const [users, setUsers] = useState<FarmUser[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<CreateFarmUserPayload>(emptyForm);

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([getFarmUsers(), getRoles()]);
      setUsers(u);
      setRoles(r);
    } catch (e) {
      console.error('Failed to load users/roles', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (canView) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canView]);

  const handleReassign = async (user: FarmUser, roleId: string) => {
    if (!roleId || roleId === user.roleId) return;
    try {
      await updateUserRole(user.uuid, roleId);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || t('employee.userManagement.updateRoleFailed'));
    }
  };

  const handleCreate = async () => {
    if (!form.email.trim() || !form.password || !form.roleId) {
      setError(t('employee.userManagement.requiredFields'));
      return;
    }
    if (form.password !== form.confirmpassword) {
      setError(t('employee.userManagement.passwordMismatch'));
      return;
    }
    setSaving(true);
    setError('');
    try {
      await createFarmUser(form);
      setOpen(false);
      setForm(emptyForm);
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.message || t('employee.userManagement.createFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (user: FarmUser) => {
    if (!window.confirm(t('employee.userManagement.deleteConfirm', { email: user.email }))) return;
    try {
      await deleteFarmUser(user.uuid);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || t('employee.userManagement.deleteFailed'));
    }
  };

  if (!canView) {
    return (
      <Box sx={{ minHeight: '100vh', py: 6, marginLeft: '200px' }}>
        <Container maxWidth="sm">
          <Alert severity="warning">
            {t('employee.userManagement.noPermissionView')}
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
      <Container maxWidth="lg">
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h6">
            <strong>{t('employee.userManagement.title')}</strong>{' '}
            <span style={{ color: '#888' }}>{t('employee.common.totalCount', { count: users.length })}</span>
          </Typography>
          {canManage && (
            <Button
              variant="contained"
              onClick={() => {
                setForm(emptyForm);
                setError('');
                setOpen(true);
              }}
              sx={{ borderRadius: '8px', backgroundColor: PRIMARY }}
            >
              {t('employee.userManagement.addUser')}
            </Button>
          )}
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'lightgrey' }}>
                <TableCell>
                  <strong>{t('employee.common.nameUpper')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('employee.userManagement.emailUpper')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('employee.userManagement.phoneUpper')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('employee.userManagement.roleUpper')}</strong>
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
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center">
                    {t('employee.userManagement.noUsers')}
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.uuid}>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {`${user.firstname || ''} ${user.lastname || ''}`.trim() ||
                        '-'}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.phoneNumber || '-'}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 160 }}>
                        <Select
                          value={user.role?.uuid || user.roleId || ''}
                          displayEmpty
                          disabled={!canManage}
                          onChange={(e) =>
                            handleReassign(user, e.target.value as string)
                          }
                        >
                          <MenuItem value="" disabled>
                            <em>{t('employee.userManagement.unassigned')}</em>
                          </MenuItem>
                          {roles.map((role) => (
                            <MenuItem
                              key={role.uuid}
                              value={role.uuid}
                              sx={{ textTransform: 'capitalize' }}
                            >
                              {role.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={canManage ? t('employee.userManagement.deleteUser') : t('employee.common.noPermission')}
                      >
                        <span>
                          <IconButton
                            color="error"
                            disabled={!canManage}
                            onClick={() => handleDelete(user)}
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

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>{t('employee.userManagement.addUser')}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <Box display="flex" gap={1}>
            <TextField
              margin="dense"
              label={t('employee.userManagement.firstName')}
              fullWidth
              value={form.firstname}
              onChange={(e) => setForm({ ...form, firstname: e.target.value })}
            />
            <TextField
              margin="dense"
              label={t('employee.userManagement.lastName')}
              fullWidth
              value={form.lastname}
              onChange={(e) => setForm({ ...form, lastname: e.target.value })}
            />
          </Box>
          <TextField
            margin="dense"
            label={t('employee.userManagement.email')}
            type="email"
            fullWidth
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <TextField
            margin="dense"
            label={t('employee.userManagement.phoneNumber')}
            fullWidth
            value={form.phoneNumber}
            onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
          />
          <Box display="flex" gap={1}>
            <TextField
              margin="dense"
              label={t('employee.userManagement.password')}
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <TextField
              margin="dense"
              label={t('employee.userManagement.confirmPassword')}
              type="password"
              fullWidth
              value={form.confirmpassword}
              onChange={(e) =>
                setForm({ ...form, confirmpassword: e.target.value })
              }
            />
          </Box>
          <FormControl fullWidth margin="dense">
            <InputLabel id="user-role-label">{t('employee.userManagement.role')}</InputLabel>
            <Select
              labelId="user-role-label"
              label={t('employee.userManagement.role')}
              value={form.roleId}
              onChange={(e) =>
                setForm({ ...form, roleId: e.target.value as string })
              }
            >
              {roles.map((role) => (
                <MenuItem
                  key={role.uuid}
                  value={role.uuid}
                  sx={{ textTransform: 'capitalize' }}
                >
                  {role.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>{t('employee.common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleCreate}
            disabled={saving}
            sx={{ backgroundColor: PRIMARY }}
          >
            {saving ? t('employee.common.saving') : t('employee.common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
