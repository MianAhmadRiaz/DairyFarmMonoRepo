import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

export const getRecipes = () => HTTP_CLIENT.get(API_CONFIG.FEEDING.RECIPES)
export const createRecipe = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.FEEDING.RECIPES, params)

export const getRecipeGroups = () =>
  HTTP_CLIENT.get(API_CONFIG.FEEDING.RECIPE_GROUPS)

export const getIngredients = () =>
  HTTP_CLIENT.get(API_CONFIG.FEEDING.INGREDIENTS)

export const getSheds = () => HTTP_CLIENT.get(API_CONFIG.FEEDING.SHEDS)

export const applyRecipeToShed = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.FEEDING.APPLY_SHED, params)

export const recordFeedingActual = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.FEEDING.RECORD_ACTUAL, params)

export const getShedFeedReport = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.FEEDING.SHED_REPORT, { params: params || {} })

export const getFormulations = () =>
  HTTP_CLIENT.get(API_CONFIG.FEED_FORMULATION)
