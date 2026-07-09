import React, { useEffect, useState,useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  useMediaQuery,
  useTheme,
  Tooltip
} from "@mui/material";
import { AnimalInfoRow, fetchAnimals, removeAnimal } from "../../../shared/services/herdinfo.services";
import { usePermissions } from '../../../shared/rbac/usePermissions';
import { PERMISSIONS } from '../../../shared/rbac/permissions';
import { ToastContainer, toast,Id } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PageContainer from '../../../shared/components/Layout/PageContainer';
import { tokens } from '../../../shared/theme/theme';


interface DropdownObject {
  uuid: string;
  name: string;
}

const RemoveAnimal: React.FC = () => {
  const { t } = useTranslation();
  const [animalOptions, setAnimalOptions] = useState<DropdownObject[]>([]);
  const [animals, setAnimals] = useState<AnimalInfoRow[]>([]);
  const [removalCategories] = useState<DropdownObject[]>([
    { uuid: "1", name: "Mortality" },
    { uuid: "2", name: "Sold" },
    { uuid: "3", name: "slaughter" }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  const removalReasons = [
    "Low Production", "Mastitis", "Infertility", "Lameness",
    "Injury", "Disease", "Old Age", "Surplus", "Other",
  ];

  // Form fields
  const [selectedAnimal, setSelectedAnimal] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [salePrice, setSalePrice] = useState("");
  const [comments, setComments] = useState("");
  const navigate = useNavigate();
  
const toastId = useRef<Id | null>(null);
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const { can } = usePermissions();
  const canRemove = can(PERMISSIONS.ANIMAL_REMOVE);
  
  // Load animals on mount and refresh after removal
  const loadAnimals = async () => {
    try {
      setDropdownLoading(true);
      const animals = await fetchAnimals(true);
      
      const options = animals.map(animal => ({
        uuid: animal.uuid,
        name: `${animal.name || t('herd.removeAnimal.unnamed')} (${animal.tag?.name || animal.tagId || t('herd.removeAnimal.noTag')})`
      }));
      
      setAnimalOptions(options);
      setAnimals(animals);
    } catch (error) {
      console.error("Error fetching animals:", error);
      toast.error(t("herd.removeAnimal.loadAnimalsError"), {
        position: "top-right",
        autoClose: 5000,
      });
    } finally {
      setDropdownLoading(false);
    }
  };

const handleRemoveAnimal = async () => {
  const isSold = selectedCategory.toLowerCase() === "sold";
  const isFormValid = selectedAnimal && selectedDate && selectedCategory && comments.trim();

  if (!isFormValid) {
    const warningMessage = t("herd.removeAnimal.warnRequired");
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(warningMessage);
    }
    return;
  }

  if (isSold && !(Number(salePrice) > 0)) {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(t("herd.removeAnimal.warnSalePrice"));
    }
    return;
  }

  const animal = animals.find((a) => a.uuid === selectedAnimal);
  if (!animal) {
    toast.error(t("herd.removeAnimal.noAnimalFound"));
    return;
  }

  try {
   setIsLoading(true);
    toast.dismiss();

    await removeAnimal({
      animalId: animal.uuid,
      date: selectedDate,
      removalCategory: selectedCategory.toLowerCase(),
      comments: comments,
      ...(selectedReason ? { removalReason: selectedReason.toLowerCase() } : {}),
      ...(isSold ? { salePrice: Number(salePrice) } : {}),
    });

    await loadAnimals();
    toast.success(t("herd.removeAnimal.removeSuccess"));

    // Reset fields
    setSelectedAnimal("");
    setSelectedDate("");
    setSelectedCategory("");
    setSelectedReason("");
    setSalePrice("");
    setComments("");

  }catch (error) {
  console.error("RemoveAnimal => error in handleRemoveAnimal =>", error);

  if (toastId.current === null || !toast.isActive(toastId.current)) {
    toastId.current = toast.error(t("herd.removeAnimal.removeError"));
  }
}
    
   finally {
    setIsLoading(false);
  }
};



  const handleCancel = () => {
    setSelectedAnimal("");
    setSelectedDate("");
    setSelectedCategory("");
    setComments("");
  };

  return (
    <PageContainer title={t("herd.removeAnimal.title")} maxWidth={900}>
      <Box sx={{
      backgroundColor: theme.palette.background.paper,
       borderRadius: "12px",
       p: { xs: 2, sm: 4, md: '20px' },
       boxShadow: theme.palette.mode === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)',
    }}>
      <Grid container spacing={3}>
        {/* Animal Selection */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.removeAnimal.animal")}
            value={selectedAnimal}
            onChange={(e) => setSelectedAnimal(e.target.value)}
            variant="outlined"
            disabled={isLoading}
            SelectProps={{
              onOpen: loadAnimals,
              renderValue: (selected) => {
                if (dropdownLoading) return t("herd.removeAnimal.loadingAnimals");
                const selectedOption = animalOptions.find(opt => opt.uuid === selected);
                return selectedOption?.name || t("herd.removeAnimal.selectAnimal");
              }
            }}
          >
            {dropdownLoading ? (
              <MenuItem disabled>
                <Box sx={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
                  <CircularProgress size={24} sx={{color:"#0F7C8F"}}/>
                </Box>
              </MenuItem>
            ) : (
              animalOptions.map((animal) => (
                <MenuItem key={animal.uuid} value={animal.uuid}>
                  {animal.name}
                </MenuItem>
              ))
            )}
          </TextField>
        </Grid>

        {/* Date Selection */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            type="date"
            label={t("herd.removeAnimal.date")}
            InputLabelProps={{ shrink: true }}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            variant="outlined"
            disabled={isLoading}
            inputProps={{
              max: new Date().toISOString().split('T')[0] // Prevent future dates
            }}
          />
        </Grid>

        {/* Removal Category */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.removeAnimal.removalCategory")}
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            variant="outlined"
            disabled={isLoading}
          >
            {removalCategories.map((cat) => (
              <MenuItem key={cat.uuid} value={cat.name}>
                {t("herd.removeAnimal.categories." + cat.name, cat.name)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Removal Reason */}
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            select
            label={t("herd.removeAnimal.removalReason")}
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            variant="outlined"
            disabled={isLoading}
          >
            {removalReasons.map((reason) => (
              <MenuItem key={reason} value={reason}>
                {t("herd.removeAnimal.reasons." + reason, reason)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Sale Price — only relevant when the animal is sold */}
        {selectedCategory.toLowerCase() === "sold" && (
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={t("herd.removeAnimal.salePrice")}
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              variant="outlined"
              disabled={isLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>
        )}

        {/* Comments */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label={t("herd.removeAnimal.comments")}
            multiline
            rows={4}
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            variant="outlined"
            disabled={isLoading}
            inputProps={{ maxLength: 500 }}
          />
        </Grid>
      </Grid>

      {/* Action Buttons */}
      <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
        <Tooltip title={canRemove ? '' : t("herd.removeAnimal.noPermission")}>
          <span>
        <Button
          variant="contained"
          onClick={handleRemoveAnimal}
          disabled={isLoading || !canRemove}
          sx={{
            bgcolor: "#005f73",
            "&:hover": { bgcolor: "#004954" },
            px: 4,
            borderRadius: "8px",
            position: "relative",
            marginTop: "20px",
            padding: "8px 50px",
          }}
        >
          {isLoading ? <CircularProgress size={24} sx={{color:"#0F7C8F"}} /> : t("herd.removeAnimal.remove")}
        </Button>
          </span>
        </Tooltip>
        
         <Button
          variant="contained"
          disabled={isLoading}
          sx={{
            marginTop: "20px",
            padding: "6px 50px",
            marginLeft: "15px",
            color: '#6a757d',
            borderColor: '#d6d6d6',
            textTransform: 'none',
            borderRadius: '8px',
            backgroundColor: theme.palette.mode === 'dark' ? colors.primary[400] : '#CECECE'
          }}
          onClick={() => {
            // Clear all form fields
            setSelectedAnimal("");
            setSelectedDate("");
            setSelectedCategory("");
            setComments("");
          }}
        >
          {t("common.cancel")}
        </Button>
        </Box>
      </Box>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover

      />
    </PageContainer>

  );
};

export default RemoveAnimal;