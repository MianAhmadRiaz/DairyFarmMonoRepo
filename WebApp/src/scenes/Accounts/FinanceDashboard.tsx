// FinanceDashboard.tsx
import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Chip, useTheme, Divider, CircularProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useScrollToTopOnMount } from '../../shared/components/Hooks/useScrollToTop';
import AccountBalanceWalletRounded from '@mui/icons-material/AccountBalanceWalletRounded';
import AccountBalanceRounded from '@mui/icons-material/AccountBalanceRounded';
import PaymentsRounded from '@mui/icons-material/PaymentsRounded';
import ReceiptLongRounded from '@mui/icons-material/ReceiptLongRounded';
import { tokens } from '../../shared/theme/theme';
import { fetchFinanceDashboard, FinanceDashboardData } from '../../shared/services/finance.service';
import PageContainer from '../../shared/components/Layout/PageContainer';

import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  LineChart,
  Line
} from 'recharts';

/** ----------------- TYPES ----------------- */
type Kpi = {
  title: string,
  value: number,
  badge?: string,
  tone: 'emerald' | 'violet' | 'green' | 'rose',
  icon: React.ReactNode
};
type StackedPoint = {
  name: string,
  Income: number,
  COGS: number,
  Expense: number
};
type ProfitPoint = { month: number, Net: number };

/** ----------------- UI TOKENS (Figma vibe) ----------------- */
const uiTokens = {
  pageBg: '#F5FAF7', // soft mint (like your figma)
  cardRadius: 16,
  chip: {
    emerald: { bg: '#E6F4EF', fg: '#0F7C8F' },
    violet: { bg: '#EEE9FE', fg: '#6D28D9' },
    green: { bg: '#E8F5E9', fg: '#2E7D32' },
    rose: { bg: '#FDE7EA', fg: '#C62828' }
  },
  chart: {
    income: '#42A5F5', // blue (Income)
    cogs: '#6C4DF5', // violet (Cost of Goods)
    expense: '#66BB6A', // green (Expense)
    net: '#42A5F5' // line color
  }
};

/** ----------------- DEMO DATA (fallback before API loads) -----------------
 * `title` holds an i18n key translated at render time.
 */
const fallbackKpis: Kpi[] = [
  {
    title: 'accounts.financeDashboard.totalCashInHand',
    value: 0,
    badge: 'Live',
    tone: 'emerald',
    icon: <AccountBalanceWalletRounded />
  },
  {
    title: 'accounts.financeDashboard.totalIncome',
    value: 0,
    badge: 'Live',
    tone: 'violet',
    icon: <AccountBalanceRounded />
  },
  {
    title: 'accounts.financeDashboard.totalExpense',
    value: 0,
    badge: 'Live',
    tone: 'green',
    icon: <PaymentsRounded />
  },
  {
    title: 'accounts.financeDashboard.netProfit',
    value: 0,
    badge: 'Live',
    tone: 'rose',
    icon: <ReceiptLongRounded />
  }
];

/** ----------------- HELPERS ----------------- */
const money = (n: number) => {
  const sign = n < 0 ? '-' : '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${sign}${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${sign}${(abs / 1_000).toFixed(1)}k`;
  return `${sign}${abs.toLocaleString()}`;
};

