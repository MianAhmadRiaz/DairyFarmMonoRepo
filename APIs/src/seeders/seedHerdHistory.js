// Seeds richer per-animal history on top of seedFarmData.js's Riverdale Dairy
// Farm: calving-to-calving lactation history, treatments/disease history,
// breeding events (heat/AI/pregnancy), and weight history. Needed so the
// revamped Herd Dashboard / Cow Profile screens have real data to render.
// Run with: node src/seeders/seedHerdHistory.js (after seedFarmData.js)

import "../models/index.js";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "../models/farm.js";
import User from "../models/user.js";
import Animal from "../models/animal.js";
import Pen from "../models/pen.js";
import CalvingEvent from "../models/calvingEvent.js";
import LactationHistory from "../models/animalLactationHistory.js";
import Treatment from "../models/treatment.js";
import HealthStatusHistory from "../models/healthStatusHistory.js";
import WeightHistory from "../models/weightHistory.js";
import HeatEvents from "../models/heatEvent.js";
import AiBreedingEvent from "../models/aiBreeding.js";
import PregnancyEvent from "../models/pregnancyEvent.js";
import MilkOut from "../models/milkOut.js";
import Companies from "../models/companies.js";

function getDateRangeFromNow(daysAgo) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
}
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}
function toDateOnly(date) {
  return date.toISOString().split("T")[0];
}

const DIAGNOSES = [
  { diagnosis: "Mastitis", medicineName: "Cefquinome", type: "treatment", withdrawal: 3 },
  { diagnosis: "Foot Rot", medicineName: "Oxytetracycline", type: "treatment", withdrawal: 5 },
  { diagnosis: "Milk Fever", medicineName: "Calcium Borogluconate", type: "treatment", withdrawal: 0 },
  { diagnosis: "Retained Placenta", medicineName: "Oxytocin", type: "treatment", withdrawal: 1 },
  { diagnosis: "Bloat", medicineName: "Simethicone", type: "treatment", withdrawal: 0 },
];

