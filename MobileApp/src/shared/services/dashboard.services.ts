import HTTP_CLIENT from 'shared/utils/Axios_Client'
import API_CONFIG from '../../../cattle.config'

// ── Response shapes (mirrors the web app's herdinfo.services.ts) ──────────────

export interface DashboardStats {
  pregnantPercentage: number
  totalAnimals: number
  totalPregnant: number
  totalNonPregnant: number
  dry: number
  milk: number
  heifers: number
}

export interface MilkTrendPoint {
  period: string
  total_milk: number
}

export interface MilkDashboard {
  milkData: MilkTrendPoint[]
  today_total_milk: number
  yesterday_total_milk: number
  avg_milk_per_cow: number
  currentFilterMilk?: number
}

export interface ReproductionSummary {
  pregnancyRate?: number
  avgCalvingIntervalDays?: number
  avgDaysOpen?: number
  avgServicesPerConception?: number
  funnel?: {
    heatEvents: number
    aiEvents: number
    bullEvents: number
    pregnancyConfirmed: number
    calvings: number
  }
}

export interface TreatmentSummary {
  sickAnimals?: any[]
  totalCost?: number
  topDiagnoses?: { diagnosis: string; count: number }[]
  byType?: { treatmentType: string; count: number }[]
  daysSinceLastVaccinationOrDeworming?: {
    animal?: { uuid?: string; name?: string; tagName?: string }
    treatmentType: string
    lastDate?: string
    daysSince: number
  }[]
}

export interface Withdrawal {
  uuid: string
  animal?: { uuid?: string; name?: string; tagName?: string }
  diagnosis?: string
  treatmentType?: string
  milkWithdrawalUntil?: string
  meatWithdrawalUntil?: string
}

export interface YearTotals {
  totalMilk: number
  avgMilkPerCow: number
  calvingCount: number
  treatmentCount: number
  treatmentCost: number
  mortalityCount: number
}

export interface HerdComparison {
  currentYear: number
  compareYear: number
  totals: Record<string, YearTotals>
  monthlyMilkTrend: ({ month: string } & Record<string, any>)[]
  currentAnimalCountsNote?: string
}

export interface FinancialsEstimate {
  isEstimate?: boolean
  estimateNotes?: string
  hasFeedData?: boolean
  bottomPerformers?: {
    uuid: string
    name?: string
    tagName?: string
    totalMilk: number
    realCostOfCare: number
    estimatedMilkIncome: number
    estimatedNetProfit: number
  }[]
}

export interface HerdAlertItem {
  uuid?: string
  name?: string
  tagName?: string
  reason?: string
  dryOffDueDate?: string
  expectedCalvingDate?: string
  [key: string]: any
}

export interface HerdAlerts {
  heatWatch?: HerdAlertItem[]
  pregnancyCheckDue?: HerdAlertItem[]
  dryOffDue?: HerdAlertItem[]
  calvingExpected?: HerdAlertItem[]
}

// ── API calls (all responses are enveloped as res.data.data) ─────────────────

const unwrap = <T>(res: any): T => res?.data?.data

export const fetchDashboardStats = async (): Promise<DashboardStats> =>
  unwrap(await HTTP_CLIENT.get(API_CONFIG.DASHBOARD.HERD))

export const fetchMilkDashboard = async (
  filter: 'week' | 'month' | 'year' = 'week',
  startDate?: string,
  endDate?: string
): Promise<MilkDashboard> =>
  unwrap(
    await HTTP_CLIENT.get(API_CONFIG.DASHBOARD.MILK, {
      params: { filter, startDate, endDate }
    })
  )

export const fetchHerdAlerts = async (): Promise<HerdAlerts> =>
  unwrap(await HTTP_CLIENT.get(API_CONFIG.BREEDING_EVENTS.ALERTS))

export const fetchReproductionSummary =
  async (): Promise<ReproductionSummary> =>
    unwrap(
      await HTTP_CLIENT.get(API_CONFIG.BREEDING_EVENTS.REPRODUCTION_SUMMARY)
    )

export const fetchTreatmentSummary = async (
  year?: number
): Promise<TreatmentSummary> =>
  unwrap(
    await HTTP_CLIENT.get(API_CONFIG.TREATMENT_SUMMARY, {
      params: year ? { year } : {}
    })
  )

export const fetchWithdrawals = async (): Promise<Withdrawal[]> =>
  unwrap(await HTTP_CLIENT.get(API_CONFIG.TREATMENT_WITHDRAWALS))

export const fetchHerdComparison = async (
  year?: number
): Promise<HerdComparison> =>
  unwrap(
    await HTTP_CLIENT.get(API_CONFIG.DASHBOARD.COMPARISON, {
      params: year ? { year } : {}
    })
  )

export const fetchFinancialsEstimate = async (
  year?: number
): Promise<FinancialsEstimate> =>
  unwrap(
    await HTTP_CLIENT.get(API_CONFIG.DASHBOARD.FINANCIALS_ESTIMATE, {
      params: year ? { year } : {}
    })
  )
