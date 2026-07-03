import api from '../api/AxiosClient';

/* ─────────────────────────── shared types ─────────────────────────── */

export interface ApiEnvelope<T> {
  statusCode: number;
  success: boolean;
  message: string;
  type: string;
  data: T;
}

export interface PaginationMeta {
  page: number;
  totalPages: number;
  limit: number;
  skip: number;
  totalCount: number;
}

/* ─────────────────────────── recipe groups ─────────────────────────── */

export const ANIMAL_CATEGORIES = [
  'lactating_cows',
  'dry_cows',
  'heifers',
  'calves',
  'bulls',
  'pregnant_cows',
  'fresh_cows',
  'high_producing',
  'maintenance'
] as const;

export const NUTRITIONAL_FOCUS_OPTIONS = [
  'high_protein',
  'high_energy',
  'maintenance',
  'growth',
  'reproduction',
  'milk_production',
  'weight_gain'
] as const;

export interface RecipeGroup {
  uuid: string;
  name: string;
  description?: string | null;
  animal_category: string;
  nutritional_focus?: string | null;
  recipeCount?: number;
  recipes?: {
    uuid: string;
    name: string;
    description?: string | null;
    target_animal_count?: number | null;
    cost_per_kg?: number | string | null;
    is_default?: boolean;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipeGroupsListData extends PaginationMeta {
  groups: RecipeGroup[];
}

export interface CreateRecipeGroupPayload {
  name: string;
  description?: string;
  animal_category: string;
  nutritional_focus?: string;
}

export const getRecipeGroups = (params: { limit?: number; page?: number; groupId?: string } = {}) =>
  api.get('/feeding/recipe-groups', params);

export const createRecipeGroup = (data: CreateRecipeGroupPayload) =>
  api.post('/feeding/recipe-groups', data);

/* ─────────────────────────── recipes ─────────────────────────── */

export interface RecipeIngredientDetail {
  uuid: string;
  quantity: number | string;
  ingredient: {
    uuid: string;
    name: string;
    description?: string | null;
    unit?: string | null;
  } | null;
}

export interface Recipe {
  uuid: string;
  name: string;
  description?: string | null;
  target_animal_count?: number | null;
  cost_per_kg?: number | string | null;
  nutritional_notes?: string | null;
  is_default?: boolean;
  recipeGroup?: {
    uuid: string;
    name: string;
    animal_category?: string;
    nutritional_focus?: string | null;
  } | null;
  ingredients?: RecipeIngredientDetail[];
  ingredientsCount?: number;
  costPerKg?: number | string;
  totalIngredients?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface RecipesListData extends PaginationMeta {
  recipes: Recipe[];
}

export interface CreateRecipePayload {
  name: string;
  description?: string;
  recipeGroupId: string;
  target_animal_count?: number;
  cost_per_kg?: number;
  nutritional_notes?: string;
  is_default?: boolean;
  ingredients: { stockItemId: string; quantity: number }[];
}

export const getRecipes = (
  params: {
    limit?: number;
    page?: number;
    recipeId?: string;
    groupId?: string;
    animal_category?: string;
    is_default?: string;
  } = {}
) => api.get('/feeding/recipes', params);

export const createRecipe = (data: CreateRecipePayload) => api.post('/feeding/recipes', data);

/* ─────────────────────────── feed ingredients ─────────────────────────── */

export interface FeedIngredient {
  uuid: string;
  name: string;
  description?: string | null;
  unit_of_measure?: string | null;
  isAvailable: boolean;
  currentStock: number;
  unitPrice: number;
  category?: { uuid: string; name: string } | null;
}

export interface FeedIngredientsListData extends PaginationMeta {
  ingredients: FeedIngredient[];
}

export const getFeedIngredients = (params: { limit?: number; page?: number; type?: string } = {}) =>
  api.get('/feeding/ingredients', params);

/* ─────────────────────────── sheds & pens ─────────────────────────── */

export const SHED_TYPES = ['lactating', 'dry', 'heifer', 'calf', 'bull', 'mixed'] as const;

export interface ShedPen {
  uuid: string;
  name: string;
  pen_type?: string | null;
  capacity?: number | null;
}

export interface Shed {
  uuid: string;
  name: string;
  description?: string | null;
  capacity?: number | null;
  location?: string | null;
  shed_type?: string | null;
  pens?: ShedPen[];
  createdAt?: string;
}

export interface ShedsListData extends PaginationMeta {
  sheds: Shed[];
}

export interface CreateShedPayload {
  name: string;
  description?: string;
  capacity?: number;
  location?: string;
  shed_type?: string;
}

export const getSheds = (params: { limit?: number; page?: number } = {}) =>
  api.get('/feeding/sheds', params);

export const createShed = (data: CreateShedPayload) => api.post('/feeding/sheds', data);

export const assignPensToShed = (data: { shedId: string | null; penIds: string[] }) =>
  api.put('/feeding/sheds/assign-pens', data);

export interface PenAnimal {
  uuid: string;
  name?: string | null;
  tagName?: string | null;
  animalType?: string | null;
  gender?: string | null;
  healthStatus?: string | null;
}

export interface PenWithAnimals {
  uuid: string;
  name: string;
  pen_type?: string | null;
  capacity?: number | null;
  shedId?: string | null;
  shed?: { uuid: string; name: string; shed_type?: string | null } | null;
  animalCount: number;
  animals: PenAnimal[];
  hasMoreAnimals: boolean;
}

export interface PensWithAnimalsListData extends PaginationMeta {
  pens: PenWithAnimals[];
}

export const getPensWithAnimals = (params: { limit?: number; page?: number; shedId?: string } = {}) =>
  api.get('/feeding/pens-with-animals', params);

/* ─────────────────────────── apply recipe ─────────────────────────── */

export const MEAL_TIMES = ['morning', 'afternoon', 'evening', 'night'] as const;
export type MealTime = (typeof MEAL_TIMES)[number];

export interface ApplyFeedRecipeShedPayload {
  shedId: string;
  recipeId: string;
  feeding_date: string;
  meal_time: string;
  quantity_per_animal?: number;
  auto_calculate?: boolean;
  apply_to_pens?: string[];
  notes?: string;
}

export interface FeedingApplicationResult {
  shedId: string;
  shedName: string;
  recipeId: string;
  recipeName: string;
  feeding_date: string;
  meal_time: string;
  totalAnimals: number;
  totalFeedRequired: string;
  totalCost: string;
  pensAffected: number;
  schedulesCreated: number;
  stockDeducted: boolean;
  penSummary: {
    penId: string;
    penName: string;
    animalCount: number;
    feedQuantity: number;
  }[];
}

export const applyFeedRecipeShed = (data: ApplyFeedRecipeShedPayload) =>
  api.post('/feeding/apply-recipe-shed', data);

export interface PenAdjustment {
  penId: string;
  custom_quantity: number;
  custom_animal_count?: number;
}

export interface ApplyFeedRecipeAdjustableShedPayload {
  shedId: string;
  recipeId: string;
  feeding_date: string;
  meal_time: string;
  pen_adjustments: PenAdjustment[];
  notes?: string;
}

export interface AdjustableFeedingApplicationResult {
  shedId: string;
  shedName: string;
  recipeId: string;
  recipeName: string;
  feeding_date: string;
  meal_time: string;
  totalFeedRequired: string;
  pensAffected: number;
  schedulesCreated: number;
  stockDeducted: boolean;
  penAdjustments: {
    penId: string;
    penName: string;
    actualAnimals: number;
    adjustedAnimals: number;
    feedQuantity: number;
    quantityPerAnimal: string | number;
  }[];
  ingredientConsumption: {
    ingredient: string;
    quantityUsed: string;
    unit: string;
  }[];
}

export const applyFeedRecipeAdjustableShed = (data: ApplyFeedRecipeAdjustableShedPayload) =>
  api.post('/feeding/apply-recipe-adjustable-shed', data);

/* ─────────────────────────── record actual ─────────────────────────── */

export const FEEDING_STATUSES = [
  'scheduled',
  'in_progress',
  'completed',
  'skipped',
  'partially_completed'
] as const;

export interface RecordFeedingActualPayload {
  scheduleId: string;
  actual_quantity: number;
  feeding_status?: string;
  notes?: string;
}

export const recordFeedingActual = (data: RecordFeedingActualPayload) =>
  api.post('/feeding/record-actual', data);

/* ─────────────────────────── shed feed report ─────────────────────────── */

export interface FeedScheduleRow {
  uuid: string;
  feeding_date: string;
  meal_time: string;
  animals_count: number;
  scheduled_quantity: number | string;
  actual_quantity: number | string;
  per_animal_quantity?: number | string;
  feeding_status: string;
  is_stock_deducted: boolean;
  notes?: string | null;
  shed?: { uuid: string; name: string; shed_type?: string | null; location?: string | null } | null;
  pen?: { uuid: string; name: string; pen_type?: string | null; capacity?: number | null } | null;
  recipe?: {
    uuid: string;
    name: string;
    description?: string | null;
    cost_per_kg?: number | string | null;
  } | null;
  estimatedCost: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ShedFeedReportSummary {
  totalSchedules: number;
  totalAnimals: number;
  totalPlannedQuantity: number;
  totalActualQuantity: number;
  totalCost: string;
  statusBreakdown: Record<string, number>;
  mealTimeBreakdown: Record<string, number>;
  averageQuantityPerAnimal: string | number;
  completionRate: string | number;
}

export interface ShedFeedReportData extends PaginationMeta {
  schedules: FeedScheduleRow[];
  summary: ShedFeedReportSummary;
}

export const getShedFeedReport = (
  params: {
    shedId?: string;
    start_date?: string;
    end_date?: string;
    meal_time?: string;
    feeding_status?: string;
    limit?: number;
    page?: number;
  } = {}
) => api.get('/feeding/shed-feed-report', params);

/* ─────────────────────────── date wise feed report ─────────────────────────── */

export interface DateWiseGroup {
  groupKey: string;
  groupName: string;
  schedules: FeedScheduleRow[];
  summary: {
    totalAnimals: number;
    totalPlannedQuantity: number;
    totalActualQuantity: number;
    totalCost: string;
    schedulesCount: number;
    averageQuantityPerAnimal: string | number;
  };
}

export interface DateWiseFeedReportData {
  groupBy: string;
  groups: DateWiseGroup[];
  summary: {
    totalSchedules: number;
    totalAnimals: number;
    totalPlannedQuantity: number;
    totalActualQuantity: number;
    totalCost: string;
    dateRange: { start_date: string; end_date: string };
    statusBreakdown: Record<string, number>;
    averageQuantityPerAnimal: string | number;
    completionRate: string | number;
    topIngredients: { name: string; totalQuantity: string; stockItemId?: string }[];
  };
}

export const getDateWiseFeedReport = (params: {
  start_date: string;
  end_date: string;
  groupBy?: 'date' | 'shed' | 'recipe';
  shedId?: string;
  meal_time?: string;
}) => api.get('/feeding/date-wise-feed-report', params);

/* ─────────────────────────── shed feed stock print ─────────────────────────── */

export interface StockPrintScheduleRow {
  uuid: string;
  pen?: { uuid: string; name: string; pen_type?: string | null; capacity?: number | null } | null;
  recipe?: {
    uuid: string;
    name: string;
    description?: string | null;
    cost_per_kg?: number | string | null;
  } | null;
  animals_count: number;
  scheduled_quantity: number | string;
  actual_quantity: number | string;
  feeding_status: string;
  is_stock_deducted: boolean;
  estimatedCost: string;
  notes?: string | null;
}

export interface MealTimeGroup {
  meal_time: string;
  schedules: StockPrintScheduleRow[];
  subtotal: {
    animals: number;
    plannedQuantity: string;
    actualQuantity: string;
    estimatedCost: string;
    averagePerAnimal: string;
  };
}

export interface IngredientRequirement {
  stockItemId?: string;
  name?: string;
  description?: string | null;
  unit?: string | null;
  totalQuantity: string;
  mealBreakdown: { meal_time: string; quantity: string }[];
}

export interface ShedFeedStockPrintData {
  summary: {
    shedInfo: {
      uuid: string;
      name: string;
      shed_type?: string | null;
      location?: string | null;
      capacity?: number | null;
    };
    feedingDate: string;
    mealTimes: string[];
    totalAnimals: number;
    totalPlannedQuantity: string;
    totalActualQuantity: string;
    totalEstimatedCost: string;
    pensCount: number;
    recipesUsed: number;
    averagePerAnimal: string;
  };
  mealTimeGroups: MealTimeGroup[];
  ingredientRequirements: IngredientRequirement[];
  printMetadata: {
    generatedAt: string;
    generatedBy: string;
    farmId: string;
    includeIngredients: boolean;
  };
}

export const getShedFeedStockPrint = (params: {
  shedId: string;
  feeding_date: string;
  meal_time?: string;
  includeIngredients?: string;
}) => api.get('/feeding/shed-feed-stock-print', params);

/* ─────────────────────────── feed formulations ─────────────────────────── */

export interface FeedFormulationItem {
  uuid: string;
  itemId: string;
  formulation_name?: string;
  formulationId?: string;
  quantity: number | string;
}

export interface FeedFormulation {
  uuid: string;
  name: string;
  description?: string | null;
  recipeGroupId?: string | null;
  cost_per_kg?: number | string | null;
  target_animal_count?: number | null;
  nutritional_notes?: string | null;
  is_default?: boolean;
  items?: FeedFormulationItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface FeedFormulationsListData extends PaginationMeta {
  formulations: FeedFormulation[];
}

export interface CreateFeedFormulationPayload {
  name: string;
  description?: string;
  items: { itemId: string; quantity: number }[];
  recipeGroupId?: string;
  cost_per_kg?: number;
  target_animal_count?: number;
  nutritional_notes?: string;
}

export const getFeedFormulations = (
  params: { limit?: number; page?: number; formulationId?: string } = {}
) => api.get('/feed-formulation', params);

export const createFeedFormulation = (data: CreateFeedFormulationPayload) =>
  api.post('/feed-formulation', data);

/* ─────────────────────────── feed usage ─────────────────────────── */

export interface FeedUsageHistoryRow {
  uuid: string;
  formulationId: string;
  formulation_name: string;
  date: string;
  quantity: number | string;
  penId?: string | null;
  remarks?: string | null;
  createdAt?: string;
}

export interface FeedUsageListData extends PaginationMeta {
  usageHistory: FeedUsageHistoryRow[];
}

export interface CreateFeedUsagePayload {
  formulationId: string;
  quantity: number;
  penId?: string;
  date?: string;
  remarks?: string;
}

export const getFeedUsage = (params: { limit?: number; page?: number; usageId?: string } = {}) =>
  api.get('/feed-formulation/usage', params);

export const createFeedUsage = (data: CreateFeedUsagePayload) =>
  api.post('/feed-formulation/usage', data);
