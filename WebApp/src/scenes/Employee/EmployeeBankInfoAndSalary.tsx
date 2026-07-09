import React, { useEffect, useMemo, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress
} from '@mui/material';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RedeemIcon from '@mui/icons-material/Redeem';
import {
  getSalaryRecords,
  SalaryRecord
} from '../../shared/services/EmployeeAPI/salary.service';
import {
  getEmployeeById,
  GetEmployeeResponse
} from '../../shared/services/EmployeeAPI/viewemployee.service';
import { useTranslation } from 'react-i18next';

interface BankInfoAndSalaryProps {
  employeeId?: string;
}

const BankInfoAndSalary: React.FC<BankInfoAndSalaryProps> = ({ employeeId }) => {
  const { t } = useTranslation();
  const [records, setRecords] = useState<SalaryRecord[]>([]);
  const [employee, setEmployee] = useState<GetEmployeeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const [allRecords, emp] = await Promise.all([
          getSalaryRecords(),
          employeeId ? getEmployeeById(employeeId) : Promise.resolve(null)
        ]);
        if (!active) return;
        setRecords(
          employeeId
            ? allRecords.filter((r) => r.employee_id === employeeId)
            : allRecords
        );
        setEmployee(emp);
      } catch (error) {
        console.error('Failed to load bank/salary info', error);
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [employeeId]);

  const summaryData = useMemo(() => {
    const totalReceived = records.reduce(
      (sum, r) => sum + (Number(r.gross_salary) || 0),
      0
    );
    const totalBonus = records.reduce(
      (sum, r) => sum + (Number(r.bonus) || 0),
      0
    );
    return [
      {
        label: t('employee.bankInfoAndSalary.totalNumberOfSalaries'),
        value: String(records.length),
        icon: <AccountBalanceWalletIcon color="primary" />
      },
      {
        label: t('employee.bankInfoAndSalary.totalGrossSalary'),
        value: totalReceived.toLocaleString(),
        icon: <AttachMoneyIcon color="success" />
      },
      {
        label: t('employee.bankInfoAndSalary.bonusAmount'),
        value: totalBonus.toLocaleString(),
        icon: <RedeemIcon color="warning" />
      }
    ];
  }, [records, t]);

  const bonusRecords = useMemo(
    () => records.filter((r) => Number(r.bonus) > 0),
    [records]
  );

  if (loading) {
    return (
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      {/* Bank Info and Summary Cards */}
      <Grid container spacing={2} mb={3}>
        {/* Bank Info Card */}
        <Grid item xs={12} md={3}>
          <Card sx={{ height: '150%' }}>
            <CardContent>
              <Typography fontWeight="bold">{t('employee.bankInfoAndSalary.bankInfo')}</Typography>
              <Typography variant="body2" mt={1}>
                {t('employee.common.accountTitle')}
              </Typography>
              <Typography>{employee?.name || '-'}</Typography>
              <Typography variant="body2" mt={1}>
                {t('employee.addNewEmployee.fields.accountNumber')}
              </Typography>
              <Typography>{employee?.acc_no || '-'}</Typography>
              <Typography variant="body2" mt={1}>
                {t('employee.editProfessionalInfo.monthlySalary')}
              </Typography>
              <Typography>{employee?.salary ?? '-'}</Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Summary Cards */}
        {summaryData.map((item, idx) => (
          <Grid item xs={12} sm={4} md={3} key={idx}>
            <Card
              sx={{
                borderRadius: 3,
                textAlign: 'center',
                py: 2,
                boxShadow: '0px 2px 8px rgba(0,0,0,0.05)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}
            >
              <Box mb={1}>{item.icon}</Box>
              <Typography variant="body2" color="textSecondary">
                {item.label}
              </Typography>
              <Typography fontWeight="bold" fontSize="1.2rem">
                {item.value}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Salary History */}
      <Card sx={{ mb: 3, borderRadius: '12px' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {t('employee.bankInfoAndSalary.salaryHistory')}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'lightgray' }}>
                <TableCell>{t('employee.common.date')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.monthOf')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.grossSalary')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.presentDays')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.deduction')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.bonus')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    {t('employee.bankInfoAndSalary.noSalaryRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                records.map((r, i) => (
                  <TableRow key={r.invoiceId || i}>
                    <TableCell>{r.date ? r.date.slice(0, 10) : '-'}</TableCell>
                    <TableCell>{r.month || '-'}</TableCell>
                    <TableCell>{r.gross_salary ?? '-'}</TableCell>
                    <TableCell>{r.present_days ?? '-'}</TableCell>
                    <TableCell>{r.deduction ?? '-'}</TableCell>
                    <TableCell>{r.bonus ?? '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Bonus History */}
      <Card sx={{ borderRadius: '12px' }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" mb={2}>
            {t('employee.bankInfoAndSalary.bonusHistory')}
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'lightgray' }}>
                <TableCell>{t('employee.common.date')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.monthOf')}</TableCell>
                <TableCell>{t('employee.bankInfoAndSalary.bonusAmount')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {bonusRecords.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    {t('employee.bankInfoAndSalary.noBonusRecords')}
                  </TableCell>
                </TableRow>
              ) : (
                bonusRecords.map((r, i) => (
                  <TableRow key={r.invoiceId || i}>
                    <TableCell>{r.date ? r.date.slice(0, 10) : '-'}</TableCell>
                    <TableCell>{r.month || '-'}</TableCell>
                    <TableCell>{r.bonus}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </Box>
  );
};

export default BankInfoAndSalary;
