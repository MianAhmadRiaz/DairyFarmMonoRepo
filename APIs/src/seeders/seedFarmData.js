// Seeds comprehensive farm data with animals in all lifecycle stages, 2-year history, and all user roles
// Run with: node src/seeders/seedFarmData.js

import bcrypt from "bcrypt";
import "../models/index.js";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "../models/farm.js";
import User from "../models/user.js";
import Role from "../models/role.js";
import RoleAndPermission from "../models/role&Permission.js";
import Permissions from "../models/permissions.js";
import Animal from "../models/animal.js";
import CalvingEvent from "../models/calvingEvent.js";
import Pen from "../models/pen.js";
import Shed from "../models/shed.js";
import Tag from "../models/tag.js";
import MilkIn from "../models/milk.js";

// Helper: Generate dates across 2 years
function getDateRangeFromNow(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}

// Helper: Generate random integer
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Helper: Generate random float
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

// Animal name templates
const femaleNames = [
  "Bessie", "Daisy", "Molly", "Ella", "Lucy", "Ruby", "Sofia", "Bella",
  "Chloe", "Ivy", "Sadie", "Olive", "Rose", "Penny", "Hope", "Grace",
  "Stella", "Luna", "Lily", "Amber", "Emmy", "Nora", "Zoe", "Willow",
  "Maya", "Coral", "Iris", "Ava", "Nina", "Piper"
];

const maleNames = [
  "Thor", "Duke", "King", "Storm", "Max", "Leo", "Rocky", "Shadow",
  "Bolt", "Apollo", "Caesar", "Rex", "titan", "Champion", "Buddy",
  "Bruno", "Bear", "Chief", "Maverick", "Major"
];

