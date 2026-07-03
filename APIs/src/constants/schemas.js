import Joi from "joi";
import { NAME_REGEX, PASSWORD_REGEX, NUMBER_REGEX } from "./regex.js";
import { MilkingSessions } from "./index.js";

const AddAnimalSchema = Joi.object().options({ abortEarly: false }).keys({
    penId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The pen ID must be a valid UUID.",
            "any.required": "penId is required.",
        }),
    tagId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The tag ID must be a valid UUID.",
            "any.required": "tagId is required.",
        }),
    motherId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .optional()
        .messages({
            "string.guid": "The mother ID must be a valid UUID.",
        }),
    fatherId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .optional()
        .messages({
            "string.guid": "The father ID must be a valid UUID.",
        }),
    electronicId: Joi.string()
        .required()
        .messages({
            "string.base": "electronicId must be a string.",
            "any.required": "electronicId is required.",
            "string.empty": "electronicId can not be empty",
        }),
    name: Joi.string()
        .required()
        .messages({
            "string.base": "name must be a string.",
            "any.required": "name is required.",
            "string.empty": "name can not be empty",

        }),
    animalType: Joi.string()
        .required()
        .messages({
            "string.base": "animalType must be a string.",
            "any.required": "animalType is required.",
            "string.empty": "animalType can not be empty",
        }),
    breedType: Joi.string()
        .required()
        .messages({
            "string.base": "breedType must be a string.",
            "any.required": "breedType is required.",
            "string.empty": "breedType can not be empty",
        }),
    purchase_from: Joi.string()
        .required()
        .messages({
            "string.base": "purchase_from must be a string.",
            "any.required": "purchase_from is required.",
            "string.empty": "purchase_from can not be empty",
        }),
    country: Joi.string()
        .required()
        .messages({
            "string.base": "country must be a string.",
            "any.required": "country is required.",
            "string.empty": "country can not be empty",
        }),
    gender: Joi.string()
        .lowercase()
        .valid("male", "female")
        .required()
        .messages({
            "string.base": "gender must be a string.",
            "any.only": "gender must be one of [Male, Female].",
            "any.required": "gender is required.",
            "string.empty": "gender can not be empty",
        }),
    type: Joi.string()
        .required()
        .messages({
            "string.base": "type must be a string.",
            "any.required": "type is required.",
            "string.empty": "type can not be empty",
        }),
    arrivalDate: Joi.date()
        .required()
        .messages({
            "date.base": "arrivalDate must be a valid date.",
            "any.required": "arrivalDate is required.",
        }),
    insaminated_date: Joi.date()
        .optional()
        .messages({
            "date.base": "insaminated date must be a valid date.",
            "string.empty": "insaminated can not be empty",
        }),
    calving_date: Joi.date()
        .optional()
        .messages({
            "date.base": "calving date must be a valid date.",
            "string.empty": "calving date can not be empty",
        }),
    birthdate: Joi.date()
        .optional()
        .messages({
            "date.base": "birthdate must be a valid date.",
            "string.empty": "birthdate date can not be empty",
        }),
    price: Joi.number()
        .positive()
        .strict()
        .optional()
        .messages({
            "number.base": "price must be a number.",
            "number.positive": "price must be a positive number.",
        }),
    animalWeight: Joi.number()
        .positive()
        .strict()
        .optional()
        .messages({
            "number.base": "animalWeight must be a number.",
            "number.positive": "animalWeight must be a positive number.",
        }),
    lactation: Joi.number()
        .positive()
        .strict()
        .optional()
        .messages({
            "number.base": "lactation must be a number.",
            "number.positive": "lactation must be a positive number.",
        }),
    weightDate: Joi.date()
        .optional()
        .messages({
            "date.base": "weightDate must be a valid date.",
            "string.empty": "weightDate date can not be empty",
        }),
    picture: Joi.string()
        .required()
        .messages({
            "string.base": "picture must be a string.",
            "any.required": "picture is required.",
            "string.empty": "picture can not be empty",

        }),
    subcategory: Joi.string()
        .required()
        .messages({
            "string.base": "subcategory must be a string.",
            "any.required": "subcategory is required.",
            "string.empty": "subcategory can not be empty",
        }),
    is_calve: Joi.boolean().optional(),
}).unknown(true);

