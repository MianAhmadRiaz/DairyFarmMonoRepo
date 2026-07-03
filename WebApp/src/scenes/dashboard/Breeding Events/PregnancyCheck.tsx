import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  TextField,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Checkbox,
  Pagination,
  FormControl,
  InputLabel,
  Chip,
  CircularProgress
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { useNavigate } from 'react-router-dom';
import { fetchPregnanacyTests } from '../../../shared/services/breeds.services';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import PageContainer from '../../../shared/components/Layout/PageContainer';


type PregnancyStatus = 'POSITIVE' | 'NEGATIVE';

interface PregnancyTestRow {
  srNo: string;
  pregnancyTestDate: string;
  tagId: string;
  tagName: string;
  aiBbDate: string;
  type: string; // e.g. "AI" or "BB"
  status: PregnancyStatus;
  price: number;
  selected?: boolean; // for checkbox selection
}

const PregnancyTest: React.FC = () => {
  const navigate = useNavigate();

  // ----------------------------
  // State
  // ----------------------------
  const [rows, setRows] = useState<PregnancyTestRow[]>([]);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [loading, setLoading] = useState(true);
  const { isMobile } = useLayoutShift();

  // ----------------------------
  // Derived
  // ----------------------------
  const filteredRows = rows.filter((row) =>
    Object.values(row)
      .join(' ')
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const sortedRows = [...filteredRows].sort((a, b) => {
    switch (sort) {
      case 'srNo':
        return Number(a.srNo) - Number(b.srNo);
      case 'date':
        return a.pregnancyTestDate.localeCompare(b.pregnancyTestDate);
      case 'tagId':
        return a.tagId.localeCompare(b.tagId);
      default:
        return 0;
    }
  });

  const totalPages = Math.ceil(sortedRows.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = sortedRows.slice(indexOfFirstRow, indexOfLastRow);

  // ----------------------------
  // Data Fetching with Loader
  // ----------------------------
  useEffect(() => {
    const loadPregnancyTests = async () => {
      setLoading(true);
      try {
        const pregnancyData = await fetchPregnanacyTests();
        // Map DropdownObject[] to PregnancyTestRow[]
        const mappedRows: PregnancyTestRow[] = pregnancyData.map((item: any, idx: number) => ({
          srNo: String(idx + 1),
          pregnancyTestDate: item.pregnancyTestDate || '',
          tagId: item.tagId || '',
          tagName: item.tagName || '',
          aiBbDate: item.aiBbDate || '',
          type: item.type || '',
          status: item.status || 'NEGATIVE',
          price: item.price ?? 0,
          selected: false
        }));
        setRows(mappedRows);
      } catch (error) {
        console.error('Failed to load pregnancy data:', error);
      }
      setLoading(false);
    };
  
    loadPregnancyTests();
  }, []);
  

  // ----------------------------
  // Handlers
  // ----------------------------
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    setCurrentPage(page);
  };

  const handleRowsPerPageChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newVal = Number(event.target.value);
    setRowsPerPage(newVal);
    setCurrentPage(1);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setCurrentPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<{ value: unknown }>) => {
    setSort(e.target.value as string);
  };

  const handleSelectAll = (checked: boolean) => {
    const updated = rows.map((row) => {
      if (currentRows.includes(row)) {
        return { ...row, selected: checked };
      }
      return row;
    });
    setRows(updated);
  };

  const handleSelectRow = (originalIndex: number, checked: boolean) => {
    const updated = [...rows];
    updated[originalIndex] = { ...updated[originalIndex], selected: checked };
    setRows(updated);
  };

  const handleAddNew = () => {
    navigate('/pregnancy-test/new');
  };

  const handleBack = () => {
    navigate(-1);
  };

  // ----------------------------
  // Render
  // ----------------------------
  return (
    <PageContainer title="Pregnancy Test">
      {/* Back Button */}
      <Button
        variant="text"
        startIcon={<ArrowBackIcon />}
        onClick={handleBack}
        sx={{
          color: "#005f73",
          textTransform: "none",
          fontWeight: "bold",
          mb: 2,
        }}
      >
        Back
      </Button>

      {/* Header (Add New button) */}
      <Box sx={{ display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
        <Button
          variant="contained"
          sx={{
            backgroundColor: "#005f73",
            textTransform: "none",
            borderRadius: "8px",
            "&:hover": { backgroundColor: "#007f91" },
          }}
          onClick={handleAddNew}
        >
          Add New
        </Button>
      </Box>

      {/* Recent Entries Card */}
      <Box
        sx={{
          mt: 2,
          minHeight: 200,
          backgroundColor: "#FFFFFF",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Box sx={{ p: { xs: 2, sm: 3, md: 3 } }}>
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: "bold" }}>
            Recent Entries ({rows.length})
          </Typography>

          {/* Loader */}
          {loading ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
              }}
            >
              <CircularProgress size={isMobile ? 30 : 50} sx={{ color: "#0F7C8F" }} />
            </Box>
          ) : (
            <>
              {/* Search & Sort */}
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <TextField
                  variant="outlined"
                  fullWidth
                  placeholder="Search"
                  value={search}
                  onChange={handleSearchChange}
                />
                <FormControl sx={{ width: "150px" }}>
                  <InputLabel>Sort</InputLabel>
                  <Select label="Sort" value={sort} onChange={handleSortChange}>
                    <MenuItem value="">None</MenuItem>
                    <MenuItem value="srNo">By SR #</MenuItem>
                    <MenuItem value="date">By Date</MenuItem>
                    <MenuItem value="tagId">By Tag ID</MenuItem>
                  </Select>
                </FormControl>
              </Box>

              {/* Table */}
              <Box sx={{mx:{xs:0,md:-3}}}>
              <TableContainer
                component={Paper}
                sx={{
                  maxHeight: 500,
                  borderRadius: "12px",
                  boxShadow: "none",
                  width: "100%",
                }}
              >
                <Table stickyHeader sx={{ width: "100%" }}>
                  <TableHead >
                    <TableRow >
                      <TableCell padding="checkbox" sx={{ backgroundColor: "#F8F9FA" }}>
                        <Checkbox
                          indeterminate={
                            currentRows.some((r) => r.selected) &&
                            currentRows.some((r) => !r.selected)
                          }
                          checked={
                            currentRows.length > 0 &&
                            currentRows.every((r) => r.selected)
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold",backgroundColor: "#F8F9FA" }}>SR #</TableCell>
                      <TableCell sx={{ fontWeight: "bold",backgroundColor: "#F8F9FA" }}>PREGNANCY TEST DATE</TableCell>
                      <TableCell sx={{ fontWeight: "bold",backgroundColor: "#F8F9FA" }}>TAG ID</TableCell>
                      <TableCell sx={{ fontWeight: "bold",backgroundColor: "#F8F9FA" }}>AI/BB DATE</TableCell>
                      <TableCell sx={{ fontWeight: "bold",backgroundColor: "#F8F9FA"}}>TYPE</TableCell>
                      <TableCell sx={{ fontWeight: "bold" ,backgroundColor: "#F8F9FA"}}>STATUS</TableCell>
                      <TableCell sx={{ fontWeight: "bold" ,backgroundColor: "#F8F9FA"}}>PRICE</TableCell>
                      <TableCell align="center">
                        <MoreVertIcon sx={{ opacity: 0 }} />
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {currentRows.map((row, idx) => {
                      const originalIndex = rows.indexOf(row);
                      return (
                        <TableRow key={`${row.srNo}-${idx}`}>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={!!row.selected}
                              onChange={(e) =>
                                handleSelectRow(originalIndex, e.target.checked)
                              }
                            />
                          </TableCell>
                          <TableCell>{row.srNo}</TableCell>
                          <TableCell>
                            {new Date(row.pregnancyTestDate).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{row.tagName || row.tagId}</TableCell>
                          <TableCell>{row.aiBbDate}</TableCell>
                          <TableCell>{row.type}</TableCell>
                          <TableCell>
                            <Chip
                              label={row.status}
                              sx={{
                                fontWeight: "bold",
                                backgroundColor:
                                  row.status.toLowerCase() === "positive"
                                    ? "#e8f5e9"
                                    : "#ffebee",
                                color:
                                  row.status.toLowerCase() === "positive"
                                    ? "#2e7d32"
                                    : "#c62828",
                              }}
                            />
                          </TableCell>
                          <TableCell>{row.price}</TableCell>
                          <TableCell align="center">
                            <IconButton>
                              <MoreVertIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}

                    {currentRows.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={9} align="center">
                          No data found.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
              </Box>

              {/* Pagination Controls */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mt: 2,
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="body2">Rows per page:</Typography>
                  <Select size="small" value={rowsPerPage} onChange={handleRowsPerPageChange}>
                    <MenuItem value={5}>5</MenuItem>
                    <MenuItem value={10}>10</MenuItem>
                    <MenuItem value={15}>15</MenuItem>
                  </Select>
                </Box>
                <Pagination
                  count={totalPages}
                  page={currentPage}
                  onChange={handlePageChange}
                  variant="outlined"
                  shape="rounded"
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </PageContainer>
  );
};

export default PregnancyTest;