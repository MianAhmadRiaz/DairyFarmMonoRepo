import api from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
export interface DropdownObject {
  [x: string]: string;
  aiDate: string;
  tagId: string;
  sireName: string;
  straw: number;
  price: number;
  comments: string;
  uuid: string;
  name: string;
  // any additional fields
}

export const registerProtocolEvent = async (params: any) => {
  console.log('addPrtocol called with params:', params);
  const res = await api.post(
    API_CONFIG.breeding_events.registerProtocol,
    params
  );
  console.log('addAnimal()=> res.data:', res.data);
  return res.data;
};

export const addAiBreedingEvent = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.aiBreeding, params);
  console.log(res.data);
  return res.data;
};

export const addProtocol = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.protocol, params);
  console.log(res.data);
  return res.data;
};

export const addInjection = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.injection, params);
  console.log(res.data);
  return res.data;
};

export const addCalvingEvent = async (params: any) => {
  console.log('Sending calving event with params:', params);

  try {
    const res = await api.post(API_CONFIG.breeding_events.calivng, params);
    console.log('API response:', res.data);
    return res.data;
  } catch (error) {
    console.error('API call failed:', error);
    throw error; // Re-throw to handle it upstream if needed
  }
};

export async function fetchProtocolsList(): Promise<DropdownObject[]> {
  console.log('fetchProtocolsList() called...');
  const res = await api.get(API_CONFIG.breeding_events.protocol);
  console.log('fetchProtocolsList => res.data:', res.data);

  // Suppose your server returns { data: { pens: [{uuid, name}, ...] } }
  const protocolsArray = res.data.data?.protocols || [];
  return protocolsArray.map((p: any) => ({
    uuid: p.uuid,
    name: p.name,
    min_DIM: p.min_DIM,
    max_DIM: p.max_DIM,
    injections: p.injections,
    ai_time: p.ai_time
  }));
}

export async function fetchPregnancyList(
  animalId: string
): Promise<DropdownObject[] | null> {
  console.log('fetchPregnancyList() called...');
  const res = await api.get(API_CONFIG.breeding_events.pregnancy);
  console.log('fetchPregnancyList => res.data:', res.data);

  const history = res.data.data?.pregnancyEventHistory || [];
  if (history.length === 0) return null;

  // Sort by updatedAt (descending: most recent first)
  const latest = history.sort(
    (a: any, b: any) =>
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  )[0];
  console.log(latest, 'latest data ');
  return {
    uuid: latest.uuid,
    breed_date: latest.breed_date,
    breed_with: latest.breed_with,
    prev_test_date: latest.prev_test_date,
    pg_days: latest.pg_days,
    exp_dryoff_date: latest.exp_dryoff_date,
    exp_calving_date: latest.exp_calving_date
  };
}

export async function fetchInjectionsList(): Promise<DropdownObject[]> {
  console.log('fetchInjectionsList() called...');
  const res = await api.get(API_CONFIG.breeding_events.injection);
  console.log('fetchInjectionsList => res.data:', res.data);

  // Suppose your server returns { data: { pens: [{uuid, name}, ...] } }
  const penArray = res.data.data?.injections || [];
  return penArray.map((p: any) => ({
    uuid: p.uuid,
    name: p.name
  }));
}

// 1) GET AI Breeding Events
export async function fetchAiBreedingList(): Promise<DropdownObject[]> {
  const res = await api.get(API_CONFIG.breeding_events.aiBreeding);
  const AiBreedingArray = res.data.data?.aiBreedingEventHistory || [];
  return AiBreedingArray.map((p: any, index: number) => ({
    srNo: (index + 1).toString(),
    aiDate: p.date ? p.date.slice(0, 10) : '',
    tagId: p.animal?.tagName || 'N/A', // Directly get tagName
    sireName: p.semen || '',
    straw: p.double_dose ? 2 : 1,
    price: p.cost || 0,
    comments: p.comments || ''
  }));
}

export const addBullBreedingEvent = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.bullBreeding, params);
  console.log(res.data);
  return res.data;
};

export async function fetchBullBreedingList(): Promise<DropdownObject[]> {
  console.log('fetchBullBreedingList() called...');
  const res = await api.get(API_CONFIG.breeding_events.bullBreeding);
  console.log('fetchBull BreedingList => res.data:', res.data);

  const bullBreedingArray = res.data.data?.bullBreedingEventHistory || [];
  return bullBreedingArray.map((p: any, idx: number) => ({
    srNo: (idx + 1).toString(),
    bullBreedDate: p.date ? p.date.slice(0, 10) : '',
    sireName: p.bull?.name || '',
    tagId: p.animal?.tagId || 'N/A',
    tagName: p.animal?.tagName || '', // <-- grab tagName directly
    comments: p.comments || '',
    selected: false
  }));
}

export const addPregnancyEvent = async (params: any) => {
  console.log(params, 'PARAMS');
  const res = await api.post(API_CONFIG.breeding_events.pregnancy, params);
  console.log(res.data);
  return res.data;
};

export async function fetchPregnanacyTests(): Promise<DropdownObject[]> {
  console.log('fetchPregnanacyTests() called...');
  const res = await api.get(API_CONFIG.breeding_events.pregnancy);
  console.log('fetchPregnanacyTests => res.data:', res.data);

  const pregnancyEventArray = res.data.data?.pregnancyEventHistory || [];
  return pregnancyEventArray.map((p: any, idx: number) => ({
    srNo: (idx + 1).toString(),
    pregnancyTestDate: p.date,
    tagId: p.animal?.tagId || 'N/A',
    tagName: p.animal?.tagName || 'N/A', // <---- use tagName directly from animal object
    aiBbDate: p.breed_date ? p.breed_date.slice(0, 10) : '',
    type: p.technique,
    status: p.result,
    price: p.cost,
    selected: false
  }));
}

export async function fetchBullList(): Promise<DropdownObject[]> {
  console.log('fetchBullList() called...');
  const res = await api.get(API_CONFIG.animal.bull);
  console.log('fetchBullList => res.data:', res.data);

  // Suppose your server returns { data: { pens: [{uuid, name}, ...] } }
  const penArray = res.data.data?.bulls || [];
  return penArray.map((p: any) => ({
    uuid: p.uuid,
    name: p.name
  }));
}

export const addHeatDetection = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.headDetection, params);
  console.log(res.data);
  return res.data;
};

export const addAbortionEvent = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.abortion, params);
  console.log(res.data);
  return res.data;
};

export async function fetchAbortionEvent(): Promise<DropdownObject[]> {
  console.log('fetchAbortionEvent() called...');
  const res = await api.get(API_CONFIG.breeding_events.abortion);
  console.log('fetchAbortionEvent => res.data:', res.data);

  const penArray = res.data.data?.abortionEventHistory || [];
  return penArray.map((p: any, idx: number) => ({
    uuid: p.uuid,
    tagId: p.animal?.tagId || 'N/A', // Tag ID (optional: keep it for internal use)
    tagName: p.animal?.tagName || 'N/A', // <-- Tag Name for display
    comments: p.comments,
    abortionDate: p.date ? p.date.slice(0, 10) : '',
    status: p.milkable,
    price: p.cost
  }));
}

export const addDryOffEvent = async (params: any) => {
  const res = await api.post(API_CONFIG.breeding_events.dryoff, params);
  console.log(res.data);
  return res.data;
};

export const getProtocol = () => {
  return api.get(API_CONFIG.breeding_events.protocol);
};

export const forgotPassword = (params: any) => {
  return api.post(API_CONFIG.auth.forgetPassword, params);
};
