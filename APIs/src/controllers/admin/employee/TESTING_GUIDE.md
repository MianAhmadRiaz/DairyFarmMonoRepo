# Employee Dashboard API Test Instructions

## Prerequisites
1. Ensure the server is running
2. Have a valid JWT token for authentication
3. Make sure you have employee data in your database

## Testing with cURL (PowerShell)
```powershell
# Replace 'your-jwt-token' with actual token
$headers = @{
    'Authorization' = 'Bearer your-jwt-token'
    'Content-Type' = 'application/json'
}

Invoke-RestMethod -Uri 'http://localhost:3000/api/employees/dashboard' -Method GET -Headers $headers
```

## Testing with Postman
1. **Method**: GET
2. **URL**: `http://localhost:3000/api/employees/dashboard`
3. **Headers**: 
   - Authorization: `Bearer your-jwt-token`
   - Content-Type: `application/json`

## Expected Response Structure
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Employee dashboard data fetched successfully.",
  "type": "employeeDashboard",
  "data": {
    "summary": {
      "totalEmployees": 25,
      "totalSalaryPaidPKR": 750000.00,
      "currentYearSalaryPaidPKR": 180000.00,
      "pendingSalariesAmountPKR": 45000.00,
      "totalAdvanceAmountPKR": 15000.00
    },
    "todayAttendance": {
      "present": 20,
      "absent": 3,
      "onLeave": 1,
      "notMarked": 1,
      "attendancePercentage": 80
    },
    "salaryMetrics": {
      "employeesWithPendingSalaries": 5,
      "employeesWithAdvanceCount": 3,
      "averageSalaryPerEmployee": 30000
    },
    "financialInsights": {
      "monthlySalaryCost": 725000.00,
      "salaryExpensePercentage": 0,
      "avgAdvancePerEmployee": 5000,
      "cashFlowImpact": {
        "totalOutflow": 765000,
        "pendingOutflow": 45000,
        "monthlyCommitment": 725000
      }
    },
    "insights": {
      "productivity": {
        "attendanceRate": 80,
        "leaveRate": 4,
        "absenteeismRate": 12
      },
      "financial": {
        "salaryPerEmployee": 29000,
        "advanceUtilization": 12,
        "pendingSalaryRatio": 6
      }
    }
  }
}
```

## Test Scenarios
1. **Empty Database**: Should return zeros for all metrics
2. **With Employees but No Attendance**: Should show employee count but zero attendance
3. **With Full Data**: Should show comprehensive metrics
4. **Different Farm IDs**: Should only show data for the authenticated user's farm
