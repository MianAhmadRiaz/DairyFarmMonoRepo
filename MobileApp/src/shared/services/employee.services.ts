import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

export const getEmployees = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.BASE, { params: params || {} })

export const getAttendance = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.ATTENDANCE, { params: params || {} })

export const markAttendance = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.EMPLOYEE.ATTENDANCE, params)

export const getTasks = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.TASKS, { params: params || {} })

export const addTask = (params: any) =>
  HTTP_CLIENT.post(API_CONFIG.EMPLOYEE.TASKS, params)

export const getRequests = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.REQUESTS, { params: params || {} })

export const respondRequest = (params: any) =>
  HTTP_CLIENT.put(`${API_CONFIG.EMPLOYEE.REQUESTS}/respond`, params)

export const getSalaryInvoices = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.SALARY, { params: params || {} })

export const getEmployeeSalaries = (params?: any) =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.SALARY_EMPLOYEES, {
    params: params || {},
  })

export const markInvoicePaid = (invoiceId: string) =>
  HTTP_CLIENT.put(`${API_CONFIG.EMPLOYEE.SALARY_PAID}?invoiceId=${invoiceId}`)

export const getDepartments = () =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.DEPARTMENTS)

export const getDesignations = () =>
  HTTP_CLIENT.get(API_CONFIG.EMPLOYEE.DESIGNATIONS)
