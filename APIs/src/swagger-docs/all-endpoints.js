/**
 * @swagger
 * tags:
 *   - name: Authentication
 *     description: User authentication and authorization
 *   - name: Animals
 *     description: Animal management and tracking
 *   - name: Employees
 *     description: Employee management and HR
 *   - name: Attendance
 *     description: Employee attendance tracking
 *   - name: Salary Management
 *     description: Salary, advances, and payroll management
 *   - name: Milk Management
 *     description: Milk production, sessions, and analytics
 *   - name: Breeding
 *     description: Breeding events and management
 *   - name: Bulls
 *     description: Bull management and breeding records
 *   - name: Feed Management
 *     description: Feed formulations and nutrition
 *   - name: Stock Management
 *     description: Inventory and stock tracking
 *   - name: Purchases
 *     description: Purchase items and procurement
 *   - name: Suppliers
 *     description: Supplier management
 *   - name: Medicine
 *     description: Medicine categories and health management
 *   - name: Pens
 *     description: Pen management and animal housing
 *   - name: Tags
 *     description: Animal tagging system
 *   - name: Tasks
 *     description: Task management and assignments
 *   - name: Events
 *     description: Farm events and activities
 *   - name: Protocols
 *     description: Health and management protocols
 *   - name: Reports
 *     description: Various reports and analytics
 *   - name: Dashboard
 *     description: Dashboard metrics and summaries
 *   - name: Administration
 *     description: Admin functions and system management
 *   - name: Companies
 *     description: Company and farm management
 *   - name: Departments
 *     description: Department management
 *   - name: Roles & Permissions
 *     description: User roles and permission management
 *   - name: Units
 *     description: Units of measurement
 */

