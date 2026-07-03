import React from 'react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { tokens } from '../../theme/theme';

interface PieChartProps {
  data: Array<{
    name: string,
    value: number
  }>;
}

const PieChart = ({ data }: PieChartProps) => {
  const colors = tokens('dark');
  const chartColors = [
    colors.blueAccent[500],
    colors.greenAccent[500],
    colors.redAccent[500],
    colors.blueAccent[300]
  ];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsPieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          fill="#8884d8"
          dataKey="value"
          label={({ name, percent }) =>
            `${name} ${(percent * 100).toFixed(0)}%`
          }
        >
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: colors.primary[400],
            border: 'none',
            borderRadius: '8px'
          }}
        />
        <Legend />
      </RechartsPieChart>
    </ResponsiveContainer>
  );
};

export default PieChart;
