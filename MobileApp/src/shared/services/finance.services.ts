import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

export const getFinanceDashboard = () =>
  HTTP_CLIENT.get(API_CONFIG.FINANCE.DASHBOARD)

export const getTransactions = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.FINANCE.TRANSACTIONS, { params: params || {} })

export const getAccounts = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.FINANCE.ACCOUNTS, { params: params || {} })

export const getGeneralLedger = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.FINANCE.LEDGER, { params: params || {} })

export const getProfitLoss = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.FINANCE.PROFIT_LOSS, { params: params || {} })