const UpdateAnimalSchema = Joi.object().options({ abortEarly: false }).keys({
    uuid: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The uuid ID must be a valid UUID.",
            "any.required": "uuid is required.",
        }),
    penId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The pen ID must be a valid UUID.",
            "any.required": "penId is required.",
        }),
    tagId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The tag ID must be a valid UUID.",
            "any.required": "tagId is required.",
        }),
    electronicId: Joi.string()
        .required()
        .messages({
            "string.base": "electronicId must be a string.",
            "any.required": "electronicId is required.",
            "string.empty": "electronicId can not be empty",
        }),
    name: Joi.string()
        .required()
        .messages({
            "string.base": "name must be a string.",
            "any.required": "name is required.",
            "string.empty": "name can not be empty",
        }),
    animalType: Joi.string()
        .required()
        .messages({
            "string.base": "animalType must be a string.",
            "any.required": "animalType is required.",
            "string.empty": "animalType can not be empty",
        }),
    breedType: Joi.string()
        .required()
        .messages({
            "string.base": "breedType must be a string.",
            "any.required": "breedType is required.",
            "string.empty": "breedType can not be empty",
        }),
    purchase_from: Joi.string()
        .required()
        .messages({
            "string.base": "purchase_from must be a string.",
            "any.required": "purchase_from is required.",
            "string.empty": "purchase_from can not be empty",
        }),
    country: Joi.string()
        .required()
        .messages({
            "string.base": "country must be a string.",
            "any.required": "country is required.",
            "string.empty": "country can not be empty",
        }),
    gender: Joi.string()
        .lowercase()
        .valid("male", "female")
        .required()
        .messages({
            "string.base": "gender must be a string.",
            "any.only": "gender must be one of [Male, Female].",
            "any.required": "gender is required.",
            "string.empty": "gender can not be empty",
        }),
    type: Joi.string()
        .required()
        .messages({
            "string.base": "type must be a string.",
            "any.required": "type is required.",
            "string.empty": "type can not be empty",
        }),
    arrivalDate: Joi.date()
        .required()
        .messages({
            "date.base": "arrivalDate must be a valid date.",
            "any.required": "arrivalDate is required.",
        }),
    birthdate: Joi.date()
        .required()
        .messages({
            "date.base": "birthdate must be a valid date.",
            "any.required": "birthdate is required.",
        }),
    price: Joi.number()
        .positive()
        .strict()
        .optional()
        .messages({
            "number.base": "price must be a number.",
            "number.positive": "price must be a positive number.",
        }),
    animalWeight: Joi.number()
        .positive()
        .strict()
        .optional()
        .messages({
            "number.base": "animalWeight must be a number.",
            "number.positive": "animalWeight must be a positive number.",
        }),
    weightDate: Joi.date()
        .optional()
        .messages({
            "date.base": "weightDate must be a valid date.",
        }),
    picture: Joi.string()
        .optional()
        .messages({
            "string.base": "picture must be a string.",
            "string.empty": "picture can not be empty",
        }),
    subcategory: Joi.string()
        .required()
        .messages({
            "string.base": "subcategory must be a string.",
            "any.required": "subcategory is required.",
            "string.empty": "subcategory can not be empty",
        }),
    motherId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .optional()
        .messages({
            "string.guid": "The mother ID must be a valid UUID.",
        }),
    fatherId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .optional()
        .messages({
            "string.guid": "The father ID must be a valid UUID.",
        }),
}).unknown(true);

const getMilkInfoSchema = Joi.object().options({ abortEarly: false }).keys({
    filter: Joi.string()
        .valid("week", "month", "year")
        .required()
        .messages({
            "string.base": "filter must be a string.",
            "any.only": "filter must be one of [week, month, year].",
            "any.required": "filter is required.",
            "string.empty": "filter can not be empty",
        }),
    startDate: Joi.date()
        .required()
        .messages({
            "date.base": "startDate must be a valid date.",
            "any.required": "startDate is required.",
        }),
    endDate: Joi.date()
        .required()
        .messages({
            "date.base": "endDate must be a valid date.",
            "any.required": "endDate is required.",
        })
});

