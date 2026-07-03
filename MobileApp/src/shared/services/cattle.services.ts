import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

const getAnimals = async (params?: any) => {
  return await HTTP_CLIENT.get(API_CONFIG.ANIMAL, { params: params || {} })
}

const addAnimal = (params: any) => HTTP_CLIENT.post(API_CONFIG.ANIMAL, params)

const updateAnimal = (params: any) => HTTP_CLIENT.put(API_CONFIG.ANIMAL, params)

const removeAnimal = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.EVENTS.REMOVE_ANIMAL, params)

const moveToPen = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.EVENTS.MOVE_TO_PEN, params)

const updateWeight = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.EVENTS.UPDATE_WEIGHT, params)

const updateHealthStatus = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.EVENTS.UPDATE_HEALTH, params)

const getTags = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.TAG, { params: params || {} })

const getPens = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.PEN, { params: params || {} })

const getBreedTypes = () => HTTP_CLIENT.get(API_CONFIG.BREED_TYPES)
const getAnimalTypes = () => HTTP_CLIENT.get(API_CONFIG.ANIMAL_TYPES)
const getBulls = () => HTTP_CLIENT.get(API_CONFIG.BULL)

const getHerdDashboard = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.DASHBOARD.HERD, { params: params || {} })

export {
  getAnimals,
  addAnimal,
  updateAnimal,
  removeAnimal,
  moveToPen,
  updateWeight,
  updateHealthStatus,
  getTags,
  getPens,
  getBreedTypes,
  getAnimalTypes,
  getBulls,
  getHerdDashboard,
}
