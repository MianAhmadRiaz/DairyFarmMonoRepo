# Farm Seed Data Guide

This guide explains the comprehensive test data seeded by `seedFarmData.js` for testing the CattleCare application.

## Overview

The seed script creates a complete, realistic farm environment with:
- **1 Test Farm**: Riverdale Dairy Farm
- **7 Test Users**: With all role types and permission levels
- **25 Animals**: Across all lifecycle stages
- **5 Sheds**: Organized by animal type
- **10 Pens**: Within sheds, with appropriate capacity
- **240 Milk Records**: 2-year production history
- **15 Tags**: For animal identification
- **4 Calving Events**: Historical breeding events

## Running the Seeder

```bash
# Option 1: Run directly
node src/seeders/seedFarmData.js

# Option 2: Integrate into boot sequence
# Add to your startup script or app initialization
import seedFarmData from './seeders/seedFarmData.js';
await seedFarmData();
```

## Test Users & Credentials

All users share the default password: **`Test@1234`**

### Roles & Permissions Matrix

| Email | Role | Permissions | Use Case |
|-------|------|-------------|----------|
| `owner@riverdale.com` | Farm Owner | All permissions | Full system access, billing, employee management |
| `manager@riverdale.com` | Manager | All except billing | Oversee operations, manage animals & records |
| `vet@riverdale.com` | Veterinarian | Animals, health, breeding | Medical records, health status, breeding decisions |
| `milking@riverdale.com` | Milking Staff | Animals, milking | Record milk production, handle animals |
| `breeding@riverdale.com` | Breeding Specialist | Breeding, animals | Manage breeding programs and genetics |
| `worker1@riverdale.com` | Farm Worker | Animals, attendance | Basic farm work and animal care |
| `worker2@riverdale.com` | Farm Worker | Animals, attendance | Basic farm work and animal care |

## Animal Inventory

### Stage 1: Milking Cows (8)
**Location**: Milking Pen A & B | **Status**: Active production

Fully productive dairy cows in lactation. Each has:
- Lactation cycle: 2-5 (multiparous)
- Production: 24-45L per day
- Status: Some pregnant, some open
- 30 milk records each spanning 2 years
- Weekly/biweekly milking data

**Animals**: Bessie, Daisy, Molly, Ella, Lucy, Ruby, Sofia, Bella

### Stage 2: Dry Cows (4)
**Location**: Dry Pen A & B | **Status**: Pregnant, pre-calving

Cows in late pregnancy, resting before calving. Each has:
- Lactation cycle: 3-6 (highly productive history)
- Pregnancy status: Pregnant (near due date)
- Status: Preparing for lactation cycle
- Recent calving history

**Animals**: Chloe, Ivy, Sadie, Olive

### Stage 3: Heifers (5)
**Location**: Heifer Pen A & B | **Status**: Growing/pre-breeding

Young females maturing for first lactation. Each has:
- Age: 1-2 years old
- Lactation: 0 (never calved)
- Pregnancy status: Mixed (some pregnant, some open)
- Pre-breeding or recently inseminated

**Animals**: Rose, Penny, Hope, Grace, Stella

### Stage 4: Calves (6)
**Location**: Calf Pen A & B | **Status**: Young offspring

Newborn to young calves being reared. Each has:
- Age: 1-6 months old
- Weight: 50-180 kg
- Mixed gender for future breeding stock
- Early development records

**Animals**: Luna, Lily, Amber, Emmy, Nora, Zoe

### Stage 5: Bulls (2)
**Location**: Bull Pen A & B | **Status**: Breeding males

Used for natural breeding or genetic collection. Each has:
- Breed: Holstein-Friesian (Thor) & Jersey (Duke)
- Age: 2-5 years
- Weight: 500-650 kg
- Active breeding animals

## Farm Infrastructure

### Sheds (5)

| Shed Name | Type | Capacity | Location | Purpose |
|-----------|------|----------|----------|---------|
| Lactating Shed | lactating | 20 | North Block | Active milking cows |
| Dry Cow Shed | dry | 15 | South Block | Pregnant animals |
| Heifer Shed | heifer | 20 | East Block | Young females |
| Calf Shed | calf | 25 | West Block | Newborn/young calves |
| Bull Shed | bull | 10 | Center Block | Breeding males |

### Pens (10)

Each shed contains specialized pens with appropriate capacity:

**Lactating Shed**:
- Milking Pen A: 10 capacity
- Milking Pen B: 10 capacity

**Dry Cow Shed**:
- Dry Pen A: 8 capacity
- Dry Pen B: 7 capacity

**Heifer Shed**:
- Heifer Pen A: 10 capacity
- Heifer Pen B: 10 capacity