const milkRecordSchema = Joi.object({
    penId: Joi.string()
        .required()
        .messages({
            "string.base": "penId must be a string.",
            "any.required": "penId is required.",
        }),
    animalTagId: Joi.string()
        .required()
        .messages({
            "string.base": "animalTagId must be a string.",
            "any.required": "animalTagId is required.",
        }),
    animalUuid: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.base": "animalUuid must be a string.",
            "string.guid": "animalUuid must be a valid UUID.",
            "any.required": "animalUuid is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "date must be a valid ISO date.",
            "any.required": "date is required.",
        }),
    milk1: Joi.number()
        .positive()
        .precision(1)
        .required()
        .messages({
            "number.base": "milk1 must be a number.",
            "number.positive": "milk1 must be a positive number.",
            "any.required": "milk1 is required.",
        }),
    milk2: Joi.number()
        .positive()
        .precision(1)
        .required()
        .messages({
            "number.base": "milk2 must be a number.",
            "number.positive": "milk2 must be a positive number.",
            "any.required": "milk2 is required.",
        }),
    milk3: Joi.number()
        .positive()
        .precision(1)
        .required()
        .messages({
            "number.base": "milk3 must be a number.",
            "number.positive": "milk3 must be a positive number.",
            "any.required": "milk3 is required.",
        }),
    createdBy: Joi.string()
        .required()
        .messages({
            "string.base": "createdBy must be a string.",
            "any.required": "createdBy is required.",
        }),
});

const milkingSessionSchema = Joi.object({
    animalId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.base": "animalId must be a string.",
            "string.guid": "animalId must be a valid UUID.",
            "any.required": "animalId is required.",
        }),
    tagUser: Joi.string()
        .uuid()
        .optional()
        .messages({
            "string.base": "tagUser must be a string.",
            "string.guid": "tagUser must be a valid UUID.",
        }),
    remarks: Joi.string()
        .optional()
        .messages({
            "string.base": "subcategory must be a string.",
            "string.empty": "subcategory can not be empty",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "date must be a valid ISO date.",
            "any.required": "date is required.",
        }),
    milkingTime: Joi.string().trim()
        .valid(MilkingSessions.AFTERNOON, MilkingSessions.EVENING, MilkingSessions.MORNING)
        .required()
        .messages({
            "any.required": "Milking time is required.",
            "string.base": "Milking time must be a string.",
            "string.empty": "Milking time can not be empty",
            "any.only": `Milking time must be one of [${Object.values(MilkingSessions)}].`,
        }),
    milk: Joi.number()
        .min(0)
        .precision(1)
        .required()
        .messages({
            "number.base": "milk must be a number.",
            "number.min": "milk can not be negative.",
            "any.required": "milk is required.",
        }),
});
const UpdateMilkingSessionSchema = Joi.object({
    animalId: Joi.string()
        .uuid()
        .required()
        .messages({
            "string.base": "animalId must be a string.",
            "string.guid": "animalId must be a valid UUID.",
            "any.required": "animalId is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "date must be a valid ISO date.",
            "any.required": "date is required.",
        }),
    milkingTime: Joi.string().trim()
        .valid(MilkingSessions.AFTERNOON, MilkingSessions.EVENING, MilkingSessions.MORNING)
        .required()
        .messages({
            "any.required": "Milking time is required.",
            "string.base": "Milking time must be a string.",
            "string.empty": "Milking time can not be empty",
            "any.only": `Milking time must be one of [${Object.values(MilkingSessions)}].`,
        }),
    milk: Joi.number()
        .min(0)
        .precision(1)
        .required()
        .messages({
            "number.base": "milk must be a number.",
            "number.min": "milk can not be negative.",
            "any.required": "milk is required.",
        }),
});
const SignUpUserSchema = Joi.object().options({ abortEarly: false }).keys({
    email: Joi.string().lowercase().trim().email()
        .required()
        .messages({
            "any.required": "email is required.",
            "string.email": "please provide valid email.",
            "string.trim": "email can not contain empty space",
            "string.empty": "email can not be empty",
        }),
    name: Joi.string().lowercase().trim().regex(NAME_REGEX)
        .min(2)
        .max(75)
        .required()
        .messages({
            "any.required": "farm name is required",
            "string.trim": "farm name can not contain empty spaces",
            "string.empty": "farm name can not be empty",
            "string.pattern.base": "Please provide a valid farm name.",
        }),
    firstname: Joi.string().lowercase().trim().regex(NAME_REGEX)
        .min(2)
        .max(75)
        .required()
        .messages({
            "any.required": "firstName is required",
            "string.trim": "firstName can not contain empty spaces", // seems to be unnecessary
            "string.empty": "firstName can not be empty",
            "string.pattern.base": "Please provide a valid firstName.",
        }),
    lastname: Joi.string().lowercase().trim().regex(NAME_REGEX)
        .min(2)
        .max(75)
        .required()
        .messages({
            "any.required": "lastName is required",
            "string.trim": "lastName can not contain empty spaces",
            "string.empty": "lastName can not be empty",
            "string.pattern.base": "Please provide a valid lastName.",
        }),
    phoneNumber: Joi.string().lowercase().trim().regex(NUMBER_REGEX)
        .max(15)
        .required()
        .messages({
            "any.required": "phoneNumber is required",
            "string.trim": "phoneNumber can not contain empty spaces",
            "string.empty": "phoneNumber can not be empty",
            "string.pattern.base": "Please provide a valid phoneNumber.",
        }),
    password: Joi.string().trim().regex(PASSWORD_REGEX).min(8)
        .max(16)
        .required()
        .messages({
            "any.required": "password is required",
            "string.trim": "password can not contain empty spaces",
            "string.empty": "password can not be empty",
            "string.min": "password should atleast 8 characters long",
            "string.max": "password can maximum maximum 16 characters.",
            "string.pattern.base": "Please provide valid strong password.",
        }),
    confirmpassword: Joi.string().trim().valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "confirm password does not match with password.",
            "any.required": "confirm password is required",
            "string.trim": "confirm password can not contain empty spaces",
            "string.pattern.base": "Please provide valid strong password.",
        }),
});

