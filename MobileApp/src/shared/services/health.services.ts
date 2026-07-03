import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

export const getTreatments = (params?: {
  page?: number
  limit?: number
  animalId?: string
  treatmentType?: string
}) => HTTP_CLIENT.get(API_CONFIG.TREATMENTS, { params: params || {} })

export const addTreatment = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.TREATMENTS, params)

export const deleteTreatment = (treatmentId: string) =>
  HTTP_CLIENT.delete(`${API_CONFIG.TREATMENTS}?treatmentId=${treatmentId}`)

export const getActiveWithdrawals = () =>
  HTTP_CLIENT.get(API_CONFIG.TREATMENT_WITHDRAWALS)

export const getHerdAlerts = () =>
  HTTP_CLIENT.get(API_CONFIG.BREEDING_EVENTS.ALERTS)

// For the medicine dropdown when recording a treatment.
export const getStockItems = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.ITEMS, { params: params || {} })
