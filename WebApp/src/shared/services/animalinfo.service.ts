// animalinfo.service.ts
import AxiosClient from '../api/AxiosClient';
import { API_CONFIG } from './apiConfigs';
// Data from server might have more fields than we need
interface ServerAnimal {
  uuid?: string
  penId?: number | string;
  tagId?: string;
  name?: string;
  animalType?: string;
  breedType?: string;
  purchase_from?: string;
  country?: string;
  gender?: string;
  type?: string;
  arrivalDate?: string;
  birthdate?: string;
  lactation?:string;
}
export interface AnimalInfoRow {
  uuid: string;
  penId: string;
  tagId: string;
  name: string;
  animalType: string;
  breedType: string;
  purchasedFrom: string;
  country: string;
  gender: string;
  type: string;
  arrivalDate: string;
  birthdate: string;
  lactation:string;
}
export async function fetchAnimals(): Promise<AnimalInfoRow[]> {
  console.log('fetchAnimals() called. Attempting to get animals from API...');
  try {
    const response = await AxiosClient.get(API_CONFIG.animal.addanimal);
    // If your API returns { data: [...] }, adjust as needed
    const animals: ServerAnimal[] = response.data?.data?.animals || [];
    console.log('fetchAnimals() extracted animals:', animals);
    // map to only the fields we need
    const mapped = animals.map(animal => ({
      uuid: animal.uuid || '',
      penId: animal.penId?.toString() ?? '',
      tagId: animal.tag.name || '',
      tagName: animal.tag?.name || '',
      name: animal.name || '',
      animalType: animal.animalType || '',
      breedType: animal.breedType || '',
      purchasedFrom: animal.purchase_from || '',
      country: animal.country || '',
      gender: animal.gender || '',
      type: animal.type || '',
      arrivalDate: animal.arrivalDate || '',
      birthdate: animal.birthdate || '',
    lactation: animal.lactation?.toString() ?? ''
    }));
    console.log('fetchAnimals() mapped data:', mapped);
    return mapped;
  } catch (error) {
    console.error('fetchAnimals() error:', error);
    throw error;
  }
}