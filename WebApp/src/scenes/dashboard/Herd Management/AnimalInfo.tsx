import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Menu,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Checkbox,
  Paper,
  CircularProgress,
  useTheme,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { useNavigate } from "react-router-dom";
import CustomPagination from "../../../shared/components/Custom Pagination/CustomPagination";
import PageContainer from '../../../shared/components/Layout/PageContainer';
import useLayoutShift from '../../../shared/components/Hooks/useLayoutShift';
import { useScrollToTopOnMount } from '../../../shared/components/Hooks/useScrollToTop';
import { tokens } from '../../../shared/theme/theme';

import {
  fetchAnimals,
  AnimalInfoRow,
  fetchPenList,
  fetchAnimalTypes,
  fetchBreedTypes,
  DropdownObject,
  getAllTags,
} from "../../../shared/services/herdinfo.services";

const formatDate = (d: string) => {
  if (!d) return "-";
  const date = new Date(d);
  return isNaN(date.getTime())
    ? "Invalid Date"
    : date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
};

const AnimalInfo: React.FC = () => {
  // -------------------------------------------------------------
  // THEME
  // -------------------------------------------------------------
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const navigate = useNavigate();

  // -------------------------------------------------------------
  // STATE
  // -------------------------------------------------------------
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterAnimalType, setFilterAnimalType] = useState("All");
  const [rows, setRows] = useState<AnimalInfoRow[]>([]);
  const [pens, setPens] = useState<DropdownObject[]>([]);
  const [tags, setTags] = useState<DropdownObject[]>([]);
  const [animalTypes, setAnimalTypes] = useState<DropdownObject[]>([]);
  const [breedTypes, setBreedTypes] = useState<DropdownObject[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const open = Boolean(anchorEl);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const { isMobile } = useLayoutShift();

  // Ensure page starts from top when component mounts
  useScrollToTopOnMount();

  // -------------------------------------------------------------
  // DATA FETCH
  // -------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        const [pensData, tagsData, typesData, breedsData, animalsData] = await Promise.all([
          fetchPenList(),
          getAllTags(true),
          fetchAnimalTypes(),
          fetchBreedTypes(),
          fetchAnimals(true),
        ]);
        setPens(pensData);
        setTags(tagsData);
        setAnimalTypes(typesData);
        setBreedTypes(breedsData);
        setRows(animalsData);
        setCurrentPage(1);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  // -------------------------------------------------------------
  // HELPERS
  // -------------------------------------------------------------
  const getName = (arr: DropdownObject[], uuid: string) => arr.find((x) => x.uuid === uuid)?.name || uuid;
  const getPenName = (id: string) => getName(pens, id);
  const getTagName = (id: string) => getName(tags, id);
  const getAnimalTypeName = (id: string) => getName(animalTypes, id);
  const getBreedTypeName = (id: string) => getName(breedTypes, id);

  // -------------------------------------------------------------
  // FILTERING + PAGINATION
  // -------------------------------------------------------------
  const filteredRows = rows.filter((row) => {
    const searchStr = [
      getPenName(row.penId),
      getTagName(row.tagName),
      row.name,
      getAnimalTypeName(row.animalType),
      getBreedTypeName(row.breedType),
      row.purchase_from,
      row.country,
      row.gender,
      row.type,
      formatDate(row.arrivalDate),
      formatDate(row.birthdate),
    ]
      .join(" ")
       .toLowerCase();

    const matchesSearch = searchStr.includes(searchTerm.toLowerCase());
    const matchesType =
      filterAnimalType === "All" || getAnimalTypeName(row.animalType) === filterAnimalType;
    return matchesSearch && matchesType;
  });

  const start = (currentPage - 1) * itemsPerPage;
  const paginatedRows = filteredRows.slice(start, start + itemsPerPage);

  const handleSelect = (row: any) => {
    setSelectedRows((prevSelected) => {
      const isAlreadySelected = prevSelected.some(
        (selected) => selected.tag === row.tag && selected.name === row.name
      );
      if (isAlreadySelected) {
        return prevSelected.filter(
          (selected) =>
            !(selected.tag === row.tag && selected.name === row.name)
        );
      } else {
        return [...prevSelected, row];
      }
    });

    console.dir(selectedRows);
  }; 


  // -------------------------------------------------------------
  // RENDER
  // -------------------------------------------------------------
  return (
    <PageContainer title="Animal Information" maxWidth={1200}>
    <Box
      sx={{
         position:'relative',
      }}
    >
      {/* Loading overlay */}
        {isLoading && (
        <Box
      sx={{
    position: "absolute",
    top: {xs:'240px',md:"210px"}, 
    left: {xs:'45%',md:"45%"}, 
    transform: "translateX(20px)", 
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    height: "calc(100% - 220px)",
    zIndex: 1,
  }}
>
       
          <CircularProgress
  size={isMobile ? 30 : 50} 
  sx={{
    color: "#0F7C8F",
    transform: {
      xs: "translateX(100px)",
      md: "translateX(280px)"
    }

  }}

/> 
        </Box>
      )}

<Box
  sx={{
  
     p: { xs: 2, sm: 3, md: 3 },
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    boxShadow: theme.palette.mode === 'dark' 
      ? '0 4px 12px rgba(0,0,0,0.3)' 
      : '0 4px 12px rgba(0,0,0,0.1)',
  }}
>
      {/* Search + Filter row */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" }, // 🟢 Stack on narrow
          gap: 2,
          mb: 3,
        }}
      >
        <TextField
          fullWidth
          variant="outlined"
          placeholder="Search by name, pen, tag, breed, dates..."
          value={searchTerm}
          disabled={isLoading}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          sx={{
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#f8f8f8',
            "& .MuiInputBase-input::placeholder": { fontSize: "0.875rem", color: theme.palette.mode === 'dark' ? colors.grey[300] : '#666' },
          }}
        />

        <Button
          variant="contained"
          endIcon={<MoreVertIcon />}
          disabled={isLoading}
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            backgroundColor: "#005f73",
            color: "#ffffff",
            textTransform: "none",
            borderRadius: "12px",
            px: 4,
            py: 1.5,
              // width: { xs: '140px', sm: 'auto' },
            alignSelf: { xs: "shrink", sm: "auto" }, // 🟢 full‑width button on mobile
            "&:hover": { backgroundColor: "#007f91" },
          }}
        >
          Filter
        </Button>

        <Menu 
          anchorEl={anchorEl} 
          open={open} 
          onClose={() => setAnchorEl(null)}
          PaperProps={{
            sx: {
              minWidth: 100,
              "& .MuiMenuItem-root": {
                px: 3,
                py: 2,
                minHeight: 48
              }
            }
          }}
        >
          <MenuItem onClick={() => { setFilterAnimalType("All"); setAnchorEl(null); }}>All</MenuItem>
          <MenuItem onClick={() => { setFilterAnimalType("Cattle"); setAnchorEl(null); }}>Cattle</MenuItem>
          <MenuItem onClick={() => { setFilterAnimalType("Buffalo"); setAnchorEl(null); }}>Buffalo</MenuItem>
        </Menu>
      </Box>

      {/* 🟢 Responsive: wrap table in scroll container so columns don’t break */}
      <Box sx={{  mx: {xs:-2,md:-3}, mt:{md:2} ,overflowX: "auto", p: 0  }}>
        <TableContainer component={Paper} sx={{width: '100%', boxShadow: 'none' }}>
          <Table sx={{ width: '100%' }}>
            <TableHead sx={{backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#F8F9FA'}}>
              <TableRow>
                <TableCell />
                <TableCell sx={{ fontWeight: 'bold' }}>Pen Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Tag Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Animal Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Breed Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Purchased From</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Country</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Gender</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Type</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Arrival Date</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Birthdate</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedRows.length === 0 && !isLoading ? (
                <TableRow>
                  <TableCell colSpan={12} align="center">
                    No animals found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedRows.map((row, idx) => (
                  <TableRow
                    key={idx}
                    hover
                    onClick={() => row.uuid && navigate(`/animal/${row.uuid}`)}
                    sx={{ cursor: row.uuid ? 'pointer' : 'default' }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox  onChange={() =>
                        handleSelect({
                          pen: getPenName(row.penId),
                          tag: getTagName(row.tagName),
                          name: row.name,
                          Animaltype: getAnimalTypeName(row.animalType),
                          breed: getBreedTypeName(row.breedType),
                          purchaseFrom: row.purchase_from,
                          country: row.country,
                          gender: row.gender,
                          type: row.type,
                          arrivalDate: formatDate(row.arrivalDate),
                          birthDate: formatDate(row.birthdate),
                        })}
                        checked={selectedRows.some(
                          (selected) =>
                            selected.tag === getTagName(row.tagName) &&
                            selected.name === row.name
                        )}
                       disabled={isLoading} />
                    </TableCell>
                    <TableCell>{getPenName(row.penId)}</TableCell>
                    <TableCell>{getTagName(row.tagName)}</TableCell>
                    <TableCell>{row.name}</TableCell>
                    <TableCell>{getAnimalTypeName(row.animalType)}</TableCell>
                    <TableCell>{getBreedTypeName(row.breedType)}</TableCell>
                    <TableCell>{row.purchase_from}</TableCell>
                    <TableCell>{row.country}</TableCell>
                    <TableCell>{row.gender}</TableCell>
                    <TableCell>{row.type}</TableCell>
                    <TableCell>{formatDate(row.arrivalDate)}</TableCell>
                    <TableCell>{formatDate(row.birthdate)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Pagination */}
      <CustomPagination
        totalItems={filteredRows.length}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={(e, p) => setCurrentPage(p)}
      />
    </Box>
    </Box>
    </PageContainer>
  );
};

export default AnimalInfo;