**Calf Shed**:
- Calf Pen A: 12 capacity
- Calf Pen B: 13 capacity

**Bull Shed**:
- Bull Pen A: 5 capacity
- Bull Pen B: 5 capacity

## Data Characteristics

### Animal IDs

- **Milking Cows**: `MILK-001` through `MILK-008`
- **Dry Cows**: `DRY-001` through `DRY-004`
- **Heifers**: `HEIF-001` through `HEIF-005`
- **Calves**: `CALF-001` through `CALF-006`
- **Bulls**: `BULL-001`, `BULL-002`

### Milk Production Data

- **Records**: 240 total (30 per milking cow)
- **Date Range**: Past 2 years from today
- **Daily Production**: 24-45 liters per cow
- **Three Milkings**: milk1, milk2, milk3 (morning, midday, evening)
- **Quality Grades**: A, B, C (realistic distribution)
- **Approved By**: milking@riverdale.com

**Example Record**:
```
Date: 2024-07-01
Animal: Bessie (MILK-001)
Pen: Milking Pen A
Milk1: 12.5L | Milk2: 11.3L | Milk3: 9.8L
Total: 33.6L
Quality: A
```

### Breeding Data

- **Calving Events**: 4 recent events (all dry cows)
- **Calving Dates**: Spread across past 1-2 years
- **Lactation Numbers**: 2-4 for dry cows
- **Problems Logged**: 30% have minor issues noted
- **Calving Costs**: 5,000-15,000 PKR

**Example Event**:
```
Animal: Chloe (DRY-001)
Date: 2023-11-15
Lactation: 3
Calving Ease: 2/5 (mild difficulty)
Cost: 8,500 PKR
```

## Testing Scenarios

### 1. Animal Lifecycle Testing
Test tracking animals through all stages:
- Milking → Pregnancy → Dry → Calving → Back to milking
- Use dry cows with pregnancy data and calving events

### 2. Production Reporting
Test milk production analytics:
- Daily/weekly/monthly averages
- Quality grade distribution
- Individual vs herd comparisons
- Use 2-year milk records across 8 milking cows

### 3. Role-Based Access Control
Test permission matrices:
- Owner: Access all data and billing
- Manager: Exclude billing data
- Vet: Only health/breeding records
- Milking Staff: Only milking records
- Farm Workers: Limited to assigned pens

### 4. Herd Management
Test animal operations:
- Move animals between pens
- Update pregnancy status
- Record health events
- Generate production forecasts
- Use mixed stages (heifers, calves, pregnant cows)

### 5. Financial Tracking
Test cost management:
- Use calving event costs
- Track per-animal expenses
- Budget vs actual comparisons

### 6. Reporting & Analytics
Test dashboard displays:
- Total herd size: 25 animals
- Production metrics: 240 milk records
- Breeding status: 4 pregnant, mixed open
- Cost tracking: Calving events, tags

## Database Constraints Satisfied

✅ All animals linked to valid farm  
✅ All users assigned to valid farm & role  
✅ All animals in valid pens  
✅ All pens in valid sheds  
✅ All milk records linked to animals & pens  
✅ All users have proper audit trails (createdBy/updatedBy)  
✅ All timestamps within realistic 2-year window  
✅ Cascading deletes respected (farm → users → animals)  

## Idempotency

The seed script is **idempotent** — it's safe to run multiple times:
- Uses `findOrCreate()` for all major entities
- Prevents duplicate users, farms, roles
- Won't recreate existing records
- Safe to run on every application boot

## Customization

To modify the seed data:

1. **Change Farm Details**:
   ```javascript
   name: "Your Farm Name",
   location: "Your Location",
   ```

2. **Add More Animals**:
   - Duplicate animal creation blocks
   - Update counters and loop ranges
   - Ensure unique electronic IDs

3. **Adjust Production Data**:
   - Modify milk record creation loop
   - Change `randomFloat()` ranges
   - Adjust date distribution

4. **Add More Users**:
   - Add entries to `userDefinitions`
   - Assign to appropriate roles
   - Ensure unique emails

5. **Create Different Breeds**:
   - Update `breedType` in animal creation
   - Adjust weight/price expectations

## Troubleshooting

**Error: Foreign key constraint**
- Ensure all models are imported in `src/models/index.js`
- Run migrations before seeding

**Error: Duplicate key**
- Safe to delete and rerun
- Or modify `findOrCreate` where clauses

**Missing data**
- Check model definitions for required fields
- Verify all relations are properly defined

**Permission errors**
- Verify `seedPermissions.js` ran first
- Confirm permission records exist

## Support

For issues:
1. Check database logs for constraint violations
2. Verify model schemas match expectations
3. Ensure Sequelize is properly configured
4. Review the error message and check related models
