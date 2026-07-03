import api from '../../api/AxiosClient';
import { API_CONFIG } from '../apiConfigs';
export interface Employee {
  uuid: string;
  name: string;
}

export interface AttendanceRecord {
  userId: string;
  status: 'present' | 'absent' | 'leave';
}

export interface AttendancePayload {
  date: string;
  data: AttendanceRecord[];
}

export interface MappedAttendance {
  userId: string;
  name: string;
  designation: string;
  department: string;
  attendance: {
    attendanceId: string,
    date: string,
    status: 'present' | 'absent' | 'leave'
  }[];
}

export const getAllEmployees = async (): Promise<Employee[]> => {
  const response = await api.get(API_CONFIG.employee.get);
  return response.data.data.Employees;
};

export const addAttendance = async (payload: AttendancePayload) => {
  const response = await api.post(API_CONFIG.attendance.add, payload);
  return response.data;
};

export const getAttendance = async (startDate: string, endDate: string) => {
  const response = await api.get(
    `${API_CONFIG.attendance.get}?startDate=${startDate}&endDate=${endDate}`
  );

  const mappedData = response.data.data.attendance.map((emp: any) => ({
    userId: emp.employee_id,
    name: emp.employee_name,
    designation: emp.designation,
    department: emp.department,
    attendance: emp.attendance.map((att: any) => ({
      attendanceId: att.attendance_id,
      date: att.date,
      status: att.status
    }))
  }));

  return mappedData;
};

function getLastDayOfMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

export const getAttendanceSummary = async (
  employeeId: string,
  month: string
) => {
  const [yearStr, monthStr] = month.split('-');
  const year = parseInt(yearStr, 10);
  const monthNum = parseInt(monthStr, 10);

  const lastDay = getLastDayOfMonth(year, monthNum);

  const startDate = `${year}-${String(monthNum).padStart(2, '0')}-01`;
  const endDate = `${year}-${String(monthNum).padStart(2, '0')}-${lastDay}`;

  console.log(
    'Fetching attendance summary with:',
    employeeId,
    startDate,
    endDate
  );

  const response = await api.get(
    `${API_CONFIG.attendance.get}?startDate=${startDate}&endDate=${endDate}`
  );

  const emp = response.data.data.attendance.find(
    (e: any) => e.employee_id === employeeId
  );

  if (!emp) {
    return { present: 0, absent: 0 };
  }

  let present = 0;
  let absent = 0;

  emp.attendance.forEach((att: any) => {
    if (att.status === 'present') present++;
    if (att.status === 'absent') absent++;
  });

  return { present, absent };
};

// Update attendance record
export interface UpdateAttendancePayload {
  attendanceId: string;
  status: 'present' | 'absent' | 'leave';
  remarks?: string;
}

export const updateAttendance = async (payload: UpdateAttendancePayload) => {
  try {
    const response = await api.put(API_CONFIG.attendance.get, payload);
    return response.data;
  } catch (error) {
    console.error('Error updating attendance:', error);
    throw error;
  }
};

// Delete attendance record
export const deleteAttendance = async (attendanceId: string) => {
  try {
    const response = await api.delete(
      `${API_CONFIG.attendance.get}?attendanceId=${attendanceId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting attendance:', error);
    throw error;
  }
};
