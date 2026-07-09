import React, { useEffect, useMemo, useState } from 'react';
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
  const { t } = useTranslation();
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
      setError(t('employee.roleManagement.roleNameRequired'));
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
      setError(e?.response?.data?.message || t('employee.roleManagement.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (role: Role) => {
    if (role.isSystem || role.isOwner) return;
    if (!window.confirm(t('employee.roleManagement.deleteConfirm', { name: role.name }))) return;
    try {
      await deleteRole(role.uuid);
      await load();
    } catch (e: any) {
      alert(e?.response?.data?.message || t('employee.roleManagement.deleteFailed'));
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
            {t('employee.roleManagement.noPermissionManage')}
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
            <strong>{t('employee.roleManagement.title')}</strong>{' '}
            <span style={{ color: '#888' }}>{t('employee.common.totalCount', { count: roles.length })}</span>
          </Typography>
          <Button
            variant="contained"
            onClick={openCreate}
            sx={{ borderRadius: '8px', backgroundColor: PRIMARY }}
          >
            {t('employee.roleManagement.addRole')}
          </Button>
        </Box>

        <TableContainer component={Paper} sx={{ borderRadius: 3 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: 'lightgrey' }}>
                <TableCell>
                  <strong>{t('employee.common.nameUpper')}</strong>
                </TableCell>
                <TableCell>
                  <strong>{t('employee.common.descriptionUpper')}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('employee.roleManagement.permissionsUpper')}</strong>
                </TableCell>
                <TableCell align="center">
                  <strong>{t('employee.roleManagement.typeUpper')}</strong>
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
                    {t('employee.roleManagement.noRoles')}
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
                      {role.isOwner ? t('employee.roleManagement.all') : role.permissions?.length ?? 0}
                    </TableCell>
                    <TableCell align="center">
                      {role.isOwner ? (
                        <Chip label={t('employee.roleManagement.owner')} color="primary" size="small" />
                      ) : role.isSystem ? (
                        <Chip label={t('employee.roleManagement.system')} color="default" size="small" />
                      ) : (
                        <Chip label={t('employee.roleManagement.custom')} variant="outlined" size="small" />
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <Tooltip
                        title={
                          role.isOwner
                            ? t('employee.roleManagement.ownerCannotEdit')
                            : t('employee.roleManagement.editRole')
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
                            ? t('employee.roleManagement.systemOwnerCannotDelete')
                            : t('employee.roleManagement.deleteRole')
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
        <DialogTitle>{editingRole ? t('employee.roleManagement.editRole') : t('employee.roleManagement.addRole')}</DialogTitle>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          <TextField
            autoFocus
            margin="dense"
            label={t('employee.roleManagement.roleName')}
            fullWidth
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <TextField
            margin="dense"
            label={t('employee.common.description')}
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
              {t('employee.roleManagement.permissions')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('employee.roleManagement.selectedCount', { selected: selectedPerms.length, total: totalPermsInCatalog })}
            </Typography>
          </Box>
          <Divider sx={{ mb: 1 }} />

          {catalog.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {t('employee.roleManagement.noCatalog')}
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
          <Button onClick={() => setOpen(false)}>{t('employee.common.cancel')}</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={saving || !name.trim()}
            sx={{ backgroundColor: PRIMARY }}
          >
            {saving ? t('employee.common.saving') : editingRole ? t('employee.common.update') : t('employee.common.create')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
