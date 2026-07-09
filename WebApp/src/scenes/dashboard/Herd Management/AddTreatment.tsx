import React, { useMemo, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  useTheme,
} from "@mui/material";
import { AnimalInfoRow, fetchAnimals } from "../../../shared/services/herdinfo.services";
import { fetchStockItems } from "../../../shared/services/stock.services";
import { addTreatment } from "../../../shared/services/treatment.services";
import { ToastContainer, toast, Id } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageContainer from "../../../shared/components/Layout/PageContainer";

const AddTreatment: React.FC = () => {
  const { t } = useTranslation();
  const TREATMENT_TYPES = useMemo(
    () => [
      { value: "treatment", label: t("herd.addTreatment.typeTreatment") },
      { value: "vaccination", label: t("herd.addTreatment.typeVaccination") },
      { value: "deworming", label: t("herd.addTreatment.typeDeworming") },
      { value: "hoof trimming", label: t("herd.addTreatment.typeHoofTrimming") },
      { value: "vet visit", label: t("herd.addTreatment.typeVetVisit") },
      { value: "other", label: t("herd.addTreatment.typeOther") },
    ],
    [t]
  );
  const [animals, setAnimals] = useState<AnimalInfoRow[]>([]);
  const [medicines, setMedicines] = useState<{ uuid: string; name: string }[]>([]);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Form fields
  const [animalId, setAnimalId] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [treatmentType, setTreatmentType] = useState("treatment");
  const [diagnosis, setDiagnosis] = useState("");
  const [medicineStockItemId, setMedicineStockItemId] = useState("");
  const [medicineName, setMedicineName] = useState("");
  const [quantityUsed, setQuantityUsed] = useState("");
  const [dosage, setDosage] = useState("");
  const [vetName, setVetName] = useState("");
  const [cost, setCost] = useState("");
  const [milkWithdrawalDays, setMilkWithdrawalDays] = useState("0");
  const [meatWithdrawalDays, setMeatWithdrawalDays] = useState("0");
  const [markSick, setMarkSick] = useState(false);
  const [comments, setComments] = useState("");

  const toastId = useRef<Id | null>(null);
  const theme = useTheme();

  const loadAnimals = async () => {
    try {
      setDropdownLoading(true);
      const data = await fetchAnimals(true);
      setAnimals(data);
    } catch (error) {
      console.error("Error fetching animals:", error);
      toast.error(t("herd.addTreatment.loadAnimalsError"));
    } finally {
      setDropdownLoading(false);
    }
  };

  const loadMedicines = async () => {
    try {
      const res = await fetchStockItems(1, 100);
      const items = (res.data as any)?.items || (res.data as any)?.stockItems || [];
      setMedicines(items.map((i: any) => ({ uuid: i.uuid, name: i.name })));
    } catch (error) {
      console.error("Error fetching stock items:", error);
    }
  };

  const handleSave = async () => {
    if (!animalId || !date || !treatmentType) {
      if (toastId.current === null || !toast.isActive(toastId.current)) {
        toastId.current = toast.warning(t("herd.addTreatment.warnRequired"));
      }
      return;
    }
    if (medicineStockItemId && !(Number(quantityUsed) > 0)) {
      if (toastId.current === null || !toast.isActive(toastId.current)) {
        toastId.current = toast.warning(t("herd.addTreatment.warnQuantity"));
      }
      return;
    }

    setIsLoading(true);
    try {
      await addTreatment({
        animalId,
        date,
        treatmentType,
        ...(diagnosis ? { diagnosis } : {}),
        ...(medicineStockItemId ? { medicineStockItemId, quantityUsed: Number(quantityUsed) } : {}),
        ...(medicineName ? { medicineName } : {}),
        ...(dosage ? { dosage } : {}),
        ...(vetName ? { vetName } : {}),
        ...(cost ? { cost: Number(cost) } : {}),
        milkWithdrawalDays: Number(milkWithdrawalDays) || 0,
        meatWithdrawalDays: Number(meatWithdrawalDays) || 0,
        markSick,
        ...(comments ? { comments } : {}),
      });
      toast.success(t("herd.addTreatment.recorded"));
      // Reset
      setAnimalId("");
      setDiagnosis("");
      setMedicineStockItemId("");
      setMedicineName("");
      setQuantityUsed("");
      setDosage("");
      setVetName("");
      setCost("");
      setMilkWithdrawalDays("0");
      setMeatWithdrawalDays("0");
      setMarkSick(false);
      setComments("");
    } catch (error: any) {
      console.error("AddTreatment => error:", error?.response?.data || error);
      if (toastId.current === null || !toast.isActive(toastId.current)) {
        toastId.current = toast.error(error?.response?.data?.message || t("herd.addTreatment.recordError"));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageContainer title={t("herd.addTreatment.title")} maxWidth={900}>
      <Box
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderRadius: "12px",
          p: { xs: 2, sm: 4, md: "20px" },
          boxShadow:
            theme.palette.mode === "dark"
              ? "0 4px 12px rgba(0,0,0,0.3)"
              : "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label={t("herd.addTreatment.animal")}
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              disabled={isLoading}
              SelectProps={{ onOpen: loadAnimals }}
            >
              {dropdownLoading ? (
                <MenuItem disabled>
                  <CircularProgress size={20} sx={{ color: "#0F7C8F", mx: "auto" }} />
                </MenuItem>
              ) : (
                animals.map((a) => (
                  <MenuItem key={a.uuid} value={a.uuid}>
                    {`${a.name || t("herd.addTreatment.unnamed")} (${a.tagName || t("herd.addTreatment.noTag")})`}
                  </MenuItem>
                ))
              )}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="date"
              label={t("herd.addTreatment.date")}
              InputLabelProps={{ shrink: true }}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLoading}
              inputProps={{ max: new Date().toISOString().split("T")[0] }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label={t("herd.addTreatment.treatmentType")}
              value={treatmentType}
              onChange={(e) => setTreatmentType(e.target.value)}
              disabled={isLoading}
            >
              {TREATMENT_TYPES.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("herd.addTreatment.diagnosis")}
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label={t("herd.addTreatment.vetName")}
              value={vetName}
              onChange={(e) => setVetName(e.target.value)}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label={t("herd.addTreatment.medicineFromStock")}
              value={medicineStockItemId}
              onChange={(e) => setMedicineStockItemId(e.target.value)}
              disabled={isLoading}
              SelectProps={{ onOpen: loadMedicines }}
            >
              <MenuItem value="">{t("herd.addTreatment.none")}</MenuItem>
              {medicines.map((m) => (
                <MenuItem key={m.uuid} value={m.uuid}>
                  {m.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={t("herd.addTreatment.quantityUsed")}
              value={quantityUsed}
              onChange={(e) => setQuantityUsed(e.target.value)}
              disabled={isLoading || !medicineStockItemId}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addTreatment.medicineName")}
              value={medicineName}
              onChange={(e) => setMedicineName(e.target.value)}
              disabled={isLoading}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label={t("herd.addTreatment.dosage")}
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              disabled={isLoading}
              placeholder={t("herd.addTreatment.dosagePlaceholder")}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              type="number"
              label={t("herd.addTreatment.cost")}
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              disabled={isLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControlLabel
              control={
                <Checkbox checked={markSick} onChange={(e) => setMarkSick(e.target.checked)} disabled={isLoading} />
              }
              label={t("herd.addTreatment.markSick")}
              sx={{ mt: 1 }}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label={t("herd.addTreatment.milkWithdrawalDays")}
              value={milkWithdrawalDays}
              onChange={(e) => setMilkWithdrawalDays(e.target.value)}
              disabled={isLoading}
              inputProps={{ min: 0 }}
              helperText={t("herd.addTreatment.milkWithdrawalHelper")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label={t("herd.addTreatment.meatWithdrawalDays")}
              value={meatWithdrawalDays}
              onChange={(e) => setMeatWithdrawalDays(e.target.value)}
              disabled={isLoading}
              inputProps={{ min: 0 }}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label={t("herd.addTreatment.comments")}
              multiline
              rows={3}
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              disabled={isLoading}
              inputProps={{ maxLength: 500 }}
            />
          </Grid>
        </Grid>
        <Box sx={{ mt: 4, display: "flex", gap: 2 }}>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={isLoading}
            sx={{
              bgcolor: "#005f73",
              "&:hover": { bgcolor: "#004954" },
              px: 4,
              borderRadius: "8px",
              padding: "8px 50px",
            }}
          >
            {isLoading ? <CircularProgress size={24} sx={{ color: "#0F7C8F" }} /> : t("common.save")}
          </Button>
        </Box>
      </Box>
      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default AddTreatment;