const SignInSchema = Joi.object().options({ abortEarly: false }).keys({
    email: Joi.string().lowercase().trim().email()
        .required()
        .messages({
            "any.required": "email is required.",
            "string.email": "please provide valid email.",
            "string.trim": "email can not contain empty space",
            "string.empty": "email can not be empty",
        }),
    password: Joi.string().trim()
        .required()
        .messages({
            "any.required": "password is required",
            "string.trim": "password can not contain empty spaces",
            "string.empty": "password can not be empty",
        }),
}).unknown(false);

const ForgetPasswordEmailSchema = Joi.object().options({ abortEarly: false }).keys({
    email: Joi.string().lowercase().trim().email()
        .required()
        .messages({
            "any.required": "email is required.",
            "string.email": "please provide valid email.",
            "string.trim": "email can not contain empty space",
            "string.empty": "email can not be empty",
        }),
}).unknown(false);

const ResetPasswordSchema = Joi.object().options({ abortEarly: false }).keys({
    password: Joi.string().trim().regex(PASSWORD_REGEX)
        .required()
        .messages({
            "any.required": "password is required",
            "string.trim": "password can not contain empty spaces", // seems to be unnecessary
            "string.empty": "password can not be empty",
            "string.pattern.base": "Please provide valid strong password.",
        }),
    confirmpassword: Joi.string().trim().valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "confirm password does not match with password.",
            "any.required": "confirm password is required",
            "string.trim": "confirm password can not contain empty spaces",
            "string.pattern.base": "Please provide valid strong password.",
        }),
    otp: Joi.number().integer()
        .positive()
        .strict(true)
        .required()
        .messages({
            "any.required": "otp is required",
            "number.base": "invalid otp type",
            "number.positive": "otp can not be negetive",
            "number.integer": "otp type must be integer",
        }),
}).unknown(false);

const SetPasswordSchema = Joi.object().options({ abortEarly: false }).keys({
    currentPassword: Joi.string().trim()
        .required()
        .messages({
            "any.required": "current password is required",
            "string.empty": "current password can not be empty",
        }),
    password: Joi.string().trim().regex(PASSWORD_REGEX).min(8).max(16)
        .required()
        .messages({
            "any.required": "password is required",
            "string.empty": "password can not be empty",
            "string.min": "password should atleast 8 characters long",
            "string.max": "password can maximum 16 characters.",
            "string.pattern.base": "Please provide a valid strong password.",
        }),
    confirmpassword: Joi.string().trim().valid(Joi.ref("password"))
        .required()
        .messages({
            "any.only": "confirm password does not match with password.",
            "any.required": "confirm password is required",
        }),
}).unknown(false);

const AddTagSchema = Joi.object().options({ abortEarly: false }).keys({
    name: Joi.string()
        .required()
        .messages({
            "string.base": "name must be a string.",
            "any.required": "name is required.",
            "string.empty": "name can not be empty",
        })
});