async function seedHerdHistory() {
  try {
    const farm = await Farms.findOne({ where: { name: "Riverdale Dairy Farm" } });
    if (!farm) throw new Error("Riverdale Dairy Farm not found — run seedFarmData.js first.");

    const owner = await User.findOne({ where: { email: "owner@riverdale.com", farmId: farm.uuid } });
    const vet = await User.findOne({ where: { email: "vet@riverdale.com", farmId: farm.uuid } });
    const breedingUser = await User.findOne({ where: { email: "breeding@riverdale.com", farmId: farm.uuid } });
    if (!owner || !vet || !breedingUser) throw new Error("Expected seeded users not found — run seedFarmData.js first.");

    const animals = await Animal.findAll({ where: { farmId: farm.uuid, isDeleted: false } });
    // animalCategory has no "bulls" value in the schema, so male animals can be
    // miscategorized as "milk" — always gate breeding/lactation logic on gender too.
    const milkingCows = animals.filter(a => a.animalCategory === "milk" && a.gender === "female");
    const dryCows = animals.filter(a => a.animalCategory === "dry" && a.gender === "female");
    const heifers = animals.filter(a => a.animalCategory === "heifers" && a.gender === "female");
    const femaleBreedable = [...milkingCows, ...dryCows, ...heifers];

    // 1. Lactation history — 2-3 calving-to-calving cycles per milking/dry cow,
    // so the dashboard's calving-interval / days-open metrics have real spread.
    let lactationHistoryCount = 0;
    for (const animal of [...milkingCows, ...dryCows]) {
      const cycles = randomInt(2, 3);
      let cursorDaysAgo = 365 * 2;
      for (let i = 0; i < cycles; i++) {
        const preCalvingDaysAgo = cursorDaysAgo;
        const calvingDaysAgo = cursorDaysAgo - randomInt(270, 285);
        if (calvingDaysAgo < 0) break;
        const preCalvingDate = getDateRangeFromNow(preCalvingDaysAgo);
        const calvingDate = getDateRangeFromNow(calvingDaysAgo);

        await LactationHistory.findOrCreate({
          where: { animalId: animal.uuid, lactation: i + 1 },
          defaults: {
            animalId: animal.uuid,
            lactation: i + 1,
            pre_calving_date: preCalvingDate,
            calving_date: calvingDate,
          },
        });
        lactationHistoryCount++;

        await CalvingEvent.findOrCreate({
          where: { animalId: animal.uuid, farmId: farm.uuid, date: toDateOnly(calvingDate) },
          defaults: {
            animalId: animal.uuid,
            farmId: farm.uuid,
            penId: animal.penId,
            date: calvingDate,
            time: "06:30:00",
            calving_ease: randomInt(1, 3),
            lactation: i + 1,
            problems: Math.random() > 0.75 ? "Minor dystocia" : null,
            cost: randomFloat(5000, 15000),
            comments: "Routine calving event",
          },
        });

        cursorDaysAgo = calvingDaysAgo - randomInt(30, 90);
        if (cursorDaysAgo < 30) break;
      }
    }
    logger.info(`Lactation history: ${lactationHistoryCount} entries across ${milkingCows.length + dryCows.length} cows`);

    // 2. Treatments / disease history — spread across the herd, weighted toward
    // milking cows (where mastitis etc. actually shows up in practice).
    let treatmentCount = 0;
    for (const animal of animals) {
      const numTreatments = animal.animalCategory === "calves" ? randomInt(1, 2) : randomInt(2, 5);
      for (let i = 0; i < numTreatments; i++) {
        const date = getDateRangeFromNow(randomInt(1, 700));
        const isVaccination = Math.random() > 0.6;
        const isDeworming = !isVaccination && Math.random() > 0.5;
        let treatmentType = "treatment";
        let diagnosis = null;
        let medicineName = "Multivitamin";
        let withdrawalDays = 0;
        if (isVaccination) {
          treatmentType = "vaccination";
          medicineName = "FMD Vaccine";
        } else if (isDeworming) {
          treatmentType = "deworming";
          medicineName = "Albendazole";
        } else {
          const d = DIAGNOSES[randomInt(0, DIAGNOSES.length - 1)];
          diagnosis = d.diagnosis;
          medicineName = d.medicineName;
          withdrawalDays = d.withdrawal;
        }
        const milkWithdrawalUntil = withdrawalDays > 0 ? toDateOnly(getDateRangeFromNow(-withdrawalDays + randomInt(-700, -1))) : null;

        await Treatment.findOrCreate({
          where: { animalId: animal.uuid, farmId: farm.uuid, date: toDateOnly(date), treatmentType, medicineName },
          defaults: {
            animalId: animal.uuid,
            farmId: farm.uuid,
            date: toDateOnly(date),
            treatmentType,
            diagnosis,
            medicineName,
            quantityUsed: randomFloat(1, 10),
            dosage: `${randomInt(5, 20)}ml`,
            vetName: "Dr. Hassan Malik",
            cost: randomFloat(500, 3500),
            milkWithdrawalDays: withdrawalDays,
            meatWithdrawalDays: withdrawalDays > 0 ? withdrawalDays + 2 : 0,
            milkWithdrawalUntil,
            meatWithdrawalUntil: withdrawalDays > 0 ? toDateOnly(getDateRangeFromNow(-(withdrawalDays + 2) + randomInt(-700, -1))) : null,
            comments: diagnosis ? `${diagnosis} — responded to treatment` : null,
            createdBy: vet.uuid,
          },
        });
        treatmentCount++;
      }
    }
    logger.info(`Treatments: ${treatmentCount} records across ${animals.length} animals`);

    // 3. A couple of animals currently sick + one active withdrawal, so the
    // Health tab's "sick list" / "active withdrawals" aren't empty during a demo.
    const sickCandidate = milkingCows[0];
    if (sickCandidate) {
      await sickCandidate.update({ healthStatus: "sick" });
      await HealthStatusHistory.findOrCreate({
        where: { animalId: sickCandidate.uuid, healthStatus: "sick", date: toDateOnly(getDateRangeFromNow(2)) },
        defaults: { animalId: sickCandidate.uuid, healthStatus: "sick", date: getDateRangeFromNow(2), createdBy: vet.uuid },
      });
      await Treatment.findOrCreate({
        where: { animalId: sickCandidate.uuid, farmId: farm.uuid, date: toDateOnly(getDateRangeFromNow(2)), treatmentType: "treatment", medicineName: "Cefquinome" },
        defaults: {
          animalId: sickCandidate.uuid,
          farmId: farm.uuid,
          date: toDateOnly(getDateRangeFromNow(2)),
          treatmentType: "treatment",
          diagnosis: "Mastitis",
          medicineName: "Cefquinome",
          quantityUsed: 5,
          dosage: "10ml",
          vetName: "Dr. Hassan Malik",
          cost: 2200,
          milkWithdrawalDays: 3,
          meatWithdrawalDays: 5,
          milkWithdrawalUntil: toDateOnly(getDateRangeFromNow(-1)),
          meatWithdrawalUntil: toDateOnly(getDateRangeFromNow(-3)),
          comments: "Active mastitis treatment, under milk withdrawal",
          createdBy: vet.uuid,
        },
      });
    }
    logger.info("Active sick animal + withdrawal seeded");

    // 4. Health status history baseline (milking) for every animal, so the
    // status timeline tab isn't empty even for healthy animals.
    let healthHistoryCount = 0;
    for (const animal of animals) {
      await HealthStatusHistory.findOrCreate({
        where: { animalId: animal.uuid, healthStatus: animal.healthStatus, date: toDateOnly(animal.arrivalDate || getDateRangeFromNow(365)) },
        defaults: {
          animalId: animal.uuid,
          healthStatus: animal.healthStatus,
          date: animal.arrivalDate || getDateRangeFromNow(365),
          createdBy: owner.uuid,
        },
      });
      healthHistoryCount++;
    }
    logger.info(`Health status history baseline: ${healthHistoryCount} entries`);

    // 5. Weight history — monthly readings for the past year, all animals
    // (heifers/calves especially, for the Growth tab).
    let weightCount = 0;
    for (const animal of animals) {
      const baseWeight = animal.animalWeight || (animal.animalCategory === "calves" ? 80 : animal.animalCategory === "heifers" ? 250 : 450);
      for (let m = 11; m >= 0; m--) {
        const date = getDateRangeFromNow(m * 30);
        const growth = animal.animalCategory === "calves" || animal.animalCategory === "heifers" ? (11 - m) * randomFloat(3, 6) : 0;
        await WeightHistory.findOrCreate({
          where: { animalId: animal.uuid, date: toDateOnly(date) },
          defaults: {
            animalId: animal.uuid,
            weight: Number((baseWeight - growth + randomFloat(-5, 5)).toFixed(1)),
            date,
            createdBy: owner.uuid,
          },
        });
        weightCount++;
      }
    }
    logger.info(`Weight history: ${weightCount} records`);

    // 6. Breeding events — heat detection + AI + pregnancy checks for
    // heifers/dry cows, so the Reproduction tab has a real funnel.
    let heatCount = 0, aiCount = 0, pregCount = 0;
    for (const animal of femaleBreedable) {
      if (Math.random() > 0.7) continue; // not every animal has an active cycle
      const heatDate = getDateRangeFromNow(randomInt(10, 300));
      await HeatEvents.findOrCreate({
        where: { animalId: animal.uuid, farmId: farm.uuid, date: toDateOnly(heatDate) },
        defaults: { animalId: animal.uuid, farmId: farm.uuid, date: heatDate, reason: "Standing heat observed", comments: "Standard observation" },
      });
      heatCount++;

      if (Math.random() > 0.4) {
        const aiDate = getDateRangeFromNow(randomInt(1, 9) + (300 - randomInt(10, 300)));
        await AiBreedingEvent.findOrCreate({
          where: { animalId: animal.uuid, farmId: farm.uuid, date: toDateOnly(heatDate) },
          defaults: {
            animalId: animal.uuid,
            farmId: farm.uuid,
            date: heatDate,
            time: "07:00:00",
            semen: "Holstein-Friesian Elite",
            tech: "Muhammad Hassan",
            type: "Frozen",
            cost: randomFloat(1500, 4000),
            weight: null,
            dose: 1,
            double_dose: false,
            comments: "AI performed post heat detection",
          },
        });
        aiCount++;

        if (Math.random() > 0.35) {
          const checkDate = getDateRangeFromNow(Math.max(1, randomInt(10, 300) - randomInt(35, 60)));
          const positive = Math.random() > 0.3;
          await PregnancyEvent.findOrCreate({
            where: { animalId: animal.uuid, farmId: farm.uuid, date: toDateOnly(checkDate) },
            defaults: {
              animalId: animal.uuid,
              farmId: farm.uuid,
              date: checkDate,
              prev_test_date: null,
              breed_date: heatDate,
              exp_dryoff_date: null,
              exp_calving_date: positive ? getDateRangeFromNow(-randomInt(120, 200)) : null,
              breed_with: "Holstein-Friesian Elite",
              result: positive ? "positive" : "negative",
              tech: "Dr. Hassan Malik",
              technique: "ultrasound",
              cost: randomFloat(800, 2000),
              pg_days: randomInt(35, 60),
              recheck: !positive,
            },
          });
          pregCount++;
        }
      }
    }
    logger.info(`Breeding events: ${heatCount} heat, ${aiCount} AI, ${pregCount} pregnancy checks`);

    // 7. A company + a few milk-out sale records, so the financials-estimate
    // endpoint has a real average sale price instead of returning zero.
    const [company] = await Companies.findOrCreate({
      where: { name: "Punjab Dairy Cooperative", farmId: farm.uuid },
      defaults: { name: "Punjab Dairy Cooperative", farmId: farm.uuid, createdBy: owner.uuid },
    }).catch(() => [null]);

    if (company) {
      let milkOutCount = 0;
      for (let d = 0; d < 20; d++) {
        const date = getDateRangeFromNow(d * 10);
        const volume = randomFloat(150, 300);
        const pricePerLitre = randomFloat(95, 115);
        await MilkOut.findOrCreate({
          where: { farmId: farm.uuid, date: toDateOnly(date), companyId: company.uuid },
          defaults: {
            farmId: farm.uuid,
            date: toDateOnly(date),
            volume,
            adj_volume: volume,
            fat: randomFloat(3.5, 4.5),
            snf: randomFloat(8, 9),
            outType: "sell",
            companyId: company.uuid,
            pricePerLitre,
            totalPrice: Number((volume * pricePerLitre).toFixed(2)),
            remarks: "Daily collection sale",
            userId: owner.uuid,
            approvedBy: owner.uuid,
          },
        });
        milkOutCount++;
      }
      logger.info(`Milk-out sale records: ${milkOutCount}`);
    }

    logger.info("========== HERD HISTORY SEEDING COMPLETE ==========");
  } catch (error) {
    logger.error("Herd history seeding failed:", error);
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  seedHerdHistory()
    .then(() => {
      logger.info("Herd history seeder finished successfully.");
      return sequelize.close();
    })
    .then(() => process.exit(0))
    .catch((err) => {
      logger.error(`Herd history seeder failed: ${err.message}`);
      process.exit(1);
    });
}

export default seedHerdHistory;
