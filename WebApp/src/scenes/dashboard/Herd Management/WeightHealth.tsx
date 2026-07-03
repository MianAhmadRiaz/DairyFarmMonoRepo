import React, { useState, useRef } from "react";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { AnimalInfoRow, fetchAnimals } from "../../../shared/services/herdinfo.services";
import { updateAnimalWeight, updateAnimalHealthStatus } from "../../../shared/services/treatment.services";
import { ToastContainer, toast, Id } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageContainer from "../../../shared/components/Layout/PageContainer";

const HEALTH_STATUSES = [
  { value: "milking", label: "Healthy / Milking" },
  { value: "sick", label: "Sick" },
  { value: "culling", label: "Culling" },
];

const WeightHealth: React.FC = () => {
  const [animals, setAnimals] = useState<AnimalInfoRow[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);

  // Weight form
  const [weightAnimalId, setWeightAnimalId] = useState("");
  const [weight, setWeight] = useState("");
  const [weightDate, setWeightDate] = useState(new Date().toISOString().split("T")[0]);
  const [weightLoading, setWeightLoading] = useState(false);

  // Health form
  const [healthAnimalId, setHealthAnimalId] = useState("");
  const [healthStatus, setHealthStatus] = useState("");
  const [healthDate, setHealthDate] = useState(new Date().toISOString().split("T")[0]);
  const [healthLoading, setHealthLoading] = useState(false);

  const toastId = useRef<Id | null>(null);
  const theme = useTheme();

  const loadAnimals = async () => {
    try {
      setDropdownLoading(true);
      const data = await fetchAnimals(true);
      setAnimals(data);
    } catch (error) {
      console.error("Error fetching animals:", error);
      toast.error("Failed to load animals.");
    } finally {
      setDropdownLoading(false);
    }
  };

  const warn = (message: string) => {
    if (toastId.current === null || !toast.isActive(toastId.current)) {
      toastId.current = toast.warning(message);
    }
  };

  const handleSaveWeight = async () => {
    if (!weightAnimalId || !(Number(weight) > 0) || !weightDate) {
      warn("Select an animal and enter a valid weight and date");
      return;
    }
    setWeightLoading(true);
    try {
      await updateAnimalWeight({ animalId: weightAnimalId, weight: Number(weight), date: weightDate });
      toast.success("Weight recorded successfully!");
      setWeightAnimalId("");
      setWeight("");
    } catch (error: any) {
      console.error("WeightHealth => weight error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to record weight.");
    } finally {
      setWeightLoading(false);
    }
  };

  const handleSaveHealth = async () => {
    if (!healthAnimalId || !healthStatus || !healthDate) {
      warn("Select an animal, status and date");
      return;
    }
    setHealthLoading(true);
    try {
      await updateAnimalHealthStatus({ animalId: healthAnimalId, healthStatus, date: healthDate });
      toast.success("Health status updated successfully!");
      setHealthAnimalId("");
      setHealthStatus("");
    } catch (error: any) {
      console.error("WeightHealth => health error:", error?.response?.data || error);
      toast.error(error?.response?.data?.message || "Failed to update health status.");
    } finally {
      setHealthLoading(false);
    }
  };

  const animalSelect = (
    value: string,
    onChange: (v: string) => void,
    disabled: boolean
  ) => (
    <TextField
      fullWidth
      select
      label="Animal"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      SelectProps={{ onOpen: loadAnimals }}
    >
      {dropdownLoading ? (
        <MenuItem disabled>
          <CircularProgress size={20} sx={{ color: "#0F7C8F", mx: "auto" }} />
        </MenuItem>
      ) : (
        animals.map((a) => (
          <MenuItem key={a.uuid} value={a.uuid}>
            {`${a.name || "Unnamed"} (${a.tagName || "No Tag"})`}
          </MenuItem>
        ))
      )}
    </TextField>
  );

  const cardSx = {
    backgroundColor: theme.palette.background.paper,
    borderRadius: "12px",
    p: { xs: 2, sm: 4, md: "20px" },
    mb: 4,
    boxShadow:
      theme.palette.mode === "dark"
        ? "0 4px 12px rgba(0,0,0,0.3)"
        : "0 4px 12px rgba(0,0,0,0.1)",
  };

  return (
    <PageContainer title="Weight & Health Status" maxWidth={900}>
      <Box sx={cardSx}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Record Weight
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {animalSelect(weightAnimalId, setWeightAnimalId, weightLoading)}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label="Weight (kg)"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              disabled={weightLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={weightDate}
              onChange={(e) => setWeightDate(e.target.value)}
              disabled={weightLoading}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          onClick={handleSaveWeight}
          disabled={weightLoading}
          sx={{ mt: 3, bgcolor: "#005f73", "&:hover": { bgcolor: "#004954" }, borderRadius: "8px", px: 5 }}
        >
          {weightLoading ? <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> : "Save Weight"}
        </Button>
      </Box>

      <Box sx={cardSx}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Update Health Status
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            {animalSelect(healthAnimalId, setHealthAnimalId, healthLoading)}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Health Status"
              value={healthStatus}
              onChange={(e) => setHealthStatus(e.target.value)}
              disabled={healthLoading}
            >
              {HEALTH_STATUSES.map((s) => (
                <MenuItem key={s.value} value={s.value}>
                  {s.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label="Date"
              InputLabelProps={{ shrink: true }}
              value={healthDate}
              onChange={(e) => setHealthDate(e.target.value)}
              disabled={healthLoading}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
            />
          </Grid>
        </Grid>
        <Button
          variant="contained"
          onClick={handleSaveHealth}
          disabled={healthLoading}
          sx={{ mt: 3, bgcolor: "#005f73", "&:hover": { bgcolor: "#004954" }, borderRadius: "8px", px: 5 }}
        >
          {healthLoading ? <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> : "Save Status"}
        </Button>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default WeightHealth;
