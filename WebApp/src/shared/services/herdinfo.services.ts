import { all } from 'axios';
import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
import { data } from 'react-router-dom';

// =======================================
//  Types
// =======================================
export interface DropdownObject {
  uuid: string;
  name: string;
}

// For “Animal Info” rows (list of animals)
export interface AnimalInfoRow {
  uuid: string; // ✅ Add this line
  penId: string;
  tagId: string;
  name: string;
  animalType: string;
  breedType: string;
  purchase_from: string;
  country: string;
  gender: string;
  type: string;
  arrivalDate: string;
  birthdate: string;
  // Inside herdinfo.services.ts
  farmId: string;

  tagName: string;
  pregnancyStatusId: string;
  lactationStatusId: string | null;
  electronicId: string;
  lactation: number;

  healthStatus: string;
  animalCategory: string;
  ispregnant: boolean;

  price: number;
  animalWeight: number;
  weightDate: string;
  picture: string;
  subcategory: string;
  is_calve: boolean;
  pedigreeInfo: {
    damTagId: string,
    sireTagId: string
  };
  fatherId: string | null;
  motherId: string | null;
  inseminated_date: string;
  calving_date: string | null;
  last_event: string;
  createdBy: string;
  updatedBy: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  tag: {
    uuid: string,
    name: string
  };
  mother: any | null;
  father: any | null;
}

// For aggregated “Dashboard Data”
export interface DashboardData {
  pregnantPercentage: number;
  totalAnimals: number;
  totalPregnant: number;
  totalNonPregnant: number;
  dry: number;
  milk: number;
  heifers: number;
}
interface MilkEntry {
  period: string;
  total_milk: number;
}

interface MilkDataResponse {
  milkData: MilkEntry[];
  today_total_milk: number;
  yesterday_total_milk: number;
  avg_milk_per_cow: number;
  currentFilterMilk: number;
}

interface MilkData {
  month: string;
  monthNumber: string;
  milk1: number;
  milk2: number;
  milk3: number;
  milk: number;
}

interface LactationData {
  animal_curr_lactation: number;
  totalMilk: number;
}

interface LactationHistory {
  lactation: number;
  daysInMilk: number;
}

interface LactationMilkResponseData {
  totalMilk: number | null;
  currentLactation: number;
  DIM: number;
  milkData: MilkData[];
  lactationData: LactationData[];
  lactationHistory: LactationHistory[];
}

// =======================================
//  Dashboard Stats
// =======================================
export async function fetchDashboardStats(): Promise<DashboardData> {
  console.log('fetchDashboardStats() called...');
  const res = await api.get(API_CONFIG.dashboard.herdinfo);
  return res.data.data;
}

export async function fetch_Today_Yesterday_Average_Milk_and_Production_Trend_Graph(
  filter: string,
  startDate: string,
  endDate: string
): Promise<MilkDataResponse> {
  // Add parameter validation
  if (!filter || !startDate || !endDate) {
    throw new Error('Missing required parameters');
  }

  const response = await api.get(
    `${API_CONFIG.dashboard.milk}?filter=${filter}&startDate=${startDate}&endDate=${endDate}`
  );

  return response.data.data;
}

//Get Lactation Milk Data for Dashboard
export async function LactationMilkData(
  uuid: string
): Promise<LactationMilkResponseData> {
  // Add parameter validation
  if (!uuid) {
    throw new Error('Missing Aniaml Id Parameter');
  }
  const response = await api.get(
    `${API_CONFIG.dashboard.lactation}?animalId=${uuid}`
  );
  return response.data.data;
}

// =======================================
//  Fetch Animal List
// =======================================

export async function fetchAnimals(p0: boolean): Promise<AnimalInfoRow[]> {
  try {
    const response = await api.get(API_CONFIG.animal.addanimal, {
      params: {}
    });

    // Log the entire response for debugging

    const animals = response.data.data?.animals || [];

    // Ensure all necessary fields are mapped
    const mapped = animals.map((a: any) => ({
      uuid: a.uuid,
      penId: a.penId?.toString() || '',
      tagId: a.tagId || '',
      name: a.name || '',
      animalType: a.animalType || '',
      breedType: a.breedType || '',
      purchase_from: a.purchase_from || '',
      country: a.country || '',
      gender: a.gender || '',
      type: a.type || '',
      arrivalDate: a.arrivalDate || '',
      birthdate: a.birthdate || '',
      farmId: a.farmId || '',
      tagName: a.tagName || '',
      pregnancyStatusId: a.pregnancyStatusId || '',
      lactationStatusId: a.lactationStatusId || null,
      electronicId: a.electronicId || '',
      lactation: a.lactation || 0,
      healthStatus: a.healthStatus || '',
      animalCategory: a.animalCategory || '',
      ispregnant: a.ispregnant || false,
      price: a.price || 0,
      animalWeight: a.animalWeight || 0,
      weightDate: a.weightDate || '',
      picture: a.picture || '',
      subcategory: a.subcategory || '',
      is_calve: a.is_calve || false,
      pedigreeInfo: {
        damTagId: a.pedigreeInfo?.damTagId || '',
        sireTagId: a.pedigreeInfo?.sireTagId || ''
      },
      fatherId: a.fatherId || null,
      motherId: a.motherId || null,
      inseminated_date: a.inseminated_date || '',
      calving_date: a.calving_date || null,
      last_event: a.last_event || '',
      createdBy: a.createdBy || '',
      updatedBy: a.updatedBy || '',
      isDeleted: a.isDeleted || false,
      createdAt: a.createdAt || '',
      updatedAt: a.updatedAt || '',
      tag: {
        uuid: a.tag?.uuid || '',
        name: a.tag?.name || ''
      },
      mother: a.mother || null,
      father: a.father || null
    }));

    return mapped;
  } catch (error) {
    console.error('Error fetching animals:', error);
    return [];
  }
}

