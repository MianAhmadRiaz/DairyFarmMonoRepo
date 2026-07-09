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
import { useTranslation } from "react-i18next";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageContainer from "../../../shared/components/Layout/PageContainer";

const Treatments: React.FC = () => {
  const { t } = useTranslation();
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
      toast.error(t("herd.treatments.loadError"));
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
      toast.success(t("herd.treatments.deleted"));
      load();
    } catch (error) {
      console.error("Treatments => delete error:", error);
      toast.error(t("herd.treatments.deleteError"));
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const underMilkWithdrawal = (row: TreatmentRow) =>
    row.milkWithdrawalUntil && row.milkWithdrawalUntil >= today;

  return (
    <PageContainer
      title={t("herd.treatments.title")}
      maxWidth={1100}
      actions={
        <Button
          variant="contained"
          onClick={() => navigate("/treatments/new")}
          sx={{ bgcolor: "#005f73", "&:hover": { bgcolor: "#004954" }, borderRadius: "8px" }}
        >
          {t("herd.treatments.addTreatment")}
        </Button>
      }
    >
      {withdrawals.length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <strong>{t("herd.treatments.underWithdrawal", { count: withdrawals.length })}</strong> — {t("herd.treatments.mustNotBeSold")}{" "}
          {withdrawals
            .map((w) => `${w.animal?.tagName || w.animalId}${w.milkWithdrawalUntil ? ` ${t("herd.treatments.milkUntil", { date: w.milkWithdrawalUntil })}` : ""}`)
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
                <TableCell>{t("herd.treatments.date")}</TableCell>
                <TableCell>{t("herd.treatments.animal")}</TableCell>
                <TableCell>{t("herd.treatments.type")}</TableCell>
                <TableCell>{t("herd.treatments.diagnosis")}</TableCell>
                <TableCell>{t("herd.treatments.medicine")}</TableCell>
                <TableCell>{t("herd.treatments.vet")}</TableCell>
                <TableCell>{t("herd.treatments.cost")}</TableCell>
                <TableCell>{t("herd.treatments.milkWithdrawal")}</TableCell>
                <TableCell>{t("herd.treatments.actions")}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {treatments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} align="center">
                    {t("herd.treatments.noTreatments")}
                  </TableCell>
                </TableRow>
              ) : (
                treatments.map((row) => (
                  <TableRow key={row.uuid} hover>
                    <TableCell>{row.date}</TableCell>
                    <TableCell>{row.animal?.tagName || row.animal?.name || "—"}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>{row.treatmentType}</TableCell>
                    <TableCell>{row.diagnosis || "—"}</TableCell>
                    <TableCell>{row.medicineName || "—"}</TableCell>
                    <TableCell>{row.vetName || "—"}</TableCell>
                    <TableCell>{row.cost ?? "—"}</TableCell>
                    <TableCell>
                      {row.milkWithdrawalUntil ? (
                        <Chip
                          size="small"
                          label={underMilkWithdrawal(row) ? t("herd.treatments.until", { date: row.milkWithdrawalUntil }) : t("herd.treatments.cleared")}
                          color={underMilkWithdrawal(row) ? "error" : "success"}
                        />
                      ) : (
                        "—"
                      )}
                    </TableCell>
                    <TableCell>
                      <Button size="small" color="error" onClick={() => handleDelete(row.uuid)}>
                        {t("common.delete")}
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
