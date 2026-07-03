import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";

// Import feeding controllers
import GetPensWithAnimals from "../controllers/feeding/getPensWithAnimals.js";
import GetFeedIngredients from "../controllers/feeding/getFeedIngredients.js";
import GetRecipeGroups from "../controllers/feeding/getRecipeGroups.js";
import CreateRecipeGroup from "../controllers/feeding/createRecipeGroup.js";
import CreateRecipe from "../controllers/feeding/createRecipe.js";
import GetRecipes from "../controllers/feeding/getRecipes.js";
import ApplyFeedRecipeShed from "../controllers/feeding/applyFeedRecipeShed.js";
import ApplyFeedRecipeAdjustableShed from "../controllers/feeding/applyFeedRecipeAdjustableShed.js";
import GetShedFeedReport from "../controllers/feeding/getShedFeedReport.js";
import GetDateWiseFeedReport from "../controllers/feeding/getDateWiseFeedReport.js";
import GetShedFeedStockPrint from "../controllers/feeding/getShedFeedStockPrint.js";
import RecordFeedingActual from "../controllers/feeding/recordFeedingActual.js";
import { AssignPensToShed, CreateShed, GetSheds } from "../controllers/feeding/sheds.js";

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Shed Management Routes
router.get("/sheds", GetSheds);
router.post("/sheds", CreateShed);
router.put("/sheds/assign-pens", AssignPensToShed);

// Recipe Group Management Routes
router.get("/recipe-groups", GetRecipeGroups);
router.post("/recipe-groups", CreateRecipeGroup);

// Recipe Management Routes
router.get("/recipes", GetRecipes);
router.post("/recipes", CreateRecipe);

// Feed Ingredient Management Routes
router.get("/ingredients", GetFeedIngredients);

// Pen and Animal Information Routes
router.get("/pens-with-animals", GetPensWithAnimals);

// Feeding Application Routes
router.post("/apply-recipe-shed", ApplyFeedRecipeShed);
router.post("/apply-recipe-adjustable-shed", ApplyFeedRecipeAdjustableShed);
router.post("/record-actual", RecordFeedingActual);

// Feeding Reports Routes
router.get("/shed-feed-report", GetShedFeedReport);
router.get("/date-wise-feed-report", GetDateWiseFeedReport);
router.get("/shed-feed-stock-print", GetShedFeedStockPrint);

export default router;