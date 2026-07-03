import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

export const getStockItems = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.ITEMS, { params: params || {} })

export const getStockCategories = () =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.CATEGORIES)

export const getStockAlerts = () => HTTP_CLIENT.get(API_CONFIG.STOCK.ALERT)

export const getStockLevel = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.LEVEL, { params: params || {} })

export const getPurchases = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.PURCHASES, { params: params || {} })

export const addPurchase = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.STOCK.PURCHASES, params)

export const getSuppliers = () => HTTP_CLIENT.get(API_CONFIG.STOCK.SUPPLIERS)

export const addSupplier = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.STOCK.SUPPLIERS, params)

export const getStockTransactions = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.TRANSACTIONS, { params: params || {} })

export const addStockTransaction = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.STOCK.TRANSACTIONS, params)

export const getExpiryReport = (days = 60) =>
  HTTP_CLIENT.get(API_CONFIG.STOCK.EXPIRY, { params: { days } })

export const getReorderReport = () => HTTP_CLIENT.get(API_CONFIG.STOCK.REORDER)

export const getUnits = () => HTTP_CLIENT.get(API_CONFIG.STOCK.UNITS)
