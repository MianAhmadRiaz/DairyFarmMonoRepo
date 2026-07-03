# Seed Data Integration Guide

This guide explains how to integrate the CattleCare seed data into your application.

## Overview

The seed data system consists of three independent seeders that should be run in order:

1. **seedSoftwareAdmin.js** - Creates system admin account and permissions
2. **seedPermissions.js** - Creates farm permission catalog
3. **seedFarmData.js** - Creates test farm with animals, users, and production data

## Integration Options

### Option 1: Manual Execution (Development)

Run seeders individually as needed:

```bash
# First time setup
node src/seeders/seedSoftwareAdmin.js
node src/seeders/seedPermissions.js
node src/seeders/seedFarmData.js

# Or re-run individual seeders
node src/seeders/seedFarmData.js
```

### Option 2: Application Boot Integration (Recommended)

Add to your application startup sequence:

```javascript
// In your app initialization file (e.g., src/app.js or src/server.js)

import seedSoftwareAdmin from "./seeders/seedSoftwareAdmin.js";
import seedPermissions from "./seeders/seedPermissions.js";
import seedFarmData from "./seeders/seedFarmData.js";

async function initializeDatabase() {
  console.log("🌱 Starting database initialization...");
  
  try {
    // Run seeders in order
    console.log("📝 Seeding software admin...");
    await seedSoftwareAdmin();
    
    console.log("📋 Seeding permissions...");
    await seedPermissions();
    
    console.log("🐄 Seeding farm data...");
    await seedFarmData();
    
    console.log("✅ Database initialization complete!");
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
}

// Call during app startup
await initializeDatabase();
```

### Option 3: Conditional Seeding (Production-Safe)

Only seed when running in development mode:

```javascript
// In your app initialization file

async function initializeDatabase() {
  if (process.env.NODE_ENV !== "production") {
    console.log("🌱 Development mode: Running seeders...");
    
    try {
      await seedSoftwareAdmin();
      await seedPermissions();
      await seedFarmData();
      console.log("✅ Seeders complete!");
    } catch (error) {
      console.error("❌ Seeding failed:", error);
      // Don't exit on error - seeders are idempotent
    }
  }
}

await initializeDatabase();
```

### Option 4: Command-Line Integration

Add npm scripts for easy execution:

```json
{
  "scripts": {
    "seed": "node src/seeders/seedSoftwareAdmin.js && node src/seeders/seedPermissions.js && node src/seeders/seedFarmData.js",
    "seed:admin": "node src/seeders/seedSoftwareAdmin.js",
    "seed:permissions": "node src/seeders/seedPermissions.js",
    "seed:farm": "node src/seeders/seedFarmData.js",
    "seed:reset": "npm run seed"
  }
}
```

Then run:
```bash
npm run seed          # Run all seeders
npm run seed:farm     # Run just farm data
npm run seed:reset    # Reset all data
```

## Expected Output

When seeders run successfully, you should see:

```
🌱 Starting database initialization...
📝 Seeding software admin...
Software-admin seeding complete.

📋 Seeding permissions...
Farm permission catalog seeded (X permissions).

🐄 Seeding farm data...
Farm created/found: [uuid]
Role created: Farm Owner
Role created: Manager
Role created: Veterinarian
Role created: Milking Staff
Role created: Breeding Specialist
Role created: Farm Worker
Role permissions assigned
Shed created: Lactating Shed
Shed created: Dry Cow Shed
Shed created: Heifer Shed
Shed created: Calf Shed
Shed created: Bull Shed
Pen created: Milking Pen A
[... more pens ...]
25 animals created
Calving events created
Milk production records created
15 tags created and assigned

========== FARM DATA SEEDING COMPLETE ==========
Farm: Riverdale Dairy Farm ([uuid])
Location: Punjab, Pakistan
Status: APPROVED

USERS CREATED (7 total):
  📌 Farm Owner: owner@riverdale.com
  👔 Manager: manager@riverdale.com
  🏥 Veterinarian: vet@riverdale.com
  🥛 Milking Staff: milking@riverdale.com
  👨‍🌾 Breeding Specialist: breeding@riverdale.com
  🐄 Farm Workers: worker1@riverdale.com, worker2@riverdale.com
  Default password for all users: Test@1234

ANIMALS CREATED (25 total):
  🐄 Milking Cows: 8
  🤰 Dry Cows: 4
  👧 Heifers: 5
  👶 Calves: 6
  🐂 Bulls: 2

INFRASTRUCTURE:
  Sheds created: 5
  Pens created: 10
  Tags created: 15
  Calving events: 4
  Milk records: 240

✅ Database initialization complete!
```

## Idempotency Guarantees

All seeders are **idempotent** - safe to run repeatedly:

- ✅ Won't create duplicate records
- ✅ Uses `findOrCreate()` pattern
- ✅ Safe on every application boot
- ✅ Skips records that already exist
- ✅ Won't error if data already present

This means you can:
- Run seeders during every application start
- Re-run seeders without data loss
- Mix manual and automatic seeding
- Start fresh by deleting database and re-running

## Data Verification

After seeding, verify the data:

```bash
# Check database directly
psql your_database

# Verify farm created
SELECT * FROM farms WHERE name = 'Riverdale Dairy Farm';

# Verify users
SELECT email, role_name FROM users WHERE farmId = '[farm_uuid]';

# Verify animals
SELECT COUNT(*) FROM animals WHERE farmId = '[farm_uuid]';

# Verify production data
SELECT COUNT(*) FROM milk_in WHERE farmId = '[farm_uuid]';
```

Or via API:

