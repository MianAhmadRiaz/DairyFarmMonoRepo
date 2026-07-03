import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Chip,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import { fetchTreatments, fetchActiveWithdrawals, deleteTreatment, TreatmentRow } from "../../../shared/services/treatment.services";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageContainer from "../../../shared/components/Layout/PageContainer";

const Treatments: React.FC = () => {
  const [treatments, setTreatments] = useState<TreatmentRow[]>([]);
  const [withdrawals, setWithdrawals] = useState<TreatmentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const [list, active] = await Promise.all([
        fetchTreatments({ page: 1, limit: 100 }),
        fetchActiveWithdrawals(),
      ]);
      setTreatments(list.treatments);
      setWithdrawals(active);
    } catch (error) {
      console.error("Treatments => load error:", error);
      toast.error("Failed to load treatments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (uuid: string) => {
    try {
      await deleteTreatment(uuid);
      toast.success("Treatment deleted");
      load();
    } catch (error) {
      console.error("Treatments => delete error:", error);
      toast.error("Failed to delete treatment.");
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const underMilkWithdrawal = (t: TreatmentRow) =>
    t.milkWithdrawalUntil && t.milkWithdrawalUntil >= today;

  return (
    <PageContainer
      title="Treatments & Vaccinations"
      maxWidth={1100}
      actions={
        <Button
          variant="contained"
          onClick={() => navigate("/treatments/new")}
          sx={{ bgcolor: "#005f73", "&:hover": { bgcolor: "#004954" }, borderRadius: "8px" }}
        >
          Add Treatment
        </Button>
      }
    >
      {withdrawals.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{withdrawals.length} animal(s) under active withdrawal</strong> — milk/meat from these
          animals must not be sold:{" "}
          {withdrawals
            .map((w) => `${w.animal?.tagName || w.animalId}${w.milkWithdrawalUntil ? ` (milk until ${w.milkWithdrawalUntil})` : ""}`)
            .join(", ")}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#0F7C8F" }} />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: "12px" }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Animal</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Diagnosis</TableCell>
                <TableCell>Medicine</TableCell>
                <TableCell>Vet</TableCell>
                <TableCell>Cost</TableCell>
                <TableCell>Milk Withdrawal</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    No treatments recorded yet.
                  </TableCell>
                </TableRow>
              ) : (
                treatments.map((t) => (
                  <TableRow key={t.uuid} hover>
                    <TableCell>{t.date}</TableCell>
                    <TableCell>{t.animal?.tagName || t.animal?.name || "—"}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{t.treatmentType}</TableCell>
                    <TableCell>{t.diagnosis || "—"}</TableCell>
                    <TableCell>{t.medicineName || "—"}</TableCell>
                    <TableCell>{t.vetName || "—"}</TableCell>
                    <TableCell>{t.cost ?? "—"}</TableCell>
                    <TableCell>
                      {t.milkWithdrawalUntil ? (
                        <Chip
                          size="small"
                          label={underMilkWithdrawal(t) ? `Until ${t.milkWithdrawalUntil}` : "Cleared"}
                          color={underMilkWithdrawal(t) ? "error" : "success"}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => handleDelete(t.uuid)}>
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default Treatments;
