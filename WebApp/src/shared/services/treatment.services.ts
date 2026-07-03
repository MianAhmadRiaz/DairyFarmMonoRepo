import api from '../api/AxiosClient';

// =======================================
//  Types
// =======================================
export interface TreatmentPayload {
  animalId: string;
  date: string;
  treatmentType: string;
  diagnosis?: string;
  medicineName?: string;
  medicineStockItemId?: string;
  quantityUsed?: number;
  dosage?: string;
  vetName?: string;
  cost?: number;
  milkWithdrawalDays?: number;
  meatWithdrawalDays?: number;
  markSick?: boolean;
  comments?: string;
}

export interface TreatmentRow {
  uuid: string;
  animalId: string;
  date: string;
  treatmentType: string;
  diagnosis?: string;
  medicineName?: string;
  dosage?: string;
  vetName?: string;
  cost?: number;
  milkWithdrawalDays: number;
  meatWithdrawalDays: number;
  milkWithdrawalUntil?: string | null;
  meatWithdrawalUntil?: string | null;
  comments?: string;
  animal?: { uuid: string; tagName?: string; name?: string; animalCategory?: string };
}

export interface HerdAlertAnimal {
  uuid: string;
  tagName?: string;
  name?: string;
  animalCategory?: string;
  inseminated_date?: string;
  expectedCalvingDate?: string;
  dryOffDueDate?: string;
  reason?: string;
}

export interface HerdAlerts {
  pregnancyCheckDue: HerdAlertAnimal[];
  dryOffDue: HerdAlertAnimal[];
  calvingExpected: HerdAlertAnimal[];
  heatWatch: HerdAlertAnimal[];
  activeMilkWithdrawals: TreatmentRow[];
  counts: {
    pregnancyCheckDue: number;
    dryOffDue: number;
    calvingExpected: number;
    heatWatch: number;
    activeMilkWithdrawals: number;
  };
}

// =======================================
//  Treatments
// =======================================
export async function addTreatment(payload: TreatmentPayload) {
  const res = await api.post('/treatments', payload);
  return res.data;
}

export async function fetchTreatments(params?: {
  page?: number;
  limit?: number;
  animalId?: string;
  treatmentType?: string;
}): Promise<{ treatments: TreatmentRow[]; totalCount: number; totalPages: number }> {
  const res = await api.get('/treatments', params || {});
  const data = res.data.data;
  return {
    treatments: data?.treatments || [],
    totalCount: data?.totalCount || 0,
    totalPages: data?.totalPages || 0,
  };
}

export async function fetchActiveWithdrawals(): Promise<TreatmentRow[]> {
  const res = await api.get('/treatments/withdrawals');
  const data = res.data.data;
  return Array.isArray(data) ? data : [];
}

export async function deleteTreatment(treatmentId: string) {
  const res = await api.delete(`/treatments?treatmentId=${treatmentId}`);
  return res.data;
}

// =======================================
//  Herd alerts (breeding calendar)
// =======================================
export async function fetchHerdAlerts(): Promise<HerdAlerts | null> {
  const res = await api.get('/breeding-events/alerts');
  return res.data.data || null;
}

// =======================================
//  Weight & health status events
// =======================================
export async function updateAnimalWeight(payload: { animalId: string; weight: number; date: string }) {
  const res = await api.post('/events/update-weight', payload);
  return res.data;
}

export async function updateAnimalHealthStatus(payload: { animalId: string; healthStatus: string; date: string }) {
  const res = await api.post('/events/update-health-status', payload);
  return res.data;
}

export async function fetchWeightHistory(): Promise<any[]> {
  const res = await api.get('/events/weight-history');
  return res.data.data?.weightHistory || [];
}
