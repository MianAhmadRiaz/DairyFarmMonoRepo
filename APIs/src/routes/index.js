import authMiddleware from "../middlewares/authMiddleware.js";
import farmAccessGuard from "../middlewares/farmAccessGuard.js";
import modulePermission from "../middlewares/modulePermission.js";
import { PERMISSIONS as P } from "../constants/rbac.js";
import express from "express";
import AnimalApis from "./animal.js";
import MilkApis from "./milk.js";
import DashboardAPIs from "./dashboard.js"
import AuthAPIs from "./auth.js";
import TagApis from "./tag.js";
import EventsApis from "./events.js";
import PenApis from "./pen.js";
import BreedingEventsApis from "./breedingEvent.js";
import permissionAPIs from "./permissions.js";
import RolesAPIs from "./role.js";
import AdminAPIs from "./admin.js";
import BreedTypesApis from "./breedTypes.js";
import AnimalSUbCategoriesApis from "./animalSubCategories.js";
import AnimalTypesApis from "./animalTypes.js";
import BullsAPIs from "./bull.js";
import ProtocolAPIs from "./protocol.js";
import StockCategoriesAPIs from "./stockCategory.js";
import MedicineCategoriesAPIs from "./medicinceCategory.js";
import StockItemAPIs from "./stockItem.js";
import PurchaseItemAPIs from "./purchaseItem.js";
import SupplierAPIs from "./supplier.js";
import StockTransactionsAPIs from "./stockTransaction.js";
import FeedFormulationsAPIs from "./feedFormulation.js";
import UnitsAPIs from "./units.js";
import StockReportsAPIs from "./StockReports.js";
import CompaniesAPIs from "./company.js";
import MilkCategoriesAPIs from "./milkCategories.js";
import DepartmentAPIs from "./department.js";
import DesignationAPIs from "./designation.js";
import SoftwareAdminAPIs from "../routes/softwareAdmin.js/index.js";
import TasksAPIs from "./tasks.js";
import EmployeeAPIs from "./employee.js";
import SalaryAPIs from "./salary.js";
import RequestsAPIs from "./requests.js";
import AttendanceAPIs from "./attendance.js";
import FeedingAPIs from "./feeding.js";
import FinanceAPIs from "./finance.js";
import TreatmentAPIs from "./treatment.js";

const router = express.Router();

router.use("/software-admin", SoftwareAdminAPIs);
router.use("/auth", AuthAPIs);
// Dashboard stays reachable without the access guard so a suspended/inactive
// farm can still log in and see its subscription status.
router.use("/dashboard", authMiddleware, DashboardAPIs);
// Farm admin, roles and permissions — RBAC is enforced inside each router by
// per-route checkPermission (Owner bypasses). farmAccessGuard also applies so a
// revoked/suspended farm can't manage users.
router.use("/permissions", authMiddleware, farmAccessGuard, permissionAPIs);
router.use("/roles", authMiddleware, farmAccessGuard, RolesAPIs);
router.use("/admin", authMiddleware, farmAccessGuard, AdminAPIs);

// All operational farm modules run behind:
//  1. authMiddleware      — valid JWT
//  2. farmAccessGuard     — revoke/block/inactive/subscription + feature flags
//  3. modulePermission    — RBAC: GET → view perm, mutations → manage perm,
//                            with overrides for sensitive actions.
// The Owner role bypasses (3). `gate` is a small helper to keep mounts readable.
const gate = (mod, ...rest) => [authMiddleware, farmAccessGuard, mod, ...rest];

