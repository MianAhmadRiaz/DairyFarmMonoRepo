// Stock Dashboard Types

export interface ConsumptionTrendData {
  name: string;
  Feeding: number;
  Medicine: number;
  Semen: number;
  Other: number;
}

export interface CostDistributionData {
  name: string;
  value: number;
  color: string;
}

export interface StockAlert {
  item: string;
  quantity: number;
  threshold: number;
  expiry: string;
}

export interface TopConsumedItem {
  item: string;
  quantity: number;
  category: string;
}

export interface StockDashboardData {
  totalItems: number;
  lowStockItems: number;
  dailyConsumption: number;
  monthlyCost: number;
  consumptionTrend: ConsumptionTrendData[];
  costDistribution: CostDistributionData[];
  alerts: StockAlert[];
  topConsumed: TopConsumedItem[];
}
