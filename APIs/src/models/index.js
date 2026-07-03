
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

// ─── Core / independent tables ───────────────────────────────────────────────
import "./softwareAdmin.js";        // standalone
import "./systemAdminRoles.js";     // standalone
import "./systmenAdminRoles&Permissions.js"; // depends on systemAdminRoles
import "./farm.js";                 // root table - everything depends on it
import "./user.js";                 // depends on farms
import "./farmConfiguration.js";    // depends on farms
import "./farmLogs.js";             // depends on farms
import "./role.js";                 // depends on farms
import "./permissions.js";          // depends on farms, users
import "./role&Permission.js";      // depends on role, permissions

// ─── Livestock core ───────────────────────────────────────────────────────────
import "./breedTypes.js";           // standalone lookup
import "./animalTypes.js";          // standalone lookup
import "./animalSubCategories.js";  // depends on animalTypes
import "./tag.js";                  // depends on farms
import "./pen.js";                  // depends on farms
import "./bull.js";                 // depends on farms
import "./animal.js";               // depends on farms, pen, tag

// ─── Animal history & events ──────────────────────────────────────────────────
import "./tagHistory.js";
import "./weightHistory.js";
import "./penHistory.js";
import "./removalAnimalHistory.js";
import "./animalLactationHistory.js";
import "./healthStatusHistory.js";
import "./treatment.js";            // depends on animals, stock_items
import "./lactationStatus.js";
import "./pregnancyStatus.js";
import "./pregnancyEvent.js";
import "./heatEvent.js";
import "./heatDetectionReason.js";
import "./dryOffEvent.js";
import "./calvingEvent.js";
import "./calvingOffSprings.js";
import "./abortionEvent.js";
import "./bullBreeding.js";
import "./aiBreeding.js";

// ─── Protocols ────────────────────────────────────────────────────────────────
import "./protocolEvent.js";
import "./protocolSteps.js";
import "./protocolsInfo.js";
import "./injections.js";

// ─── Milk & milk products ─────────────────────────────────────────────────────
import "./companies.js";
import "./milkOut.js";
import "./milk.js";
import "./milkCategories.js";
import "./milkingSession.js";
import "./milkStorage.js";
import "./finalMilk.js";

// ─── Feed ─────────────────────────────────────────────────────────────────────
import "./shed.js";
import "./recipeGroup.js";
import "./feedBrand.js";
import "./feedFormulation.js";
import "./feedFormulationItems.js";
import "./feedFormulationHistory.js";
import "./feedingSchedule.js";

// ─── HR / People ──────────────────────────────────────────────────────────────
import "./departments.js";          // depends on farms
import "./employee.js";             // depends on farms, departments
import "./attendance.js";           // depends on employee
import "./advanceSalary.js";        // depends on employee
import "./advanceTransaction.js";   // depends on employee
import "./salaryInvoice.js";        // depends on employee

// ─── Stock / Inventory ────────────────────────────────────────────────────────
import "./suppliers.js";
import "./unitsOfMeasures.js";
import "./stockCategories.js";
import "./stockItem.js";
import "./stockLevel.js";
import "./stockTransactions.js";
import "./purchaseItem.js";

// ─── Tasks / Misc ─────────────────────────────────────────────────────────────
import "./task.js";
import "./requests.js";
import "./snapshot.js";
import "./medicineSubCategories.js";

// ─── Finance Module ───────────────────────────────────────────────────────────
import "./chartOfAccounts.js";
import "./transactionCategory.js";
import "./financialPeriod.js";
import "./financialSettings.js";
import "./financialTransaction.js";
import "./budget.js";
import "./journalEntry.js";
import "./accountBalance.js";

// Finance associations (must run after all finance models are loaded)
import "./financeAssociations.js";

// ─── Billing / Subscriptions (software-admin) ─────────────────────────────────
import "./subscriptionPlan.js";     // standalone catalog
import "./farmSubscription.js";     // depends on farms, subscription_plans
import "./farmPayment.js";          // depends on farms, farm_subscriptions
import "./farmFeatureFlag.js";      // depends on farms
import "./adminAuditLog.js";        // standalone

// Billing associations (must run after all billing models are loaded)
import "./billingAssociations.js";

// ─── Centralized sync ─────────────────────────────────────────────────────────
// Sequelize sorts models by FK dependency (topological sort) then creates them.
// force: false → CREATE TABLE IF NOT EXISTS (never drops existing data)
(async () => {
    try {
        await sequelize.sync({ force: false });
        logger.info(`All tables synced successfully. (${Object.keys(sequelize.models).length} models)`);
    } catch (error) {
        logger.error("Error syncing tables: " + error.message);
        if (error.parent) logger.error("Failing SQL: " + error.parent.sql);
    }
})();

