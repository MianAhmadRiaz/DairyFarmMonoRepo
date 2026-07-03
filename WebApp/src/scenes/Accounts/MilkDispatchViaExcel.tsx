import React from 'react';
import { Box, Paper, Typography, useTheme } from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';

export default function MilkDispatchViaExcel() {
  const theme = useTheme();

  return (
    <PageContainer title="Milk Dispatch Via Excel">
        {/* Main Card */}
        <Paper
          elevation={0}
          sx={{
            p: 0,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper'
          }}
        >
          {/* Light Header - matching AddAnimal screen style */}
          <Box
            sx={{
              bgcolor: '#F4F8F7',
              color: '#005f73',
              px: 2.5,
              py: 1.5,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid #E0E0E0'
            }}
          >
            <Typography
              variant="h6"
              fontWeight={600}
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <Box component="span" sx={{ mr: 1 }}>
                📊
              </Box>
              Milk Dispatch Via Excel
            </Typography>
          </Box>

          {/* Coming Soon Content */}
          <Box
            sx={{
              p: 10,
              bgcolor: '#F4F8F7',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}
          >
            <Typography
              variant="h3"
              fontWeight="bold"
              sx={{
                color: '#005f73',
                textAlign: 'center'
              }}
            >
              Coming Soon
            </Typography>
          </Box>
        </Paper>
    </PageContainer>
  );
}