/**
 * @swagger
 * /api/v1/bulls:
 *   get:
 *     summary: Get all bulls
 *     tags: [Bulls]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *     responses:
 *       200:
 *         description: Bulls fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   post:
 *     summary: Add new bull
 *     tags: [Bulls]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - breed
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Thunder"
 *               breed:
 *                 type: string
 *                 example: "Holstein"
 *               age:
 *                 type: integer
 *                 example: 4
 *               weight:
 *                 type: number
 *                 example: 800
 *     responses:
 *       201:
 *         description: Bull added successfully
 *
 * /api/v1/breedingEvent:
 *   get:
 *     summary: Get breeding events
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Breeding events fetched successfully
 *   post:
 *     summary: Create breeding event
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - animalId
 *               - bullId
 *               - breedingDate
 *             properties:
 *               animalId:
 *                 type: string
 *               bullId:
 *                 type: string
 *               breedingDate:
 *                 type: string
 *                 format: date
 *               method:
 *                 type: string
 *                 enum: [natural, artificial]
 *     responses:
 *       201:
 *         description: Breeding event created successfully
 *
 * /api/v1/breedTypes:
 *   get:
 *     summary: Get breed types
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Breed types fetched successfully
 *   post:
 *     summary: Add breed type
 *     tags: [Breeding]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Holstein Friesian"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Breed type added successfully
 *
 * /api/v1/feedFormulation:
 *   get:
 *     summary: Get feed formulations
 *     tags: [Feed Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Feed formulations fetched successfully
 *   post:
 *     summary: Create feed formulation
 *     tags: [Feed Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - ingredients
 *             properties:
 *               name:
 *                 type: string
 *                 example: "High Protein Mix"
 *               ingredients:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                     quantity:
 *                       type: number
 *                     unit:
 *                       type: string
 *     responses:
 *       201:
 *         description: Feed formulation created successfully
 *
 * /api/v1/stockCategory:
 *   get:
 *     summary: Get stock categories
 *     tags: [Stock Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Stock categories fetched successfully
 *   post:
 *     summary: Add stock category
 *     tags: [Stock Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Feed & Nutrition"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock category added successfully
 *
 * /api/v1/stockItem:
 *   get:
 *     summary: Get stock items
 *     tags: [Stock Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: categoryId
 *         schema:
 *           type: string
 *         description: Filter by category
 *     responses:
 *       200:
 *         description: Stock items fetched successfully
 *   post:
 *     summary: Add stock item
 *     tags: [Stock Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *               - quantity
 *               - unit
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Wheat Bran"
 *               categoryId:
 *                 type: string
 *               quantity:
 *                 type: number
 *                 example: 100
 *               unit:
 *                 type: string
 *                 example: "kg"
 *               minimumLevel:
 *                 type: number
 *                 example: 20
 *     responses:
 *       201:
 *         description: Stock item added successfully
 *
 * /api/v1/stockTransaction:
 *   get:
 *     summary: Get stock transactions
 *     tags: [Stock Management]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: itemId
 *         schema:
 *           type: string
 *       - in: query
 *         name: transactionType
 *         schema:
 *           type: string
 *           enum: [in, out]
 *     responses:
 *       200:
 *         description: Stock transactions fetched successfully
 *   post:
 *     summary: Record stock transaction
 *     tags: [Stock Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *               - quantity
 *               - transactionType
 *             properties:
 *               itemId:
 *                 type: string
 *               quantity:
 *                 type: number
 *               transactionType:
 *                 type: string
 *                 enum: [in, out]
 *               remarks:
 *                 type: string
 *     responses:
 *       201:
 *         description: Stock transaction recorded successfully
 *
 * /api/v1/purchaseItem:
 *   get:
 *     summary: Get purchase items
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Purchase items fetched successfully
 *   post:
 *     summary: Record purchase
 *     tags: [Purchases]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemName
 *               - quantity
 *               - unitPrice
 *               - supplierId
 *             properties:
 *               itemName:
 *                 type: string
 *               quantity:
 *                 type: number
 *               unitPrice:
 *                 type: number
 *               supplierId:
 *                 type: string
 *               purchaseDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Purchase recorded successfully
 *
 * /api/v1/supplier:
 *   get:
 *     summary: Get suppliers
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Suppliers fetched successfully
 *   post:
 *     summary: Add supplier
 *     tags: [Suppliers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - contactPerson
 *               - phone
 *             properties:
 *               name:
 *                 type: string
 *                 example: "ABC Feed Suppliers"
 *               contactPerson:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *               address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Supplier added successfully
 *
 * /api/v1/medicinceCategory:
 *   get:
 *     summary: Get medicine categories
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Medicine categories fetched successfully
 *   post:
 *     summary: Add medicine category
 *     tags: [Medicine]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Antibiotics"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Medicine category added successfully
 *
 * /api/v1/pen:
 *   get:
 *     summary: Get pens
 *     tags: [Pens]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Pens fetched successfully
 *   post:
 *     summary: Add pen
 *     tags: [Pens]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Pen A1"
 *               capacity:
 *                 type: integer
 *                 example: 20
 *               location:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pen added successfully
 *
 * /api/v1/tag:
 *   get:
 *     summary: Get tags
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tags fetched successfully
 *   post:
 *     summary: Create tag
 *     tags: [Tags]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagId
 *               - animalId
 *             properties:
 *               tagId:
 *                 type: string
 *                 example: "TAG-001"
 *               animalId:
 *                 type: string
 *               color:
 *                 type: string
 *               type:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag created successfully
 *
 * /api/v1/tasks:
 *   get:
 *     summary: Get tasks
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: assignedTo
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, in_progress, completed]
 *     responses:
 *       200:
 *         description: Tasks fetched successfully
 *   post:
 *     summary: Create task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - assignedTo
 *               - dueDate
 *             properties:
 *               title:
 *                 type: string
 *                 example: "Clean barn area"
 *               description:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               dueDate:
 *                 type: string
 *                 format: date
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Task created successfully
 *
 * /api/v1/events:
 *   get:
 *     summary: Get events
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Events fetched successfully
 *   post:
 *     summary: Create event
 *     tags: [Events]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - eventDate
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               eventDate:
 *                 type: string
 *                 format: date
 *               eventType:
 *                 type: string
 *     responses:
 *       201:
 *         description: Event created successfully
 *
 * /api/v1/protocol:
 *   get:
 *     summary: Get protocols
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Protocols fetched successfully
 *   post:
 *     summary: Create protocol
 *     tags: [Protocols]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - steps
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Vaccination Protocol"
 *               description:
 *                 type: string
 *               steps:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     stepNumber:
 *                       type: integer
 *                     description:
 *                       type: string
 *     responses:
 *       201:
 *         description: Protocol created successfully
 *
 * /api/v1/dashboard:
 *   get:
 *     summary: Get dashboard metrics
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/ApiResponse'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         totalAnimals:
 *                           type: integer
 *                         totalMilkToday:
 *                           type: number
 *                         totalEmployees:
 *                           type: integer
 *                         pendingTasks:
 *                           type: integer
 *
 * /api/v1/company:
 *   get:
 *     summary: Get companies
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Companies fetched successfully
 *   post:
 *     summary: Add company
 *     tags: [Companies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               phone:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Company added successfully
 *
 * /api/v1/department:
 *   get:
 *     summary: Get departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Departments fetched successfully
 *   post:
 *     summary: Add department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Operations"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Department added successfully
 *
 * /api/v1/role:
 *   get:
 *     summary: Get roles
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles fetched successfully
 *   post:
 *     summary: Create role
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Farm Manager"
 *               description:
 *                 type: string
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       201:
 *         description: Role created successfully
 *
 * /api/v1/permissions:
 *   get:
 *     summary: Get permissions
 *     tags: [Roles & Permissions]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Permissions fetched successfully
 *
 * /api/v1/units:
 *   get:
 *     summary: Get units of measurement
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Units fetched successfully
 *   post:
 *     summary: Add unit of measurement
 *     tags: [Units]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - symbol
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Kilogram"
 *               symbol:
 *                 type: string
 *                 example: "kg"
 *               type:
 *                 type: string
 *                 enum: [weight, volume, length, time]
 *     responses:
 *       201:
 *         description: Unit added successfully
 *
 * /api/v1/StockReports:
 *   get:
 *     summary: Get stock reports
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: reportType
 *         schema:
 *           type: string
 *           enum: [inventory, low_stock, transactions]
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *     responses:
 *       200:
 *         description: Stock reports fetched successfully
 *
 * /api/v1/requests:
 *   get:
 *     summary: Get requests
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, approved, rejected]
 *     responses:
 *       200:
 *         description: Requests fetched successfully
 *   post:
 *     summary: Create request
 *     tags: [Administration]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - description
 *             properties:
 *               type:
 *                 type: string
 *                 example: "leave_request"
 *               description:
 *                 type: string
 *               requestedBy:
 *                 type: string
 *               urgency:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Request created successfully
 *
 * /api/v1/animalSubCategories:
 *   get:
 *     summary: Get animal sub-categories
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Animal sub-categories fetched successfully
 *   post:
 *     summary: Add animal sub-category
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Dairy Cows"
 *               categoryId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Animal sub-category added successfully
 *
 * /api/v1/animalTypes:
 *   get:
 *     summary: Get animal types
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Animal types fetched successfully
 *   post:
 *     summary: Add animal type
 *     tags: [Animals]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Cattle"
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Animal type added successfully
 *
 * /api/v1/milkCategories:
 *   get:
 *     summary: Get milk categories
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Milk categories fetched successfully
 *   post:
 *     summary: Add milk category
 *     tags: [Milk Management]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Grade"
 *               description:
 *                 type: string
 *               fatContent:
 *                 type: number
 *                 example: 3.5
 *     responses:
 *       201:
 *         description: Milk category added successfully
 */