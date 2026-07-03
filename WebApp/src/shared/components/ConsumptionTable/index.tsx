import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Checkbox,
  Typography,
  Box,
  TablePagination,
  Paper,
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { tokens } from '../../theme/theme.jsx';

export interface ConsumptionItem {
  id: string;
  name: string;
  quantity: string;
  selected: boolean;
  unit: string;
  totalQty?: string | number;
}

interface ConsumptionTableProps {
  items: ConsumptionItem[];
  totalCount: number;
  page: number;
  rowsPerPage: number;
  loading: boolean;
  error: string | null;
  onPageChange: (event: unknown, newPage: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onQuantityChange: (id: string, value: string) => void;
  onSelectionChange: (id: string) => void;
}

const ConsumptionTable: React.FC<ConsumptionTableProps> = ({
  items,
  totalCount,
  page,
  rowsPerPage,
  loading,
  error,
  onPageChange,
  onRowsPerPageChange,
  onQuantityChange,
  onSelectionChange
}) => {
  console.log('🚀 ~ items:', items);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Paper
      elevation={3}
      sx={{ width: '100%', borderRadius: '8px', overflowX: 'auto' }}
    >
      <TableContainer sx={{ m: 0 }}>
        <Table
          size={isMobile ? 'small' : 'medium'}
          sx={{
            minWidth: 'auto',
            tableLayout: 'fixed'
          }}
        >
          <TableHead>
            <TableRow
              sx={{
                backgroundColor:
                  theme.palette.mode === 'dark'
                    ? colors.primary[400]
                    : '#F8F9FA'
              }}
            >
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderBottom: '2px solid #e0e0e0',
                  py: 1,
                  width: { xs: '20%', sm: 'calc(100% / 3)' },
                  minWidth: { xs: '60px', sm: '120px' }
                }}
              >
                Select
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderBottom: '2px solid #e0e0e0',
                  py: 1,
                  width: { xs: '40%', sm: 'calc(100% / 3)' },
                  minWidth: { xs: '120px', sm: '200px' }
                }}
              >
                Product Name
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderBottom: '2px solid #e0e0e0',
                  py: 1,
                  width: { xs: '40%', sm: 'calc(100% / 3)' },
                  minWidth: { xs: '120px', sm: '200px' }
                }}
              >
                Quantity
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 600,
                  borderBottom: '2px solid #e0e0e0',
                  py: 1,
                  width: { xs: '40%', sm: 'calc(100% / 3)' },
                  minWidth: { xs: '120px', sm: '200px' }
                }}
              >
                Total Quantity
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                  <CircularProgress
                    size={isMobile ? 30 : 50}
                    sx={{ color: '#0F7C8F' }}
                  />
                </TableCell>
              </TableRow>
            ) : items.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} sx={{ textAlign: 'center', py: 1 }}>
                  <Typography color="black">No data available</Typography>
                </TableCell>
              </TableRow>
            ) : (
              items.map(item => (
                <TableRow
                  key={item.id}
                  sx={{
                    '&:hover': {
                      bgcolor:
                        theme.palette.mode === 'dark'
                          ? colors.primary[400]
                          : '#f8f9fa'
                    },
                    '& td': {
                      borderBottom: '1px solid #e0e0e0',
                      py: 0.5
                    }
                  }}
                >
                  <TableCell>
                    <Checkbox
                      checked={item.selected}
                      onChange={() => onSelectionChange(item.id)}
                      sx={{
                        padding: '4px',
                        '&.Mui-checked': { color: '#1976d2' }
                      }}
                    />
                  </TableCell>
                  <TableCell
                    sx={{
                      color: '#2c3e50',
                      fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}
                  >
                    {item.name}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TextField
                        size="small"
                        type="number"
                        value={item.quantity}
                        onChange={e =>
                          onQuantityChange(item.id, e.target.value)
                        }
                        disabled={!item.selected}
                        sx={{
                          width: { xs: '100%', sm: '150px' },
                          mr: 1,
                          '& .MuiOutlinedInput-root': {
                            height: { xs: '32px', sm: '36px' },
                            '&.Mui-disabled': {
                              bgcolor:
                                theme.palette.mode === 'dark'
                                  ? colors.primary[400]
                                  : '#f5f5f5'
                            }
                          }
                        }}
                      />
                    </Box>
                  </TableCell>

                  <TableCell
                    sx={{
                      color: '#2c3e50',
                      fontSize: { xs: '0.875rem', sm: '1rem', ml: 4 }
                    }}
                  >
                    {item?.totalQty}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        sx={{
          '& .MuiTablePagination-toolbar': {
            flexWrap: 'wrap',
            justifyContent: { xs: 'center', sm: 'flex-end' },
            padding: { xs: '8px', sm: '0' }
          },
          '& .MuiTablePagination-spacer': {
            display: { xs: 'none', sm: 'block' }
          }
          // }}
        }}
      />
    </Paper>
  );
};

export default ConsumptionTable;