// =======================================
//  Add New Animal
// =======================================
export async function addanimal(params: any) {
  console.log('addanimal params', params);
  const res = await api.post(API_CONFIG.animal.addanimal, params);
  return res.data;
}

// =======================================
//  Pen
// =======================================
export async function fetchPenList(): Promise<DropdownObject[]> {
  const res = await api.get(API_CONFIG.pen);
  const pens = res.data.data?.pens || [];
  return pens.map((p: any) => ({ uuid: p.uuid, name: p.name }));
}

export async function addPen(payload: {
  name: string
}): Promise<DropdownObject> {
  console.log('addPen() called with:', payload);
  const res = await api.post(API_CONFIG.pen, payload);
  const pen = res.data.data;
  return { uuid: pen.uuid, name: pen.name };
}

// =======================================
//  Tag (Get All Tags)
// =======================================
export async function getAllTags(showAll: boolean): Promise<DropdownObject[]> {
  const isShowAll = showAll ? `?all=true` : '?is_used=false';
  const res = await api.get(`${API_CONFIG.tag}${isShowAll}`);
  return (
    res.data.data?.tags?.map((t: any) => ({
      uuid: t.uuid,
      name: t.name
    })) || []
  );
}
export async function addTag(payload: {
  name: string
}): Promise<DropdownObject> {
  console.log('addTag() called with:', payload);
  const res = await api.post(API_CONFIG.tag, payload);
  const newTag = res.data.data;
  return { uuid: newTag.uuid, name: newTag.name };
}

// =======================================
//  Animal Types
// =======================================
export async function fetchAnimalTypes(): Promise<DropdownObject[]> {
  const res = await api.get(API_CONFIG.animal.animalTypes);
  const arr = res.data.data?.animalTypes || [];
  return arr.map((obj: any) => ({ uuid: obj.uuid, name: obj.name }));
}

export async function addAnimalType(payload: {
  name: string
}): Promise<DropdownObject> {
  console.log('addAnimalType() called with payload:', payload);
  const res = await api.post(API_CONFIG.animal.animalTypes, payload);
  const animalType = res.data.data;
  return { uuid: animalType.uuid, name: animalType.name };
}

// =======================================
//  Breed Types
// =======================================
export async function fetchBreedTypes(): Promise<DropdownObject[]> {
  const res = await api.get(API_CONFIG.animal.breedTypes);
  const arr = res.data.data?.breedTypes || [];
  return arr.map((obj: any) => ({ uuid: obj.uuid, name: obj.name }));
}

export async function addBreedType(payload: {
  name: string
}): Promise<DropdownObject> {
  console.log('addBreedType() called with payload:', payload);
  const res = await api.post(API_CONFIG.animal.breedTypes, payload);
  const breed = res.data.data;
  return { uuid: breed.uuid, name: breed.name };
}

// =======================================
//  Animal SubCategories
// =======================================
export async function fetchAnimalSubCategories(): Promise<DropdownObject[]> {
  const res = await api.get(API_CONFIG.animal.animalSubCategories);
  const arr = res.data.data?.animalSubCategories || [];
  return arr.map((obj: any) => ({ uuid: obj.uuid, name: obj.name }));
}

export async function addSubCategory(payload: {
  name: string
}): Promise<DropdownObject> {
  console.log('addSubCategory() called with:', payload);
  const res = await api.post(API_CONFIG.animal.animalSubCategories, payload);
  const subCat = res.data.data;
  return { uuid: subCat.uuid, name: subCat.name };
}

// =======================================
//  Calves
// =======================================
export async function fetchCalves() {
  const res = await api.get(`${API_CONFIG.animal.addanimal}`, {
    params: { is_calve: true }
  });
  return res.data.data?.animals || [];
}

// =======================================
//  Remove Animal
// =======================================
export async function removeAnimal(payload: {
  animalId: string,
  date: string,
  removalCategory: string,
  comments: string,
  removalReason?: string,
  salePrice?: number
}) {
  const res = await api.post(API_CONFIG.events.removeAnimal, payload);
  return res.data;
}

export async function moveToPen(payload: {
  animalId: string,
  newPenId: string,
  date: string,
  reason: string
}) {
  try {
    const response = await api.post('/events/move-to-pen', payload);
    return response.data;
  } catch (err) {
    console.error('Error moving to pen:', err);
    throw err;
  }
}
export async function fetchPenHistory(): Promise<any[]> {
  try {
    const response = await api.get('/events/pen-history');
    return response.data.data?.penHistory || []; // Changed from 'history' to 'penHistory'
  } catch (err) {
    console.error('Error fetching pen history:', err);
    throw err;
  }
}
export async function fetchBull(): Promise<DropdownObject[]> {
  const res = await api.get(API_CONFIG.animal.bull);
  const arr = res.data.data?.bulls || [];
  return arr.map((obj: any) => ({ uuid: obj.uuid, name: obj.name }));
}
