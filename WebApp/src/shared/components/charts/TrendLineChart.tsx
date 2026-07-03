import React from 'react';
import {
  AreaChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@mui/material';

interface Series {
  dataKey: string;
  color: string;
  name?: string;
  area?: boolean;
}

interface TrendLineChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: Series[];
  height?: number;
  showLegend?: boolean;
}

// Theme-aware replacement for the old hardcoded-dark LineChart — reads colors
// from the live MUI theme instead of a fixed 'dark' token set, so it renders
// correctly in both light and dark mode.
const TrendLineChart: React.FC<TrendLineChartProps> = ({ data, xKey, series, height = 260, showLegend = false }) => {
  const theme = useTheme();
  const gridColor = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 5, right: 12, left: -12, bottom: 5 }}>
        <defs>
          {series.map(s => (
            <linearGradient key={s.dataKey} id={`grad-${s.dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={s.color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={s.color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        <XAxis dataKey={xKey} stroke={axisColor} style={{ fontSize: 11 }} tickLine={false} />
        <YAxis stroke={axisColor} style={{ fontSize: 11 }} tickLine={false} />
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map(s =>
          s.area ? (
            <Area
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.dataKey})`}
              isAnimationActive
              animationDuration={900}
            />
          ) : (
            <Line
              key={s.dataKey}
              type="monotone"
              dataKey={s.dataKey}
              name={s.name || s.dataKey}
              stroke={s.color}
              strokeWidth={2}
              dot={false}
              isAnimationActive
              animationDuration={900}
            />
          )
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TrendLineChart;