// Herd — animal registration/edit vs the sensitive remove/cull action.
router.use("/animal", ...gate(modulePermission(P.HERD_VIEW, P.HERD_CREATE, [
    { method: "DELETE", test: () => true, permission: P.HERD_DELETE },
    { method: "PUT", test: () => true, permission: P.HERD_EDIT },
])), AnimalApis);
router.use("/bull", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT)), BullsAPIs);
router.use("/tag", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT)), TagApis);
router.use("/pen", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT)), PenApis);
router.use("/breed-types", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT)), BreedTypesApis);
router.use("/animal-types", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT)), AnimalTypesApis);
router.use("/animal-sub-categories", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT)), AnimalSUbCategoriesApis);
// Events = pen move / tag replace / weight / health-status / REMOVE animal (sensitive).
router.use("/events", ...gate(modulePermission(P.HERD_VIEW, P.HERD_EDIT, [
    { method: "POST", test: (p) => p.includes("remove-animal"), permission: P.ANIMAL_REMOVE },
    { method: "POST", test: (p) => p.includes("health-status"), permission: P.HEALTH_MANAGE },
])), EventsApis);

// Breeding
router.use("/breeding-events", ...gate(modulePermission(P.BREEDING_VIEW, P.BREEDING_MANAGE)), BreedingEventsApis);
router.use("/protocol", ...gate(modulePermission(P.BREEDING_VIEW, P.BREEDING_MANAGE)), ProtocolAPIs);

// Health / treatments
router.use("/treatments", ...gate(modulePermission(P.HEALTH_VIEW, P.HEALTH_MANAGE)), TreatmentAPIs);

// Milk — record sessions vs the sensitive approve-into-tank / dispatch actions.
router.use("/milk", ...gate(modulePermission(P.MILK_VIEW, P.MILK_RECORD, [
    { method: "POST", test: (p) => p.includes("approved"), permission: P.MILK_APPROVE },
    { method: "POST", test: (p) => p.includes("out"), permission: P.MILK_DISPATCH },
])), MilkApis);
router.use("/milk-categories", ...gate(modulePermission(P.MILK_VIEW, P.MILK_RECORD)), MilkCategoriesAPIs);

// Feeding
router.use("/feeding", ...gate(modulePermission(P.FEED_VIEW, P.FEED_MANAGE)), FeedingAPIs);
router.use("/feed-formulation", ...gate(modulePermission(P.FEED_VIEW, P.FEED_MANAGE)), FeedFormulationsAPIs);

// Stock — item/consumption management vs the sensitive purchases.
router.use("/stock-items", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_MANAGE)), StockItemAPIs);
router.use("/stock-categories", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_MANAGE)), StockCategoriesAPIs);
router.use("/medicine-categories", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_MANAGE)), MedicineCategoriesAPIs);
router.use("/stock-transactions", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_MANAGE)), StockTransactionsAPIs);
router.use("/stock-reports", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_VIEW)), StockReportsAPIs);
router.use("/purchase-items", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_PURCHASE)), PurchaseItemAPIs);
router.use("/suppliers", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_PURCHASE)), SupplierAPIs);
router.use("/units", ...gate(modulePermission(P.STOCK_VIEW, P.STOCK_MANAGE)), UnitsAPIs);
router.use("/companies", ...gate(modulePermission(P.MILK_VIEW, P.MILK_DISPATCH)), CompaniesAPIs);

// Employees / HR — management vs the sensitive salary generation/payment.
router.use("/employees", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE)), EmployeeAPIs);
router.use("/attendance", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE)), AttendanceAPIs);
router.use("/departments", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE)), DepartmentAPIs);
router.use("/designations", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE)), DesignationAPIs);
router.use("/tasks", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE)), TasksAPIs);
router.use("/requests", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.EMPLOYEE_MANAGE)), RequestsAPIs);
router.use("/salary", ...gate(modulePermission(P.EMPLOYEE_VIEW, P.SALARY_MANAGE, [
    { method: "PUT", test: (p) => p.includes("paid") || p.includes("advance"), permission: P.SALARY_PAY },
    { method: "POST", test: (p) => p.includes("advance"), permission: P.SALARY_PAY },
])), SalaryAPIs);

// Finance — all writes are sensitive.
router.use("/finance", ...gate(modulePermission(P.FINANCE_VIEW, P.FINANCE_MANAGE)), FinanceAPIs);

export default router;
