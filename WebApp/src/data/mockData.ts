export const mockStockData = {
  totalItems: 156,
  lowStockItems: 8,
  dailyConsumption: 24,
  monthlyCost: 12500,
  consumptionTrend: [
    { name: 'Feeding', value: 45 },
    { name: 'Medicine', value: 25 },
    { name: 'Semen', value: 15 },
    { name: 'Other', value: 15 }
  ],
  costDistribution: [
    { name: 'Feeding', value: 40 },
    { name: 'Medicine', value: 30 },
    { name: 'Semen', value: 20 },
    { name: 'Other', value: 10 }
  ],
  alerts: [
    { item: 'Feed Mix A', quantity: 5, threshold: 10 },
    { item: 'Medicine B', quantity: 3, threshold: 5 },
    { item: 'Semen C', quantity: 2, threshold: 5 }
  ],
  topConsumed: [
    { item: 'Feed Mix A', quantity: 15 },
    { item: 'Medicine B', quantity: 8 },
    { item: 'Semen C', quantity: 5 }
  ]
};
