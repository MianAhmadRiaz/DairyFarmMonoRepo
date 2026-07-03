# Feeding Module API Documentation

## Overview
The Feeding Module provides comprehensive feed management functionality for dairy farm operations, including recipe creation, feeding schedules, stock management, and reporting.

## Database Models

### 1. Shed Model (`src/models/shed.js`)
- **Purpose**: Manages shed containers that house multiple pens
- **Key Fields**: 
  - `name`, `shed_type` (enum), `location`, `capacity`
  - Relationships: belongs to Farm, has many Pens
- **Shed Types**: lactating_cows, dry_cows, heifers, calves, bulls, isolation, maternity

### 2. RecipeGroup Model (`src/models/recipeGroup.js`)
- **Purpose**: Categorizes feed recipes by animal type and nutritional focus
- **Key Fields**: 
  - `name`, `animal_category` (enum), `nutritional_focus` (enum)
  - Relationships: belongs to Farm, has many FeedFormulations
- **Categories**: lactating_cows, dry_cows, heifers, calves, bulls, general
- **Focus Areas**: high_protein, high_energy, milk_production, weight_gain, maintenance, reproduction

### 3. FeedBrand Model (`src/models/feedBrand.js`)
- **Purpose**: Manages commercial feed products and brands
- **Key Fields**: 
  - `brand_name`, `product_name`, `brand_type` (enum), nutritional content
  - Relationships: belongs to Farm
- **Brand Types**: commercial, concentrate, premix, supplement

### 4. FeedingSchedule Model (`src/models/feedingSchedule.js`)
- **Purpose**: Tracks feeding schedules and execution
- **Key Fields**: 
  - `feeding_date`, `meal_time`, `animal_count`, `planned_quantity`, `actual_quantity`
  - `feeding_status`, `stock_deducted`
  - Relationships: belongs to Shed, Pen, FeedFormulation

### 5. Enhanced Models
- **Pen Model**: Added `shedId`, `capacity`, `pen_type`
- **FeedFormulation Model**: Added `recipeGroupId`, `target_animal_count`, `cost_per_kg`, `nutritional_notes`, `is_default`

## API Endpoints

### Recipe Group Management

#### GET `/api/v1/feeding/recipe-groups`
- **Purpose**: Fetch recipe groups with optional filtering
- **Query Parameters**: 
  - `limit`, `page` (pagination)
  - `groupId` (specific group details)
- **Response**: List of recipe groups with recipe counts

#### POST `/api/v1/feeding/recipe-groups`
- **Purpose**: Create new recipe group
- **Body**: `{ name, description, animal_category, nutritional_focus }`
- **Validation**: Unique name per farm, valid enum values

### Recipe Management

#### GET `/api/v1/feeding/recipes`
- **Purpose**: Fetch recipes with filtering and detailed ingredients
- **Query Parameters**: 
  - `limit`, `page` (pagination)
  - `recipeId` (specific recipe details)
  - `groupId`, `animal_category`, `is_default` (filtering)
- **Response**: Recipes with ingredients, costs, and nutritional info

#### POST `/api/v1/feeding/recipes`
- **Purpose**: Create new feed recipe
- **Body**: 
```json
{
  "name": "High Protein Lactating Recipe",
  "description": "Recipe for high-producing lactating cows",
  "recipeGroupId": "uuid",
  "target_animal_count": 50,
  "cost_per_kg": 15.50,
  "nutritional_notes": "22% protein, 1.5 Mcal/kg",
  "is_default": false,
  "ingredients": [
    {
      "stockItemId": "uuid",
      "percentage": 45.0,
      "quantity": 100,
      "cost": 12.50,
      "notes": "Primary protein source"
    }
  ]
}
```
- **Validation**: Total ingredient percentage = 100%, valid stock items

### Feed Ingredient Management

#### GET `/api/v1/feeding/ingredients`
- **Purpose**: Fetch available feed ingredients (stock items)
- **Query Parameters**: 
  - `limit`, `page` (pagination)
  - `category` (filter by stock category)
  - `available_only` (only items with stock)
- **Response**: Stock items with current levels and availability

### Pen and Animal Information

#### GET `/api/v1/feeding/pens-with-animals`
- **Purpose**: Fetch pens with current animal counts for feeding calculations
- **Query Parameters**: 
  - `limit`, `page` (pagination)
  - `shedId` (filter by shed)
  - `pen_type` (filter by pen type)
- **Response**: Pens with animal counts, shed info, and animal details

### Feeding Application

#### POST `/api/v1/feeding/apply-recipe-shed`
- **Purpose**: Apply feed recipe to entire shed with automatic calculations
- **Body**: 
```json
{
  "shedId": "uuid",
  "recipeId": "uuid",
  "feeding_date": "2024-01-15",
  "meal_time": "morning",
  "quantity_per_animal": 5.0,
  "auto_calculate": true,
  "apply_to_pens": [],
  "notes": "Regular morning feeding"
}
```
- **Features**: 
  - Automatic animal counting
  - Stock availability checking
  - Automatic stock deduction
  - Transaction logging

