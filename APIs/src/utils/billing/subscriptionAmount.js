import Animal from "../../models/animal.js";
import Farms from "../../models/farm.js";
import { applyDiscount, computeGrossAmount } from "./billingUtils.js";

// Live animal count for a farm (used for per-animal billing snapshots).
export async function getFarmAnimalCount(farmId) {
    return Animal.count({ where: { farmId, isDeleted: false } });
}

/**
 * Given a plan and a farm, compute the billable amount for one cycle:
 *  - snapshots the animal count (for per_animal plans)
 *  - applies the farm's per-farm discount
 * @returns {Promise<{ grossAmount, netAmount, animalCount, discount_type, discount_value }>}
 */
export async function computeSubscriptionAmount(plan, farmId) {
    const animalCount = plan.pricing_model === "per_animal" ? await getFarmAnimalCount(farmId) : null;
    const grossAmount = computeGrossAmount(plan, animalCount || 0);

    const farm = await Farms.findOne({ where: { uuid: farmId }, raw: true });
    const discount_type = farm?.discount_type || "none";
    const discount_value = Number(farm?.discount_value || 0);
    const netAmount = applyDiscount(grossAmount, discount_type, discount_value);

    return {
        grossAmount: Number(grossAmount.toFixed(2)),
        netAmount: Number(netAmount.toFixed(2)),
        animalCount,
        discount_type,
        discount_value,
    };
}

export default { getFarmAnimalCount, computeSubscriptionAmount };
