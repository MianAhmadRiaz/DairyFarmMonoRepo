import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

const getHeatDetection = async () => {
  return await HTTP_CLIENT.get(API_CONFIG.BREEDING_EVENTS.HEAT_DETECTION)
}

const addNewHeatDetection = async (params: any) => {
  return await HTTP_CLIENT.post(API_CONFIG.BREEDING_EVENTS.HEAT_DETECTION, params);
};

// const getTags = async () => {
//   return await HTTP_CLIENT.get(API_CONFIG.BREEDING_EVENTS.TAGS)
// }

const getAnimals = async () => {
  return await HTTP_CLIENT.get(API_CONFIG.ANIMAL)
}

const addAIBreeding = async (params: any) => {
  return await HTTP_CLIENT.post(API_CONFIG.BREEDING_EVENTS.AIBreeding, params);
};


export { getHeatDetection,addNewHeatDetection, getAnimals, addAIBreeding}
