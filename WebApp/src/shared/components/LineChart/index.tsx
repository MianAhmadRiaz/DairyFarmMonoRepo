import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { tokens } from '../../theme/theme';

interface LineChartProps {
  data: Array<{
    name: string,
    value: number
  }>;
}

const LineChart = ({ data }: LineChartProps) => {
  const colors = tokens('dark');

  return (
    <ResponsiveContainer width="100%" height="100%">
      <RechartsLineChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={colors.grey[800]} />
        <XAxis
          dataKey="name"
          stroke={colors.grey[100]}
          style={{ fontSize: '12px' }}
        />
        <YAxis stroke={colors.grey[100]} style={{ fontSize: '12px' }} />
        <Tooltip
          contentStyle={{
            backgroundColor: colors.primary[400],
            border: 'none',
            borderRadius: '8px'
          }}
        />
        <Legend />
        <Line
          type="monotone"
          dataKey="value"
          stroke={colors.blueAccent[500]}
          strokeWidth={2}
          dot={{ fill: colors.blueAccent[500], strokeWidth: 2 }}
          activeDot={{ r: 8 }}
        />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
};

export default LineChart;
