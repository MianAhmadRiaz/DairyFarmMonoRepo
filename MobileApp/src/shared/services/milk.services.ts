import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

// Milk sessions grid for a date (list of milking animals + their sessions).
export const getMilkingSessions = (date: string) =>
  HTTP_CLIENT.get(`${API_CONFIG.MILK.SESSION}`, { params: { date } })

export const addMilkingSession = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.MILK.SESSION, params)

export const updateMilkingSession = (params: any) =>
  HTTP_CLIENT.put(API_CONFIG.MILK.SESSION, params)

export const getPendingApprovalDates = () =>
  HTTP_CLIENT.get(API_CONFIG.MILK.PENDING_DATES)

export const approveMilk = (params: { sessionsData: any[] }) =>
  HTTP_CLIENT.post(API_CONFIG.MILK.APPROVED, params)

export const getApprovedMilk = (date: string) =>
  HTTP_CLIENT.get(API_CONFIG.MILK.APPROVED, { params: { date } })

export const milkOut = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.MILK.OUT, params)

export const getMilkOut = (date: string) =>
  HTTP_CLIENT.get(API_CONFIG.MILK.OUT, { params: { date } })

export const getMilkByDate = (date: string) =>
  HTTP_CLIENT.get(API_CONFIG.MILK.BY_DATE, { params: { date } })

export const getMilkAnalytics = (date?: string) =>
  HTTP_CLIENT.get(API_CONFIG.MILK.ANALYTICS, { params: date ? { date } : {} })

export const getMilkCategories = () =>
  HTTP_CLIENT.get(API_CONFIG.MILK_CATEGORIES)

export const getCompanies = () => HTTP_CLIENT.get(API_CONFIG.COMPANIES)