/** ----------------- SINGLE FILE DASHBOARD ----------------- */
const FinanceDashboard: React.FC = () => {
  // Ensure page starts from top when component mounts
  useScrollToTopOnMount();
  const { t } = useTranslation();
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const pageBg =
    theme.palette.mode === 'dark' ? colors.primary[500] : '#F5FAF7';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<FinanceDashboardData | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetchFinanceDashboard();
        if (active) setData(res);
      } catch (e) {
        console.error('Failed to load finance dashboard', e);
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const kpis: Kpi[] = data
    ? [
        {
          title: 'accounts.financeDashboard.totalCashInHand',
          value: data.summary.cashOnHand,
          badge: 'Live',
          tone: 'emerald',
          icon: <AccountBalanceWalletRounded />
        },
        {
          title: 'accounts.financeDashboard.totalIncome',
          value: data.summary.totalIncome,
          badge: 'Live',
          tone: 'violet',
          icon: <AccountBalanceRounded />
        },
        {
          title: 'accounts.financeDashboard.totalExpense',
          value: data.summary.totalExpense,
          badge: 'Live',
          tone: 'green',
          icon: <PaymentsRounded />
        },
        {
          title: 'accounts.financeDashboard.netProfit',
          value: data.summary.netProfit,
          badge: 'Live',
          tone: 'rose',
          icon: <ReceiptLongRounded />
        }
      ]
    : fallbackKpis;

  const stackedData: StackedPoint[] = (data?.monthlyTrend || []).map(m => ({
    name: m.month,
    Income: Number(m.income) || 0,
    COGS: 0,
    Expense: Number(m.expense) || 0
  }));

  const profitData: ProfitPoint[] = (data?.monthlyTrend || []).map((m, idx) => ({
    month: idx + 1,
    Net: (Number(m.income) || 0) - (Number(m.expense) || 0)
  }));

  if (loading) {
    return (
      <PageContainer title={t('accounts.financeDashboard.title')} subtitle={t('topbar.admin')}>
        <Box
          sx={{
            bgcolor: pageBg,
            minHeight: '50vh',
            display: 'grid',
            placeItems: 'center'
          }}
        >
          <CircularProgress />
        </Box>
      </PageContainer>
    );
  }

  return (
    <PageContainer title={t('accounts.financeDashboard.title')} subtitle={t('topbar.admin')}>
        {/* KPI ROW */}
        <Grid container spacing={2} sx={{ mb: 3, minHeight: 140 }}>
          {kpis.map((k, i) => {
            const tone = uiTokens.chip[k.tone];
            return (
              <Grid item xs={12} sm={6} md={3} key={i} sx={{ height: '100%' }}>
                <Box
                  sx={{
                    p: 2.5,
                    borderRadius: 0,
                    bgcolor: 'background.paper',
                    border: `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    gap: 2,
                    alignItems: 'center',
                    height: '100%',
                    minHeight: 140,
                    boxSizing: 'border-box'
                  }}
                >
                  <Box
                    sx={{
                      p: 1.25,
                      borderRadius: 2,
                      bgcolor: tone.bg,
                      color: tone.fg,
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    {k.icon}
                  </Box>
                  <Box flex={1}>
                    <Typography variant="caption" color="text.secondary">
                      {t(k.title)}
                    </Typography>
                    <Typography variant="h5" fontWeight={800}>
                      {money(k.value)}
                    </Typography>
                    {k.badge && (
                      <Chip
                        size="small"
                        label={k.badge === 'Live' ? t('accounts.financeDashboard.live') : k.badge}
                        sx={{
                          mt: 1,
                          bgcolor: tone.bg,
                          color: tone.fg,
                          fontWeight: 600
                        }}
                      />
                    )}
                  </Box>
                </Box>
              </Grid>
            );
          })}
        </Grid>

        {/* STACKED BAR: Profit-Loss, Income & Expense */}
        <Box
          sx={{
            p: 3,
            borderRadius: 0,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            mb: 3,
            minHeight: 420,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            {t('accounts.financeDashboard.profitLossIncomeExpense')}
          </Typography>

          <Box sx={{ height: 380, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stackedData} barCategoryGap={28}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis tickFormatter={(v: number) => money(v)} />
                <Tooltip formatter={(v: number) => money(v)} />
                <Legend />
                <Bar
                  dataKey="Income"
                  name={t('accounts.financeDashboard.income')}
                  fill={uiTokens.chart.income}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="COGS"
                  name={t('accounts.financeDashboard.cogs')}
                  fill={uiTokens.chart.cogs}
                  radius={[8, 8, 0, 0]}
                />
                <Bar
                  dataKey="Expense"
                  name={t('accounts.financeDashboard.expense')}
                  fill={uiTokens.chart.expense}
                  radius={[8, 8, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </Box>
        </Box>

        {/* LINE: Monthly Profit Loss */}
        <Box
          sx={{
            p: 3,
            borderRadius: 0,
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`,
            minHeight: 400,
            width: '100%',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <Typography variant="h6" fontWeight={800}>
            {t('accounts.financeDashboard.monthlyProfitLoss')}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {t('accounts.financeDashboard.source')}
          </Typography>
          <Box sx={{ height: 360, mt: 2 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={profitData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" tickFormatter={m => `${m}`} />
                <YAxis tickFormatter={(v: number) => money(v)} />
                <Tooltip
                  formatter={(v: number) => money(v)}
                  labelFormatter={(m: number) => t('accounts.financeDashboard.monthLabel', { month: m })}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Net"
                  name={t('accounts.financeDashboard.net')}
                  stroke={uiTokens.chart.net}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </Box>

          {/* Tiny footer like your screenshot */}
          <Divider sx={{ mt: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
            <Typography variant="caption" color="text.disabled">
              DairyCare Software
            </Typography>
          </Box>
        </Box>
    </PageContainer>
  );
};

export default FinanceDashboard;
