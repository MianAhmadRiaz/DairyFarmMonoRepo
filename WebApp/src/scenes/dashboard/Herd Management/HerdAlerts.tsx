import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  useTheme,
} from "@mui/material";
import { fetchHerdAlerts, HerdAlerts as HerdAlertsData, HerdAlertAnimal } from "../../../shared/services/treatment.services";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PageContainer from "../../../shared/components/Layout/PageContainer";

interface AlertSectionProps {
  title: string;
  color: "error" | "warning" | "info" | "success";
  hint: string;
  animals: HerdAlertAnimal[];
  extra?: (a: HerdAlertAnimal) => string | undefined;
}

const AlertSection: React.FC<AlertSectionProps> = ({ title, color, hint, animals, extra }) => {
  const theme = useTheme();
  return (
    <Card
      sx={{
        borderRadius: "12px",
        height: "100%",
        boxShadow:
          theme.palette.mode === "dark"
            ? "0 4px 12px rgba(0,0,0,0.3)"
            : "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
          <Typography variant="h6" fontWeight="bold">
            {title}
          </Typography>
          <Chip label={animals.length} color={animals.length > 0 ? color : "default"} size="small" />
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {hint}
        </Typography>
        {animals.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Nothing due.
          </Typography>
        ) : (
          animals.map((a) => (
            <Box
              key={`${title}-${a.uuid}`}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                py: 0.75,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="body2" fontWeight={500}>
                {a.tagName || a.name || a.uuid.slice(0, 8)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {extra?.(a) || ""}
              </Typography>
            </Box>
          ))
        )}
      </CardContent>
    </Card>
  );
};

const HerdAlerts: React.FC = () => {
  const [alerts, setAlerts] = useState<HerdAlertsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchHerdAlerts();
        setAlerts(data);
      } catch (error) {
        console.error("HerdAlerts => load error:", error);
        toast.error("Failed to load herd alerts.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <PageContainer title="Herd Alerts — Action List" maxWidth={1100}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress sx={{ color: "#0F7C8F" }} />
        </Box>
      ) : !alerts ? (
        <Typography>No alert data available.</Typography>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <AlertSection
              title="Pregnancy Check Due"
              color="warning"
              hint="Inseminated 30+ days ago with no pregnancy result yet."
              animals={alerts.pregnancyCheckDue}
              extra={(a) => (a.inseminated_date ? `inseminated ${String(a.inseminated_date).slice(0, 10)}` : "")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AlertSection
              title="Dry-Off Due"
              color="warning"
              hint="Pregnant cows within 60 days of expected calving that are still milking."
              animals={alerts.dryOffDue}
              extra={(a) => (a.dryOffDueDate ? `dry off by ${a.dryOffDueDate}` : "")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AlertSection
              title="Calving Expected"
              color="error"
              hint="Expected to calve within the next 14 days (283-day gestation)."
              animals={alerts.calvingExpected}
              extra={(a) => (a.expectedCalvingDate ? `due ${a.expectedCalvingDate}` : "")}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <AlertSection
              title="Heat Watch"
              color="info"
              hint="Expected return to heat (18–24 day cycle) — observe closely."
              animals={alerts.heatWatch}
              extra={(a) => a.reason}
            />
          </Grid>
          <Grid item xs={12}>
            <AlertSection
              title="Active Milk Withdrawals"
              color="error"
              hint="Milk from these animals must NOT be sold or sent to the tank."
              animals={alerts.activeMilkWithdrawals.map((w: any) => ({
                uuid: w.animal?.uuid || w.animalId,
                tagName: w.animal?.tagName,
                name: w.animal?.name,
                reason: `${w.medicineName || w.treatmentType} — until ${w.milkWithdrawalUntil}`,
              }))}
              extra={(a) => a.reason}
            />
          </Grid>
        </Grid>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </PageContainer>
  );
};

export default HerdAlerts;