// Generic single-field schema for entities that only require a `name`
// (pens, breed types, animal types, animal sub-categories, injections).
const NameOnlySchema = Joi.object().options({ abortEarly: false }).keys({
    name: Joi.string()
        .required()
        .messages({
            "string.base": "name must be a string.",
            "any.required": "name is required.",
            "string.empty": "name can not be empty",
        })
});

const AddProtocolSchema = Joi.object().options({ abortEarly: false }).keys({
    name: Joi.string()
        .required()
        .messages({
            "string.base": "name must be a string.",
            "any.required": "name is required.",
            "string.empty": "name can not be empty",
        }),
    injections: Joi.array()
        .items(Joi.object().unknown(true))
        .optional()
        .messages({
            "array.base": "injections must be an array.",
        }),
    ai_time: Joi.alternatives()
        .try(Joi.number(), Joi.string())
        .optional(),
    min_DIM: Joi.alternatives()
        .try(Joi.number(), Joi.string())
        .optional(),
    max_DIM: Joi.alternatives()
        .try(Joi.number(), Joi.string())
        .optional(),
});

const tagReplaceSchema = Joi.object({
    oldTagId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The old tag ID must be a valid UUID.",
            "any.required": "The old tag ID is required.",
        }),
    newTagId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The new tag ID must be a valid UUID.",
            "any.required": "The new tag ID is required.",
        }),
    animalId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The animal ID must be a valid UUID.",
            "any.required": "The animal ID is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "The date must be a valid date.",
            "date.format": "The date must be in ISO 8601 format.",
            "any.required": "The date is required.",
        }),
});


const penUpdateSchema = Joi.object({
    oldPenId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The old Pen ID must be a valid UUID.",
            "any.required": "The old Pen ID is required.",
        }),
    newPenId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The new Pen ID must be a valid UUID.",
            "any.required": "The new Pen ID is required.",
        }),
    animalId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The animal ID must be a valid UUID.",
            "any.required": "The animal ID is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "The date must be a valid date.",
            "date.format": "The date must be in ISO 8601 format.",
            "any.required": "The date is required.",
        }),
    reason: Joi.string()
        .optional()
        .messages({
            "string.base": "reason must be a string.",
        }),
});

const removalAnimalSchema = Joi.object({
    animalId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The animal ID must be a valid UUID.",
            "any.required": "The animal ID is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "The date must be a valid date.",
            "date.format": "The date must be in ISO 8601 format.",
            "any.required": "The date is required.",
        }),
    removalCategory: Joi.string()
        .valid("mortality", "sold", "slaughter")
        .required()
        .messages({
            "string.base": "removalCategory must be a string.",
            "any.only": "removalCategory must be one of [mortality, sold, slaughter].",
            "any.required": "removalCategory is required.",
            "string.empty": "removalCategory can not be empty",
        }),
    removalReason: Joi.string()
        .valid("low production", "mastitis", "infertility", "lameness", "injury", "disease", "old age", "surplus", "other")
        .optional()
        .messages({
            "string.base": "removalReason must be a string.",
            "any.only": "removalReason must be one of [low production, mastitis, infertility, lameness, injury, disease, old age, surplus, other].",
        }),
    salePrice: Joi.number()
        .positive()
        .when("removalCategory", {
            is: "sold",
            then: Joi.required(),
            otherwise: Joi.optional(),
        })
        .messages({
            "number.base": "salePrice must be a number.",
            "number.positive": "salePrice must be a positive number.",
            "any.required": "salePrice is required when removalCategory is sold.",
        }),
    comments: Joi.string()
        .optional()
        .allow("")
        .messages({
            "string.base": "comment must be a string.",
        }),
});

// ---------- Breeding event schemas ----------

const uuidField = (label) => Joi.string()
    .guid({ version: ["uuidv4"] })
    .required()
    .messages({
        "string.guid": `The ${label} must be a valid UUID.`,
        "any.required": `${label} is required.`,
    });

const heatEventSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    reason: Joi.string().required().messages({
        "string.base": "reason must be a string.",
        "any.required": "reason is required.",
        "string.empty": "reason can not be empty",
    }),
    comments: Joi.string().optional().allow(""),
});

const aiBreedingSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    cost: Joi.number().min(0).required().messages({
        "number.base": "cost must be a number.",
        "any.required": "cost is required.",
    }),
    dose: Joi.number().integer().min(1).required().messages({
        "number.base": "dose must be a number.",
        "any.required": "dose is required.",
    }),
    tech: Joi.string().optional().allow(""),
    semen: Joi.string().optional().allow(""),
    type: Joi.string().optional().allow(""),
    time: Joi.string().optional().allow(""),
    weight: Joi.number().optional(),
    double_dose: Joi.boolean().optional(),
    semenStockItemId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    comments: Joi.string().optional().allow(""),
});

const bullBreedingSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    bullId: uuidField("bullId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    double_dose: Joi.boolean().optional(),
    comments: Joi.string().optional().allow(""),
});

const pregnancyTestSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    result: Joi.string().lowercase().valid("positive", "negative").required().messages({
        "any.only": "result must be one of [positive, negative].",
        "any.required": "result is required.",
    }),
    technique: Joi.string().valid("by hand", "ultrasound").required().messages({
        "any.only": "technique must be one of [by hand, ultrasound].",
        "any.required": "technique is required.",
    }),
    cost: Joi.number().min(0).required().messages({
        "number.base": "cost must be a number.",
        "any.required": "cost is required.",
    }),
    pg_days: Joi.number().integer().min(0).required().messages({
        "number.base": "pg_days must be a number.",
        "any.required": "pg_days is required.",
    }),
    tech: Joi.string().optional().allow(""),
    recheck: Joi.boolean().optional(),
    breed_date: Joi.date().optional(),
    prev_test_date: Joi.date().optional(),
    exp_dryoff_date: Joi.date().optional(),
    exp_calving_date: Joi.date().optional(),
    breed_with: Joi.string().optional().allow(""),
});

const calvingEventSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    cost: Joi.number().min(0).required().messages({
        "number.base": "cost must be a number.",
        "any.required": "cost is required.",
    }),
    time: Joi.string().optional().allow(""),
    penId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    calving_ease: Joi.number().integer().optional().allow(null),
    lactation: Joi.number().integer().optional().allow(null),
    problems: Joi.string().optional().allow(""),
    comments: Joi.string().optional().allow(""),
    childs: Joi.array().items(Joi.object().keys({
        gender: Joi.string().lowercase().valid("male", "female").required().messages({
            "any.only": "child gender must be one of [male, female].",
            "any.required": "child gender is required.",
        }),
        isAlive: Joi.boolean().required(),
        weight: Joi.number().optional().allow(null),
        reason_if_dead: Joi.string().optional().allow("", null),
        temp_id: Joi.string().optional().allow("", null),
        breedType: Joi.string().optional().allow("", null),
        tagId: Joi.string().optional().allow("", null),
        penId: Joi.string().optional().allow("", null),
        fatherId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow(null),
    })).optional(),
});

const dryOffEventSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    reason: Joi.string().required().messages({
        "string.base": "reason must be a string.",
        "any.required": "reason is required.",
        "string.empty": "reason can not be empty",
    }),
    category: Joi.string().valid("remove", "add").optional(),
    penId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
});

const abortionEventSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    cost: Joi.number().min(0).optional().allow(null),
    milkable: Joi.boolean().optional(),
    penId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    comments: Joi.string().optional().allow(""),
});

const protocolEventSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    name: Joi.string().required().messages({
        "string.base": "name must be a string.",
        "any.required": "name is required.",
        "string.empty": "name can not be empty",
    }),
    min_DIM: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    max_DIM: Joi.alternatives().try(Joi.number(), Joi.string()).optional(),
    start_time: Joi.string().optional().allow(""),
});

// ---------- Stock module schemas ----------

const addStockItemSchema = Joi.object().options({ abortEarly: false }).keys({
    name: Joi.string().required().messages({
        "any.required": "name is required.",
        "string.empty": "name can not be empty",
    }),
    categoryId: Joi.string().guid({ version: ["uuidv4"] }).required().messages({
        "string.guid": "categoryId must be a valid UUID.",
        "any.required": "categoryId is required.",
    }),
    unitId: Joi.string().guid({ version: ["uuidv4"] }).required().messages({
        "string.guid": "unitId must be a valid UUID.",
        "any.required": "unitId is required.",
    }),
    sub_categoryId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    reorder_level: Joi.number().min(0).optional().allow(null),
    description: Joi.string().optional().allow(""),
}).unknown(true);

