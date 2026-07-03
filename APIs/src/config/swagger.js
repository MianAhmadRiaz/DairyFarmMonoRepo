import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Cattle Care Web API',
      version: '1.0.0',
      description: 'Complete API documentation for Cattle Care Management System',
      contact: {
        name: 'API Support',
        email: 'support@cattlecare.com'
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT'
      }
    },
    servers: [
      {
        url: 'http://localhost:2500',
        description: 'Development server'
      },
      {
        url: 'https://api.cattlecare.com',
        description: 'Production server'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'JWT Authorization header using the Bearer scheme. Example: "Authorization: Bearer {token}"'
        }
      },
      schemas: {
        ApiResponse: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 200 },
            success: { type: 'boolean', example: true },
            message: { type: 'string', example: 'Operation completed successfully' },
            type: { type: 'string', example: 'employeeSalaries' },
            data: { type: 'object' }
          }
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            statusCode: { type: 'integer', example: 400 },
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Detailed error description' }
          }
        },
        Employee: {
          type: 'object',
          properties: {
            uuid: { type: 'string', example: 'employee-uuid-123' },
            name: { type: 'string', example: 'John Doe' },
            designation: { type: 'string', example: 'Farm Manager' },
            department: { type: 'string', example: 'Operations' },
            salary: { type: 'number', example: 50000 },
            leave_allow: { type: 'number', example: 2 },
            isDeleted: { type: 'boolean', example: false }
          }
        },
        EmployeeSalary: {
          type: 'object',
          properties: {
            employeeId: { type: 'string', example: 'employee-uuid-123' },
            name: { type: 'string', example: 'John Doe' },
            designation: { type: 'string', example: 'Farm Manager' },
            department: { type: 'string', example: 'Operations' },
            totalDaysInMonth: { type: 'integer', example: 31 },
            allowedLeaves: { type: 'integer', example: 2 },
            workingDays: { type: 'integer', example: 29 },
            presentDays: { type: 'integer', example: 26 },
            absentDays: { type: 'integer', example: 3 },
            leaveDays: { type: 'integer', example: 2 },
            baseSalary: { type: 'number', example: 50000 },
            salaryPerDay: { type: 'number', example: 1724.14 },
            deduction: { type: 'number', example: 5000 },
            bonus: { type: 'number', example: 2000 },
            overtime: { type: 'number', example: 1500 },
            grossSalary: { type: 'number', example: 46327.64 },
            status: { type: 'string', enum: ['paid', 'unpaid', 'calculated'], example: 'calculated' },
            month: { type: 'string', example: '2025-10' }
          }
        },
        AdvanceTransaction: {
          type: 'object',
          properties: {
            employeeId: { type: 'string', example: 'employee-uuid-123' },
            amount: { type: 'number', example: 25000 },
            transaction_date: { type: 'string', format: 'date', example: '2025-10-07' },
            payment_method: { 
              type: 'string', 
              enum: ['cash', 'bank_transfer', 'cheque', 'mobile_payment', 'other'], 
              example: 'cash' 
            },
            reference_number: { type: 'string', example: 'ADV-001' },
            description: { type: 'string', example: 'Emergency advance for medical expenses' },
            deduct_from_salary: { type: 'boolean', example: true },
            deduction_start_month: { type: 'string', example: '2025-11' },
            monthly_deduction_amount: { type: 'number', example: 5000 }
          }
        },
        SalaryInvoice: {
          type: 'object',
          properties: {
            uuid: { type: 'string', example: 'invoice-uuid-123' },
            employee_id: { type: 'string', example: 'employee-uuid-123' },
            name: { type: 'string', example: 'John Doe' },
            month: { type: 'string', example: '2025-10' },
            base_salary: { type: 'number', example: 50000 },
            total_days: { type: 'integer', example: 31 },
            present_days: { type: 'integer', example: 26 },
            absence_days: { type: 'integer', example: 5 },
            deduction: { type: 'number', example: 5000 },
            bonus: { type: 'number', example: 2000 },
            overtime: { type: 'number', example: 1500 },
            gross_salary: { type: 'number', example: 48500 },
            status: { type: 'string', enum: ['paid', 'unpaid'], example: 'unpaid' }
          }
        },
        Pagination: {
          type: 'object',
          properties: {
            page: { type: 'integer', example: 1 },
            totalPages: { type: 'integer', example: 5 },
            limit: { type: 'integer', example: 10 },
            skip: { type: 'integer', example: 0 },
            totalCount: { type: 'integer', example: 45 }
          }
        }
      }
    },
    security: [
      {
        bearerAuth: []
      }
    ]
  },
  apis: [
    // Main swagger documentation file with all endpoints
    './src/swagger-docs/all-endpoints.js',
    './src/swagger-docs/schemas.js',
    
    // All route files
    './src/routes/auth.js',
    './src/routes/admin.js',
    './src/routes/animal.js',
    './src/routes/animalSubCategories.js',
    './src/routes/animalTypes.js',
    './src/routes/attendance.js',
    './src/routes/breedingEvent.js',
    './src/routes/breedTypes.js',
    './src/routes/bull.js',
    './src/routes/company.js',
    './src/routes/dashboard.js',
    './src/routes/department.js',
    './src/routes/employee.js',
    './src/routes/events.js',
    './src/routes/feedFormulation.js',
    './src/routes/medicinceCategory.js',
    './src/routes/milk.js',
    './src/routes/milkCategories.js',
    './src/routes/pen.js',
    './src/routes/permissions.js',
    './src/routes/protocol.js',
    './src/routes/purchaseItem.js',
    './src/routes/requests.js',
    './src/routes/role.js',
    './src/routes/salary.js',
    './src/routes/stockCategory.js',
    './src/routes/stockItem.js',
    './src/routes/StockReports.js',
    './src/routes/stockTransaction.js',
    './src/routes/supplier.js',
    './src/routes/tag.js',
    './src/routes/tasks.js',
    './src/routes/units.js'
  ], // paths to files containing OpenAPI definitions
};

const specs = swaggerJsdoc(options);

export { swaggerUi, specs };