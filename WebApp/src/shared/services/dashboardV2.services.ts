import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';

export async function fetchAnimalProfile(animalId: string): Promise<any> {
  if (!animalId) throw new Error('Missing animalId parameter');
  const res = await api.get(API_CONFIG.animal.profile(animalId));
  return res.data.data;
}

export async function fetchHerdComparison(year?: number): Promise<any> {
  const res = await api.get(API_CONFIG.dashboard.comparison, { params: year ? { year } : {} });
  return res.data.data;
}

export async function fetchFinancialsEstimate(year?: number): Promise<any> {
  const res = await api.get(API_CONFIG.dashboard.financialsEstimate, { params: year ? { year } : {} });
  return res.data.data;
}

export async function fetchReproductionSummary(): Promise<any> {
  const res = await api.get(API_CONFIG.breeding_events.reproductionSummary);
  return res.data.data;
}

export async function fetchTreatmentSummary(year?: number): Promise<any> {
  const res = await api.get(API_CONFIG.treatments.summary, { params: year ? { year } : {} });
  return res.data.data;
}

export async function fetchHerdAlerts(): Promise<any> {
  const res = await api.get(API_CONFIG.breeding_events.alerts);
  return res.data.data;
}

export async function fetchWithdrawals(): Promise<any[]> {
  const res = await api.get(API_CONFIG.treatments.withdrawals);
  return res.data.data || [];
}

export async function fetchAnimalHealthHistory(animalId: string): Promise<any[]> {
  const res = await api.get(API_CONFIG.events.healthStatusHistory, { params: { animalId } });
  return res.data.data?.healthStatusHistory || res.data.data || [];
}

export async function fetchAnimalWeightHistory(animalId: string): Promise<any[]> {
  const res = await api.get(API_CONFIG.events.weightHistory, { params: { animalId } });
  return res.data.data?.weightHistory || res.data.data || [];
}

export async function fetchAnimalTagHistory(animalId: string): Promise<any[]> {
  const res = await api.get(API_CONFIG.events.tagHistory, { params: { animalId } });
  return res.data.data?.tagHistory || res.data.data || [];
}

export async function fetchAnimalPenHistory(animalId: string): Promise<any[]> {
  const res = await api.get(API_CONFIG.events.penHistory, { params: { animalId } });
  return res.data.data?.penHistory || res.data.data || [];
}

export async function fetchAnimalTreatments(animalId: string): Promise<any> {
  const res = await api.get(API_CONFIG.treatments.list, { params: { animalId, limit: 100 } });
  return res.data.data;
}

export async function fetchBreedingEventsByType(type: 'heat' | 'ai' | 'bull' | 'pregnancy' | 'abortion' | 'dryoff' | 'calving', animalId: string): Promise<any> {
  const pathMap: Record<string, string> = {
    heat: API_CONFIG.breeding_events.headDetection,
    ai: API_CONFIG.breeding_events.aiBreeding,
    bull: API_CONFIG.breeding_events.bullBreeding,
    pregnancy: API_CONFIG.breeding_events.pregnancy,
    abortion: API_CONFIG.breeding_events.abortion,
    dryoff: API_CONFIG.breeding_events.dryoff,
    calving: API_CONFIG.breeding_events.calivng,
  };
  const res = await api.get(pathMap[type], { params: { animalId, limit: 100 } });
  return res.data.data;
}