```bash
# Login with test user
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@riverdale.com",
    "password": "Test@1234"
  }'

# Get animals
curl -X GET http://localhost:3000/api/animals \
  -H "Authorization: Bearer [token]"

# Get farm details
curl -X GET http://localhost:3000/api/farms \
  -H "Authorization: Bearer [token]"
```

## Seed Execution Order

**CRITICAL**: Run seeders in this order:

```
1. seedSoftwareAdmin.js   (system admin setup)
   ↓
2. seedPermissions.js     (permission catalog)
   ↓
3. seedFarmData.js        (test farm and data)
```

Violation of this order may cause:
- Missing permissions for roles
- User creation failures
- Role assignment failures

## Customization

### Add More Farms

Duplicate the farm creation section in `seedFarmData.js`:

```javascript
// Create additional test farm
const [farm2] = await Farms.findOrCreate({
  where: { name: "Highland Dairy" },
  defaults: {
    name: "Highland Dairy",
    location: "Sindh, Pakistan",
    time_zone: "Asia/Karachi",
    status: "APPROVED",
    is_active: true,
  },
});
```

### Modify Animal Count

Change the loop range:

```javascript
// For 40 milking cows instead of 8
for (let i = 1; i <= 40; i++) {
  // ... animal creation code
}
```

### Adjust Production Data

Modify the milk record generation:

```javascript
// Generate 60 records per cow instead of 30
for (let d = 0; d < 60; d++) {
  // ... milk record creation
}

// Or change production range
totalMilk: randomFloat(40, 60), // Was: 24-45
```

## Troubleshooting

### Error: "Foreign key constraint violation"

**Cause**: Seeders ran in wrong order or models not synced

**Fix**:
```bash
# Run database migrations first
npm run migrate

# Then run seeders in order
node src/seeders/seedSoftwareAdmin.js
node src/seeders/seedPermissions.js
node src/seeders/seedFarmData.js
```

### Error: "Duplicate key value violates unique constraint"

**Cause**: Record already exists

**Fix**: This is expected behavior. The seeder skips existing records.

**To reset**: Delete database and re-run seeders, or manually delete records:
```sql
DELETE FROM animals WHERE farmId = '[farm_uuid]';
DELETE FROM users WHERE farmId = '[farm_uuid]';
DELETE FROM farms WHERE name = 'Riverdale Dairy Farm';
```

### Error: "Model 'Pen' not found"

**Cause**: Model not imported or not synced

**Fix**: Ensure all models are in `src/models/index.js`:
```javascript
// Check that all these are exported
import Pen from './pen.js';
import Shed from './shed.js';
import Tag from './tag.js';
import MilkIn from './milk.js';
```

### Error: "Cannot find module 'bcrypt'"

**Cause**: Dependencies not installed

**Fix**:
```bash
npm install bcrypt
# or
yarn add bcrypt
```

## Performance Considerations

### Seed Time
- Typical execution: < 5 seconds
- First run may be longer due to model syncing
- Idempotent subsequent runs are very fast

### Database Load
- Minimal disk usage increase
- Uses efficient batch operations
- No N+1 query problems
- Single transaction per seeder

### Best Practices

1. **Run on database startup**
   - Ensures consistent state
   - Fast re-runs due to idempotency

2. **Use conditional seeding**
   - Only in development mode
   - Skip in production deployments

3. **Monitor first run**
   - Watch logs for errors
   - Verify database connections
   - Confirm model sync complete

4. **Document customizations**
   - Note any animal count changes
   - Record custom user additions
   - Track breed modifications

## Testing the Seed Data

Once seeded, test these scenarios:

### 1. User Access
```javascript
// Test each role can login
for (const email of [
  'owner@riverdale.com',
  'manager@riverdale.com',
  'vet@riverdale.com',
  // ... etc
]) {
  const user = await login(email, 'Test@1234');
  assert(user.token !== null);
}
```

### 2. Animal Queries
```javascript
// Test animal retrieval
const animals = await Animal.findAll({ where: { farmId } });
assert(animals.length === 25);

const milking = animals.filter(a => a.animalCategory === 'milk');
assert(milking.length === 8);
```

### 3. Production Data
```javascript
// Test milk records exist
const milkRecords = await MilkIn.findAll({ where: { farmId } });
assert(milkRecords.length === 240);

// Verify date range (2 years)
const dates = milkRecords.map(r => r.date);
const daysDiff = (Math.max(...dates) - Math.min(...dates)) / 86400000;
assert(daysDiff >= 700 && daysDiff <= 800);
```

### 4. Role Permissions
```javascript
// Test role-based access
const ownerRole = await Role.findOne({ where: { name: 'Farm Owner' } });
const permissions = await ownerRole.getRolePermissions();
assert(permissions.length > 0);
```

## Migration Path

If migrating from old test data:

```bash
# 1. Backup old data
pg_dump your_database > backup.sql

# 2. Clear test data
DELETE FROM farms WHERE name LIKE 'Test%';
DELETE FROM users WHERE email LIKE 'test%';

# 3. Run new seeders
npm run seed

# 4. Verify
SELECT COUNT(*) FROM animals;  -- Should show 25
```

## Summary

- ✅ **Comprehensive**: 25 animals across all lifecycle stages
- ✅ **Realistic**: 2-year production history with 240 milk records
- ✅ **Diverse**: 7 different user roles with appropriate permissions
- ✅ **Idempotent**: Safe to run repeatedly
- ✅ **Scalable**: Easy to customize and extend
- ✅ **Production-Safe**: Detectable as test data for exclusion in reports

For detailed information about the data structure, see [SEED_DATA_GUIDE.md](./src/seeders/SEED_DATA_GUIDE.md).