const addPurchaseItemSchema = Joi.object().options({ abortEarly: false }).keys({
    supplierId: Joi.string().guid({ version: ["uuidv4"] }).required().messages({
        "string.guid": "supplierId must be a valid UUID.",
        "any.required": "supplierId is required.",
    }),
    itemId: Joi.string().guid({ version: ["uuidv4"] }).required().messages({
        "string.guid": "itemId must be a valid UUID.",
        "any.required": "itemId is required.",
    }),
    quantity: Joi.number().positive().required().messages({
        "number.base": "quantity must be a number.",
        "number.positive": "quantity must be a positive number.",
        "any.required": "quantity is required.",
    }),
    cost_per_unit: Joi.number().min(0).required().messages({
        "number.base": "cost_per_unit must be a number.",
        "any.required": "cost_per_unit is required.",
    }),
    date: Joi.date().optional(),
    note: Joi.string().optional().allow(""),
    batch_number: Joi.string().optional().allow(""),
    expiry_date: Joi.date().optional().allow(null, ""),
    is_adjustment: Joi.boolean().optional(),
});

const addStockTransactionSchema = Joi.object().options({ abortEarly: false }).keys({
    itemId: Joi.string().guid({ version: ["uuidv4"] }).required().messages({
        "string.guid": "itemId must be a valid UUID.",
        "any.required": "itemId is required.",
    }),
    quantity: Joi.number().positive().required().messages({
        "number.base": "quantity must be a number.",
        "number.positive": "quantity must be a positive number.",
        "any.required": "quantity is required.",
    }),
    transaction_type: Joi.string().valid("purchase", "usage", "sale").optional(),
    note: Joi.string().optional().allow(""),
    date: Joi.date().optional(),
});

const addSupplierSchema = Joi.object().options({ abortEarly: false }).keys({
    name: Joi.string().required().messages({
        "any.required": "name is required.",
        "string.empty": "name can not be empty",
    }),
    contact: Joi.alternatives().try(Joi.array(), Joi.string()).optional(),
    address: Joi.string().optional().allow(""),
});

// ---------- Milk out schema ----------

const milkOutSchema = Joi.object().options({ abortEarly: false }).keys({
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    volume: Joi.number().positive().required().messages({
        "number.base": "volume must be a number.",
        "number.positive": "volume must be a positive number.",
        "any.required": "volume is required.",
    }),
    outType: Joi.string()
        .valid("sell", "suckler", "employee", "dumped", "other")
        .required()
        .messages({
            "any.only": "outType must be one of [sell, suckler, employee, dumped, other].",
            "any.required": "outType is required.",
        }),
    pricePerLitre: Joi.number().positive()
        .when("outType", { is: "sell", then: Joi.required(), otherwise: Joi.optional().allow(null) })
        .messages({
            "number.base": "pricePerLitre must be a number.",
            "number.positive": "pricePerLitre must be a positive number.",
            "any.required": "pricePerLitre is required when outType is sell.",
        }),
    companyId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    categoryId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    animalId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow("", null),
    fat: Joi.number().min(0).optional().allow(null),
    snf: Joi.number().min(0).optional().allow(null),
    adj_volume: Joi.number().optional().allow(null),
    remarks: Joi.string().optional().allow(""),
});

// ---------- Treatment / health schemas ----------

const addTreatmentSchema = Joi.object().options({ abortEarly: false }).keys({
    animalId: uuidField("animalId"),
    date: Joi.date().required().messages({
        "date.base": "date must be a valid date.",
        "any.required": "date is required.",
    }),
    treatmentType: Joi.string()
        .valid("treatment", "vaccination", "deworming", "hoof trimming", "vet visit", "other")
        .required()
        .messages({
            "any.only": "treatmentType must be one of [treatment, vaccination, deworming, hoof trimming, vet visit, other].",
            "any.required": "treatmentType is required.",
        }),
    diagnosis: Joi.string().optional().allow(""),
    medicineName: Joi.string().optional().allow(""),
    medicineStockItemId: Joi.string().guid({ version: ["uuidv4"] }).optional().allow(null),
    quantityUsed: Joi.number().positive().optional(),
    dosage: Joi.string().optional().allow(""),
    vetName: Joi.string().optional().allow(""),
    cost: Joi.number().min(0).optional(),
    milkWithdrawalDays: Joi.number().integer().min(0).optional(),
    meatWithdrawalDays: Joi.number().integer().min(0).optional(),
    markSick: Joi.boolean().optional(),
    comments: Joi.string().optional().allow(""),
});

