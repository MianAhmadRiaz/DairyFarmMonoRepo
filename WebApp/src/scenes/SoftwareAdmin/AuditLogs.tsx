import React, { useEffect, useState } from 'react';
import {
  Box,
  CircularProgress,
  Pagination,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography
} from '@mui/material';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuditLog, getAuditLogs } from '../../shared/services/SoftwareAdminAPI/softwareAdmin.service';

const AuditLogs: React.FC = () => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = async (p: number) => {
    setLoading(true);
    try {
      const res = await getAuditLogs(p, 25);
      setLogs(res.logs);
      setTotalPages(res.totalPages || 1);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load(page);
  }, [page]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>
        Admin Audit Log
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={8}>
          <CircularProgress />
        </Box>
      ) : (
        <Paper sx={{ borderRadius: 3 }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>When</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>IP</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>No activity recorded yet.</TableCell>
                </TableRow>
              )}
              {logs.map(log => (
                <TableRow key={log.uuid}>
                  <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                  <TableCell>{log.admin_name || log.adminId}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{log.description}</TableCell>
                  <TableCell>{log.ip_address}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Box display="flex" justifyContent="center" p={2}>
            <Pagination count={totalPages} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
        </Paper>
      )}
      <ToastContainer position="top-right" autoClose={4000} />
    </Box>
  );
};

export default AuditLogs;
