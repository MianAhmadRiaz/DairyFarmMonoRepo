import React from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { Box, Typography, useTheme, useMediaQuery } from '@mui/material';

interface DonutChartProps {
  data: { name: string, value: number }[];
  colors: string[];
  height?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({
  data,
  colors,
  height = 250
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const size = isMobile ? 180 : height;

  const totalValue = data?.reduce((sum, item) => sum + item.value, 0) || 0;
  const pregnantValue =
    data?.find(item => item.name === 'Pregnant')?.value || 0;

  return (
    <Box
      sx={{
        position: 'relative',
        width: size,
        height: size,
        margin: '0 auto'
      }}
    >
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          dataKey="value"
          innerRadius={size * 0.25}
          outerRadius={size * 0.4}
          startAngle={90}
          endAngle={-270}
        >
          {data?.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={colors[index]} />
          ))}
        </Pie>
      </PieChart>
    </Box>
  );
};

export default DonutChart;