const protocolStepSchema = Joi.object().options({ abortEarly: false }).keys({
    protocolId: uuidField("protocolId"),
    injectionType: Joi.string().required().messages({
        "string.base": "injectionType must be a string.",
        "any.required": "injectionType is required.",
        "string.empty": "injectionType can not be empty",
    }),
    hours_offset: Joi.number().optional(),
});

const healthStatusSchema = Joi.object({
    animalId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The animal ID must be a valid UUID.",
            "any.required": "The animal ID is required.",
        }),
    healthStatus: Joi.string()
        .valid("sick", "milking", "culling")
        .required()
        .messages({
            "any.only": "health status must be one of [sick, milking, culling].",
            "any.required": "The health status is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "The date must be a valid date.",
            "date.format": "The date must be in ISO 8601 format.",
            "any.required": "The date is required.",
        }),
});

const weightHistorySchema = Joi.object({
    animalId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The animal ID must be a valid UUID.",
            "any.required": "The animal ID is required.",
        }),
    weight: Joi.number()
        .positive()
        .strict()
        .required()
        .messages({
            "number.base": "Weight must be a number.",
            "number.positive": "Weight must be a positive number.",
            "any.required": "Weight is required.",
        }),
    date: Joi.date()
        .iso()
        .required()
        .messages({
            "date.base": "The date must be a valid date.",
            "date.format": "The date must be in ISO 8601 format.",
            "any.required": "The date is required.",
        }),
});

const milkPerLactationSchema = Joi.object({
    animalId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The animal ID must be a valid UUID.",
            "any.required": "The animal ID is required.",
        }),
    lactation: Joi.number()
        .positive()
        .optional()
        .messages({
            "number.base": "lactation must be a number.",
            "number.positive": "lactation must be a positive number.",
        }),
});

const UpdateStockItemSchema = Joi.object().options({ abortEarly: false }).keys({
    unitId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The unitId must be a valid UUID.",
            "any.required": "unitId is required.",
        }),
    categoryId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The categoryId must be a valid UUID.",
            "any.required": "categoryId is required.",
        }),
    itemId: Joi.string()
        .guid({ version: ["uuidv4"] })
        .required()
        .messages({
            "string.guid": "The itemId must be a valid UUID.",
            "any.required": "itemId is required.",
        }),
    name: Joi.string()
        .required()
        .messages({
            "string.base": "name must be a string.",
            "any.required": "name is required.",
            "string.empty": "name can not be empty",

        }),
    price: Joi.number()
        .positive()
        .strict()
        .required()
        .messages({
            "any.required": "price is required.",
            "number.base": "price must be a number.",
            "number.positive": "price must be a positive number.",
        }),
    reorder_level: Joi.number()
        .positive()
        .strict()
        .required()
        .messages({
            "any.required": "reorder_level is required.",
            "number.base": "reorder_level must be a number.",
            "number.positive": "reorder_level must be a positive number.",
        }),
});
export {
    AddTagSchema,
    NameOnlySchema,
    AddProtocolSchema,
    heatEventSchema,
    aiBreedingSchema,
    bullBreedingSchema,
    pregnancyTestSchema,
    calvingEventSchema,
    dryOffEventSchema,
    abortionEventSchema,
    protocolEventSchema,
    protocolStepSchema,
    addTreatmentSchema,
    milkOutSchema,
    addStockItemSchema,
    addPurchaseItemSchema,
    addStockTransactionSchema,
    addSupplierSchema,
    SignInSchema,
    penUpdateSchema,
    AddAnimalSchema,
    SignUpUserSchema,
    milkRecordSchema,
    tagReplaceSchema,
    getMilkInfoSchema,
    healthStatusSchema,
    UpdateAnimalSchema,
    ResetPasswordSchema,
    SetPasswordSchema,
    weightHistorySchema,
    removalAnimalSchema,
    milkingSessionSchema,
    UpdateStockItemSchema,
    milkPerLactationSchema,
    ForgetPasswordEmailSchema,
    UpdateMilkingSessionSchema
};
