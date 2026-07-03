import { Box, Typography } from '@mui/material';
import { tokens } from '../../theme/theme';

interface StatBoxProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
}

const StatBox = ({ title, value, icon }: StatBoxProps) => {
  const colors = tokens('dark');

  return (
    <Box
      sx={{
        backgroundColor: colors.primary[400],
        p: 2,
        borderRadius: 2,
        boxShadow: 3
      }}
    >
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Typography variant="h6" color={colors.grey[100]}>
            {title}
          </Typography>
          <Typography variant="h3" color={colors.grey[100]} fontWeight="bold">
            {value}
          </Typography>
        </Box>
        <Box>{icon}</Box>
      </Box>
    </Box>
  );
};

export default StatBox;
