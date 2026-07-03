import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { useTheme } from '@mui/material';

interface Series {
  dataKey: string;
  color: string;
  name?: string;
}

interface TrendBarChartProps {
  data: Array<Record<string, any>>;
  xKey: string;
  series: Series[];
  height?: number;
  showLegend?: boolean;
  layout?: 'horizontal' | 'vertical';
  perBarColors?: string[];
}

const TrendBarChart: React.FC<TrendBarChartProps> = ({
  data,
  xKey,
  series,
  height = 260,
  showLegend = false,
  layout = 'horizontal',
  perBarColors,
}) => {
  const theme = useTheme();
  const gridColor = theme.palette.divider;
  const axisColor = theme.palette.text.secondary;
  const isVertical = layout === 'vertical';

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={data}
        layout={layout}
        margin={{ top: 5, right: 12, left: isVertical ? 40 : -12, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
        {isVertical ? (
          <>
            <XAxis type="number" stroke={axisColor} style={{ fontSize: 11 }} />
            <YAxis type="category" dataKey={xKey} stroke={axisColor} style={{ fontSize: 11 }} width={90} />
          </>
        ) : (
          <>
            <XAxis dataKey={xKey} stroke={axisColor} style={{ fontSize: 11 }} tickLine={false} />
            <YAxis stroke={axisColor} style={{ fontSize: 11 }} tickLine={false} />
          </>
        )}
        <Tooltip
          contentStyle={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 8,
            fontSize: 12,
          }}
          cursor={{ fill: theme.palette.action.hover }}
        />
        {showLegend && <Legend wrapperStyle={{ fontSize: 12 }} />}
        {series.map(s => (
          <Bar key={s.dataKey} dataKey={s.dataKey} name={s.name || s.dataKey} fill={s.color} radius={[4, 4, 4, 4]} isAnimationActive animationDuration={800}>
            {perBarColors && data.map((_, idx) => <Cell key={idx} fill={perBarColors[idx % perBarColors.length]} />)}
          </Bar>
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TrendBarChart;
