import React from 'react';
import { Route, Routes } from 'react-router-dom';
import EmployeeDashboard from '../scenes/Employee';
import AddNewEmployee from '../scenes/Employee/AddNewEmployee';
import ViewEmployee from '../scenes/Employee/ViewEmployee';
import GenerateSalary from '../scenes/Employee/GenerateSalary';
import ViewGenerateSalary from '../scenes/Employee/ViewGenerateSalary';
import UnpaidSalary from '../scenes/Employee/UnpaidSalary';
import ViewPaidIncome from '../scenes/Employee/ViewPaidIncome';
import AddAdvance from '../scenes/Employee/AddAdvance';
import EditAdvance from '../scenes/Employee/EditAdvance';
import ViewAdvance from '../scenes/Employee/ViewAdvance';
import ReceiveAdvance from '../scenes/Employee/ReceiveAdvance';
import Attendance from '../scenes/Employee/Attendance';
import AttendanceReport from '../scenes/Employee/ViewAttendanceReport';
import EmployeeProfile from '../scenes/Employee/EmployeeProfile';
import Roles from '../scenes/Employee/Roles';
import RoleManagement from '../scenes/Employee/RoleManagement';
import UserManagement from '../scenes/Employee/UserManagement';

const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route path="/employee/dashboard" element={<EmployeeDashboard />} />

      <Route path="/employee/new" element={<AddNewEmployee />} />
      <Route path="/employee/view/employee" element={<ViewEmployee />} />
      <Route path="/employee/generate-salary" element={<GenerateSalary />} />
      <Route
        path="/employee/view/generate-salary"
        element={<ViewGenerateSalary />}
      />
      <Route path="/employee/unpaid-salary" element={<UnpaidSalary />} />
      <Route path="/employee/view/paid-income" element={<ViewPaidIncome />} />
      <Route path="/employee/add-advance" element={<AddAdvance />} />
      <Route path="/employee/edit-advance" element={<EditAdvance />} />
      <Route path="/employee/view-advance" element={<ViewAdvance />} />
      <Route path="/employee/receive-advance" element={<ReceiveAdvance />} />
      <Route path="/employee/attendance" element={<Attendance />} />
      <Route
        path="/employee/view-attendance-report"
        element={<AttendanceReport />}
      />
      <Route path="/employee/profile/:id" element={<EmployeeProfile />} />
      <Route path="/employee/roles" element={<Roles />} />
      <Route path="/employee/role-management" element={<RoleManagement />} />
      <Route path="/employee/user-management" element={<UserManagement />} />
    </Routes>
  );
};

export default EmployeeRoutes;
