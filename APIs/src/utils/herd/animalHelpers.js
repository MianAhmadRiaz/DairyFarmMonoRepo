// Shared helpers for herd (animal) controllers.

// Fields a client must never set directly on an animal record —
// they are derived by the server (ownership, audit, lifecycle state).
const PROTECTED_ANIMAL_FIELDS = [
    "uuid",
    "farmId",
    "createdBy",
    "updatedBy",
    "isDeleted",
    "pregnancyStatusId",
    "lactationStatusId",
    "pregnancy_status",
    "ispregnant",
    "last_event",
    "inseminated_date",
    "calving_date",
];

const stripProtectedAnimalFields = (payload = {}) => {
    const clean = { ...payload };
    PROTECTED_ANIMAL_FIELDS.forEach((field) => delete clean[field]);
    return clean;
};

// Maps an animal to the FarmConfiguration counter column it belongs to,
// derived from lifecycle fields instead of the free-text animalType.
const resolveCategoryCounterField = (animal = {}) => {
    if (animal.is_calve || animal.animalCategory === "calves") return "calves_count";
    if (animal.gender === "male") return "other_count";
    if (animal.animalCategory === "heifers") return "heifers_count";
    if (animal.animalCategory === "milk" || animal.animalCategory === "dry") return "cows_count";
    return "other_count";
};

// Breeding eligibility: only a non-pregnant female can be inseminated.
const assertBreedingEligible = (animal, ApiError) => {
    if (animal.gender !== "female") {
        throw new ApiError("Invalid Details", 400, "Breeding events can only be recorded for female animals.", true);
    }
    if (animal.ispregnant || animal.pregnancy_status === "pregnant") {
        throw new ApiError("Invalid Details", 400, "This animal is already pregnant. Record a calving or abortion before a new breeding event.", true);
    }
};

export { PROTECTED_ANIMAL_FIELDS, stripProtectedAnimalFields, resolveCategoryCounterField, assertBreedingEligible };
