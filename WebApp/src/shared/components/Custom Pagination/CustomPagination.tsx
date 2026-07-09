import React from 'react';
import { Box, Pagination, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CustomPaginationProps {
  totalItems: number; // Total number of items
  itemsPerPage: number; // Number of items per page
  currentPage: number; // Current page number
  onPageChange: (event: React.ChangeEvent<unknown>, page: number) => void; // Function to handle page change
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
  totalItems,
  itemsPerPage,
  currentPage,
  onPageChange
}) => {
  const { t } = useTranslation();
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '20px'
      }}
    >
      <Typography variant="body2" color="textSecondary" marginLeft={2}>
        {t('shared.customPagination.rowsPerPage', { count: itemsPerPage })}
      </Typography>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={onPageChange}
        variant="outlined"
        shape="rounded"
      />
    </Box>
  );
};

export default CustomPagination;