export async function seedFarmData() {
  try {
    // 1. Create a test farm
    const [farm] = await Farms.findOrCreate({
      where: { name: "Riverdale Dairy Farm" },
      defaults: {
        name: "Riverdale Dairy Farm",
        location: "Punjab, Pakistan",
        time_zone: "Asia/Karachi",
        status: "APPROVED",
        is_active: true,
        status_updated_at: new Date(),
      },
    });
    logger.info(`Farm created/found: ${farm.uuid}`);

    // 2. Create roles for the farm
    const roleDefinitions = [
      {
        name: "Farm Owner",
        description: "Full control over farm operations",
        isOwner: true,
      },
      {
        name: "Manager",
        description: "Manage animals, records, and employees",
      },
      {
        name: "Veterinarian",
        description: "Handle health, breeding, and medical records",
      },
      {
        name: "Milking Staff",
        description: "Record milk production and animal handling",
      },
      {
        name: "Breeding Specialist",
        description: "Manage breeding programs and genetics",
      },
      {
        name: "Farm Worker",
        description: "General farm work and animal care",
      },
    ];

    const roles = {};
    for (const roleDef of roleDefinitions) {
      const [role] = await Role.findOrCreate({
        where: { name: roleDef.name, farmId: farm.uuid },
        defaults: {
          name: roleDef.name,
          description: roleDef.description,
          isOwner: roleDef.isOwner || false,
          isSystem: true,
          farmId: farm.uuid,
          createdBy: farm.uuid,
        },
      });
      roles[roleDef.name] = role;
      logger.info(`Role created: ${roleDef.name}`);
    }

    // 3. Get all farm permissions
    const allPermissions = await Permissions.findAll({
      where: { type: "farm" },
    });

    // 4. Assign permissions to roles
    const rolePermissionMap = {
      "Farm Owner": allPermissions,
      Manager: allPermissions.filter(p => !p.resource.includes("billing")),
      Veterinarian: allPermissions.filter(p =>
        ["herd", "health", "breeding", "dashboard"].includes(p.resource)
      ),
      "Milking Staff": allPermissions.filter(p =>
        ["herd", "milking", "dashboard"].includes(p.resource)
      ),
      "Breeding Specialist": allPermissions.filter(p =>
        ["breeding", "herd", "dashboard"].includes(p.resource)
      ),
      "Farm Worker": allPermissions.filter(p =>
        ["herd", "dashboard"].includes(p.resource)
      ),
    };

    for (const [roleName, permissions] of Object.entries(rolePermissionMap)) {
      for (const permission of permissions) {
        await RoleAndPermission.findOrCreate({
          where: { roleId: roles[roleName].uuid, permissionId: permission.uuid },
          defaults: { roleId: roles[roleName].uuid, permissionId: permission.uuid },
        });
      }
    }
    logger.info("Role permissions assigned");

    // 5. Create test users with all roles
    const userDefinitions = [
      {
        firstname: "Ahmed",
        lastname: "Khan",
        email: "owner@riverdale.com",
        phone: "+923001234567",
        role: "Farm Owner",
      },
      {
        firstname: "Fatima",
        lastname: "Ali",
        email: "manager@riverdale.com",
        phone: "+923001234568",
        role: "Manager",
      },
      {
        firstname: "Dr. Hassan",
        lastname: "Malik",
        email: "vet@riverdale.com",
        phone: "+923001234569",
        role: "Veterinarian",
      },
      {
        firstname: "Muhammad",
        lastname: "Hassan",
        email: "milking@riverdale.com",
        phone: "+923001234570",
        role: "Milking Staff",
      },
      {
        firstname: "Zainab",
        lastname: "Khan",
        email: "breeding@riverdale.com",
        phone: "+923001234571",
        role: "Breeding Specialist",
      },
      {
        firstname: "Ali",
        lastname: "Raza",
        email: "worker1@riverdale.com",
        phone: "+923001234572",
        role: "Farm Worker",
      },
      {
        firstname: "Usman",
        lastname: "Ahmed",
        email: "worker2@riverdale.com",
        phone: "+923001234573",
        role: "Farm Worker",
      },
    ];

    const users = {};
    const hashedPassword = await bcrypt.hash("Test@1234", 10);

    let ownerUuid = null;
    for (const userData of userDefinitions) {
      const [user] = await User.findOrCreate({
        where: { email: userData.email.toLowerCase() },
        defaults: {
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email.toLowerCase(),
          phoneNumber: userData.phone,
          farmId: farm.uuid,
          roleId: roles[userData.role].uuid,
          role_name: userData.role,
          password: hashedPassword,
          createdBy: ownerUuid,
        },
      });
      users[userData.email] = user;
      if (!ownerUuid) ownerUuid = user.uuid;
      logger.info(`User created: ${userData.email} (${userData.role})`);
    }

    // 6. Create sheds first
    const shedDefinitions = [
      { name: "Lactating Shed", type: "lactating", capacity: 20, location: "North Block" },
      { name: "Dry Cow Shed", type: "dry", capacity: 15, location: "South Block" },
      { name: "Heifer Shed", type: "heifer", capacity: 20, location: "East Block" },
      { name: "Calf Shed", type: "calf", capacity: 25, location: "West Block" },
      { name: "Bull Shed", type: "bull", capacity: 10, location: "Center Block" },
    ];

    const sheds = {};
    for (const shedDef of shedDefinitions) {
      const [shed] = await Shed.findOrCreate({
        where: { name: shedDef.name, farmId: farm.uuid },
        defaults: {
          name: shedDef.name,
          description: `${shedDef.type} housing`,
          capacity: shedDef.capacity,
          location: shedDef.location,
          shed_type: shedDef.type,
          is_active: true,
          farmId: farm.uuid,
          createdBy: users["owner@riverdale.com"].uuid,
        },
      });
      sheds[shedDef.name] = shed;
      logger.info(`Shed created: ${shedDef.name}`);
    }

    // 7. Create pens within sheds
    const penDefinitions = [
      { name: "Milking Pen A", shedName: "Lactating Shed", type: "lactating", capacity: 10 },
      { name: "Milking Pen B", shedName: "Lactating Shed", type: "lactating", capacity: 10 },
      { name: "Calf Pen A", shedName: "Calf Shed", type: "calf", capacity: 12 },
      { name: "Calf Pen B", shedName: "Calf Shed", type: "calf", capacity: 13 },
      { name: "Heifer Pen A", shedName: "Heifer Shed", type: "heifer", capacity: 10 },
      { name: "Heifer Pen B", shedName: "Heifer Shed", type: "heifer", capacity: 10 },
      { name: "Dry Pen A", shedName: "Dry Cow Shed", type: "dry", capacity: 8 },
      { name: "Dry Pen B", shedName: "Dry Cow Shed", type: "dry", capacity: 7 },
      { name: "Bull Pen A", shedName: "Bull Shed", type: "bull", capacity: 5 },
      { name: "Bull Pen B", shedName: "Bull Shed", type: "bull", capacity: 5 },
    ];

    const pens = {};
    for (const penDef of penDefinitions) {
      const [pen] = await Pen.findOrCreate({
        where: { name: penDef.name, farmId: farm.uuid },
        defaults: {
          name: penDef.name,
          capacity: penDef.capacity,
          pen_type: penDef.type,
          shedId: sheds[penDef.shedName].uuid,
          farmId: farm.uuid,
          createdBy: users["owner@riverdale.com"].uuid,
        },
      });
      pens[penDef.name] = pen;
      logger.info(`Pen created: ${penDef.name}`);
    }

    // 8. Seed animals across all lifecycle stages (25 total)
    const animals = [];

    // Animal creation helper
    async function createAnimal(animalData, penName) {
      const [animal] = await Animal.findOrCreate({
        where: { electronicId: animalData.electronicId, farmId: farm.uuid },
        defaults: {
          farmId: farm.uuid,
          penId: pens[penName]?.uuid || null,
          name: animalData.name,
          electronicId: animalData.electronicId,
          gender: animalData.gender,
          animalType: "Cattle",
          breedType: animalData.breed,
          animalCategory: animalData.category,
          healthStatus: animalData.healthStatus || "milking",
          lactation: animalData.lactation || 0,
          ispregnant: animalData.ispregnant || false,
          pregnancy_status: animalData.pregnancy_status || "open",
          birthdate: animalData.birthdate,
          arrivalDate: animalData.arrivalDate,
          price: animalData.price,
          animalWeight: animalData.weight,
          weightDate: new Date(),
          createdBy: users["owner@riverdale.com"].uuid,
          inseminated_date: animalData.inseminated_date || null,
          calving_date: animalData.calving_date || null,
        },
      });
      return animal;
    }

    // Stage 1: Active Milking Cows (8 animals)
    for (let i = 1; i <= 8; i++) {
      const penName = i <= 5 ? "Milking Pen A" : "Milking Pen B";
      const animal = await createAnimal(
        {
          name: femaleNames[i - 1],
          electronicId: `MILK-${String(i).padStart(3, "0")}`,
          gender: "female",
          breed: "Holstein-Friesian",
          category: "milk",
          lactation: randomInt(2, 5),
          ispregnant: Math.random() > 0.6,
          pregnancy_status: Math.random() > 0.6 ? "pregnant" : "open",
          birthdate: getDateRangeFromNow(365 * randomInt(3, 6)),
          arrivalDate: getDateRangeFromNow(365 * randomInt(1, 4)),
          price: 150000 + randomInt(0, 50000),
          weight: randomFloat(400, 500),
          inseminated_date:
            Math.random() > 0.6
              ? getDateRangeFromNow(randomInt(60, 120))
              : null,
        },
        penName
      );
      animals.push(animal);
    }

    // Stage 2: Dry Cows (4 animals)
    for (let i = 9; i <= 12; i++) {
      const penName = i <= 10 ? "Dry Pen A" : "Dry Pen B";
      const animal = await createAnimal(
        {
          name: femaleNames[i - 1],
          electronicId: `DRY-${String(i - 8).padStart(3, "0")}`,
          gender: "female",
          breed: "Jersey",
          category: "dry",
          healthStatus: "milking",
          lactation: randomInt(3, 6),
          ispregnant: true,
          pregnancy_status: "pregnant",
          birthdate: getDateRangeFromNow(365 * randomInt(4, 7)),
          arrivalDate: getDateRangeFromNow(365 * randomInt(2, 5)),
          price: 140000 + randomInt(0, 40000),
          weight: randomFloat(380, 450),
          inseminated_date: getDateRangeFromNow(randomInt(180, 270)),
        },
        penName
      );
      animals.push(animal);
    }

    // Stage 3: Heifers (5 animals)
    for (let i = 13; i <= 17; i++) {
      const penName = i <= 15 ? "Heifer Pen A" : "Heifer Pen B";
      const animal = await createAnimal(
        {
          name: femaleNames[i - 1],
          electronicId: `HEIF-${String(i - 12).padStart(3, "0")}`,
          gender: "female",
          breed: "Guernsey",
          category: "heifers",
          lactation: 0,
          ispregnant: Math.random() > 0.5,
          pregnancy_status: Math.random() > 0.5 ? "pregnant" : "open",
          birthdate: getDateRangeFromNow(365 * randomInt(1, 2)),
          arrivalDate: getDateRangeFromNow(365 * randomInt(1, 2)),
          price: 100000 + randomInt(0, 30000),
          weight: randomFloat(280, 350),
        },
        penName
      );
      animals.push(animal);
    }

    // Stage 4: Calves (6 animals)
    for (let i = 18; i <= 23; i++) {
      const penName = i <= 20 ? "Calf Pen A" : "Calf Pen B";
      const animal = await createAnimal(
        {
          name: femaleNames[i - 1],
          electronicId: `CALF-${String(i - 17).padStart(3, "0")}`,
          gender: Math.random() > 0.5 ? "male" : "female",
          breed: "Brown Swiss",
          category: "calves",
          is_calve: true,
          lactation: 0,
          ispregnant: false,
          pregnancy_status: "open",
          birthdate: getDateRangeFromNow(randomInt(30, 180)),
          arrivalDate: getDateRangeFromNow(randomInt(30, 180)),
          price: 30000 + randomInt(0, 20000),
          weight: randomFloat(50, 180),
        },
        penName
      );
      animals.push(animal);
    }

    // Stage 5: Bulls/Breeding Males (2 animals)
    const bull1 = await createAnimal(
      {
        name: maleNames[0],
        electronicId: "BULL-001",
        gender: "male",
        breed: "Holstein-Friesian",
        category: "milk",
        lactation: 0,
        ispregnant: false,
        pregnancy_status: "open",
        birthdate: getDateRangeFromNow(365 * randomInt(3, 5)),
        arrivalDate: getDateRangeFromNow(365 * randomInt(2, 4)),
        price: 200000 + randomInt(0, 100000),
        weight: randomFloat(550, 650),
      },
      "Bull Pen A"
    );
    animals.push(bull1);

    const bull2 = await createAnimal(
      {
        name: maleNames[1],
        electronicId: "BULL-002",
        gender: "male",
        breed: "Jersey",
        category: "milk",
        lactation: 0,
        ispregnant: false,
        pregnancy_status: "open",
        birthdate: getDateRangeFromNow(365 * randomInt(2, 4)),
        arrivalDate: getDateRangeFromNow(365 * randomInt(1, 3)),
        price: 180000 + randomInt(0, 80000),
        weight: randomFloat(500, 600),
      },
      "Bull Pen B"
    );
    animals.push(bull2);

    logger.info(`${animals.length} animals created`);

    // 9. Create calving events for dry cows (simulating 2-year history)
    for (let i = 0; i < 4; i++) {
      const animal = animals[8 + i];
      const calvingDate = getDateRangeFromNow(
        365 * randomInt(1, 2) + randomInt(0, 30)
      );

      await CalvingEvent.findOrCreate({
        where: {
          animalId: animal.uuid,
          farmId: farm.uuid,
          date: calvingDate,
        },
        defaults: {
          animalId: animal.uuid,
          farmId: farm.uuid,
          penId: pens["Milking Pen A"].uuid,
          date: calvingDate,
          time: "06:30:00",
          calving_ease: randomInt(1, 3),
          lactation: randomInt(2, 4),
          problems: Math.random() > 0.7 ? "Minor dystocia" : null,
          cost: randomFloat(5000, 15000),
          comments: "Routine calving event",
        },
      });
    }

    logger.info("Calving events created");

    // 10. Create milk production records (2-year history for milking cows)
    for (let i = 0; i < 8; i++) {
      const animal = animals[i];
      const pen = i < 5 ? pens["Milking Pen A"] : pens["Milking Pen B"];

      // Create 30 milk records spread over past 2 years
      for (let d = 0; d < 30; d++) {
        const date = getDateRangeFromNow(365 * 2 - d * 24);
        await MilkIn.findOrCreate({
          where: {
            animalId: animal.uuid,
            farmId: farm.uuid,
            date: date.toISOString().split('T')[0],
          },
          defaults: {
            animalId: animal.uuid,
            farmId: farm.uuid,
            penId: pen.uuid,
            date: date.toISOString().split('T')[0],
            animal_curr_lactation: animal.lactation,
            milk1: randomFloat(8, 16),
            milk2: randomFloat(8, 16),
            milk3: randomFloat(7, 15),
            totalMilk: randomFloat(24, 45),
            milkiQuality: ["a", "b", "c"][Math.floor(Math.random() * 3)],
            approvedBy: users["milking@riverdale.com"].uuid,
          },
        });
      }
    }

    logger.info("Milk production records created");

    // 11. Create tags for animals
    const tags = [];
    let tagIndex = 0;

    for (const animal of animals.slice(0, 15)) {
      const [tag] = await Tag.findOrCreate({
        where: { name: `TAG-${animal.electronicId}`, farmId: farm.uuid },
        defaults: {
          name: `TAG-${animal.electronicId}`,
          is_used: true,
          farmId: farm.uuid,
          createdBy: users["owner@riverdale.com"].uuid,
        },
      });
      tags.push(tag);
      tagIndex++;

      await animal.update({ tagId: tag.uuid, tagName: tag.name });
    }

    logger.info(`${tags.length} tags created and assigned`);

    // 12. Summary
    logger.info("========== FARM DATA SEEDING COMPLETE ==========");
    logger.info(`Farm: ${farm.name} (${farm.uuid})`);
    logger.info(`Location: ${farm.location}`);
    logger.info(`Status: ${farm.status}`);
    logger.info("");
    logger.info("USERS CREATED (7 total):");
    logger.info(`  📌 Farm Owner: owner@riverdale.com`);
    logger.info(`  👔 Manager: manager@riverdale.com`);
    logger.info(`  🏥 Veterinarian: vet@riverdale.com`);
    logger.info(`  🥛 Milking Staff: milking@riverdale.com`);
    logger.info(`  👨‍🌾 Breeding Specialist: breeding@riverdale.com`);
    logger.info(`  🐄 Farm Workers: worker1@riverdale.com, worker2@riverdale.com`);
    logger.info(`  Default password for all users: Test@1234`);
    logger.info("");
    logger.info("ANIMALS CREATED (25 total):");
    logger.info(`  🐄 Milking Cows: 8 (Active lactation)`);
    logger.info(`  🤰 Dry Cows: 4 (Pregnant, pre-calving)`);
    logger.info(`  👧 Heifers: 5 (Young females, pre-breeding)`);
    logger.info(`  👶 Calves: 6 (Young offspring)`);
    logger.info(`  🐂 Bulls: 2 (Breeding males)`);
    logger.info("");
    logger.info("INFRASTRUCTURE:");
    logger.info(`  Sheds created: 5`);
    logger.info(`  Pens created: 10`);
    logger.info(`  Tags created: 15`);
    logger.info(`  Calving events: 4`);
    logger.info(`  Milk records: 240 (30 per milking cow across 2 years)`);
    logger.info("================================================");
  } catch (error) {
    logger.error("Farm data seeding failed:", error);
    throw error;
  }
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFarmData()
    .then(() => {
      logger.info("Seeder finished successfully.");
      return sequelize.close();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Seeder failed: ${err.message}`);
      process.exit(1);
    });
}

export default seedFarmData;