#### POST `/api/v1/feeding/apply-recipe-adjustable-shed`
- **Purpose**: Apply feed recipe with custom quantities per pen
- **Body**: 
```json
{
  "shedId": "uuid",
  "recipeId": "uuid",
  "feeding_date": "2024-01-15",
  "meal_time": "morning",
  "pen_adjustments": [
    {
      "penId": "uuid",
      "custom_quantity": 75.0,
      "custom_animal_count": 15
    }
  ],
  "notes": "Custom feeding with adjusted quantities"
}
```
- **Features**: 
  - Pen-specific quantity adjustments
  - Custom animal counts
  - Detailed tracking of adjustments

### Feeding Reports

#### GET `/api/v1/feeding/shed-feed-report`
- **Purpose**: Comprehensive feeding report for specific shed
- **Query Parameters**: 
  - `shedId`, `start_date`, `end_date`
  - `meal_time`, `feeding_status`
  - `limit`, `page` (pagination)
- **Response**: Detailed feeding schedules with animals, costs, and completion rates

#### GET `/api/v1/feeding/date-wise-feed-report`
- **Purpose**: Aggregated feeding report by date, shed, or recipe
- **Query Parameters**: 
  - `start_date`, `end_date` (required)
  - `groupBy` (date, shed, recipe)
  - `shedId`, `meal_time` (filtering)
- **Response**: Grouped feeding data with summaries and ingredient usage

#### GET `/api/v1/feeding/shed-feed-stock-print`
- **Purpose**: Print-ready feeding schedule with stock requirements
- **Query Parameters**: 
  - `shedId`, `feeding_date` (required)
  - `meal_time`, `includeIngredients`
- **Response**: Formatted data for printing feeding schedules and stock lists

## Key Features

### 1. Intelligent Feeding System
- **Automatic Animal Counting**: Real-time pen animal counts
- **Stock Integration**: Automatic stock checking and deduction
- **Cost Calculation**: Real-time feed cost calculations
- **Recipe Validation**: Ingredient percentage validation

### 2. Flexible Recipe Management
- **Recipe Groups**: Organize recipes by animal category and nutritional focus
- **Default Recipes**: Mark commonly used recipes as defaults
- **Ingredient Tracking**: Detailed ingredient composition and costs
- **Nutritional Notes**: Store feeding guidelines and nutritional information

### 3. Advanced Feeding Applications
- **Auto-Calculate Mode**: Automatic quantity calculation based on animal counts
- **Adjustable Mode**: Custom quantities per pen with tracking
- **Stock Safety**: Pre-feeding stock availability checks
- **Transaction Logging**: Complete audit trail of stock movements

### 4. Comprehensive Reporting
- **Shed Reports**: Detailed feeding history with animal and cost tracking
- **Date-wise Reports**: Aggregated data with multiple grouping options
- **Print-ready Formats**: Formatted data for feeding schedules and stock lists
- **Ingredient Usage**: Track ingredient consumption patterns

### 5. Data Integrity
- **Transaction Safety**: Database transactions for data consistency
- **Stock Validation**: Real-time stock level checking
- **Permission Control**: Farm-level data isolation
- **Audit Trail**: Complete tracking of feeding activities

## Usage Examples

### 1. Create Recipe Group and Recipe
```javascript
// 1. Create recipe group
POST /api/v1/feeding/recipe-groups
{
  "name": "Lactating Cow High Production",
  "animal_category": "lactating_cows",
  "nutritional_focus": "milk_production"
}

// 2. Create recipe
POST /api/v1/feeding/recipes
{
  "name": "High Energy Lactation Mix",
  "recipeGroupId": "group-uuid",
  "ingredients": [
    { "stockItemId": "corn-uuid", "percentage": 40 },
    { "stockItemId": "soybean-uuid", "percentage": 25 },
    { "stockItemId": "alfalfa-uuid", "percentage": 35 }
  ]
}
```

### 2. Apply Feeding to Shed
```javascript
// Apply recipe to entire shed
POST /api/v1/feeding/apply-recipe-shed
{
  "shedId": "shed-uuid",
  "recipeId": "recipe-uuid",
  "feeding_date": "2024-01-15",
  "meal_time": "morning",
  "quantity_per_animal": 5.0,
  "auto_calculate": true
}
```

### 3. Generate Reports
```javascript
// Get shed feeding report
GET /api/v1/feeding/shed-feed-report?shedId=uuid&start_date=2024-01-01&end_date=2024-01-31

// Get date-wise aggregated report
GET /api/v1/feeding/date-wise-feed-report?start_date=2024-01-01&end_date=2024-01-31&groupBy=date
```

## Error Handling
All endpoints include comprehensive error handling for:
- Invalid UUIDs and data validation
- Insufficient stock scenarios
- Unauthorized access attempts
- Missing required fields
- Database constraint violations

## Security
- JWT authentication required for all endpoints
- Farm-level data isolation
- User permission validation
- Audit logging for all operations