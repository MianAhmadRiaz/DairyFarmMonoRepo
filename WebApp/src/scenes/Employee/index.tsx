import React, { useState, useEffect } from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';
import PageContainer from '../../shared/components/Layout/PageContainer';
import { getEmployeeCount } from '../../shared/services/EmployeeAPI/viewemployee.service';

export default function EmployeeDashboard() {
  const [employeeData, setEmployeeData] = useState([
    { value: 0, label: 'Total Employee', icon: '👥' },
    { value: 0, label: 'Total Salary Paid', icon: '💰' },
    { value: 0, label: 'Active Employees', icon: '✅' },
    { value: 0, label: 'Pending Salaries', icon: '⏳' }
  ]);
  const [employeeCount, setEmployeeCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        const count = await getEmployeeCount();

        setEmployeeCount(count);

        setEmployeeData([
          { value: count, label: 'Total Employee', icon: '👥' },
          { value: 0, label: 'Total Salary Paid', icon: '💰' },
          { value: count, label: 'Active Employees', icon: '✅' },
          { value: 0, label: 'Pending Salaries', icon: '⏳' }
        ]);
      } catch (error) {
        console.error('Failed to fetch employee count:', error);
      }
    };

    fetchCount();
  }, []);

  return (
    <PageContainer title="Employee Dashboard">
      <Card sx={{ mb: 3, boxShadow: 3, borderRadius: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              justifyContent: 'start',
              flexWrap: 'wrap'
            }}
          >
            {employeeData &&
              employeeData.map((item, index) => (
                <Card
                  key={index}
                  sx={{
                    width: { xs: '100%', sm: 280, md: 300 },
                    display: 'flex',
                    alignItems: 'center',
                    padding: 2.5,
                    borderRadius: 2,
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    flexShrink: 0,
                    bgcolor: 'background.paper',
                    border: '1px solid #e0e0e0',
                    '&:hover': {
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  <Box
                    sx={{
                      backgroundColor: '#005f73',
                      borderRadius: '50%',
                      width: 60,
                      height: 60,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 28,
                      mr: 3,
                      color: 'white'
                    }}
                  >
                    {item.icon}
                  </Box>
                  <Box>
                    <Typography variant="h4" fontWeight={700} color="#005f73">
                      {item.value.toLocaleString()}
                    </Typography>
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      fontWeight={500}
                    >
                      {item.label}
                    </Typography>
                  </Box>
                </Card>
              ))}
          </Box>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
