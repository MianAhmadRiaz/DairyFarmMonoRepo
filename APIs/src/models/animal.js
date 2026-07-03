import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Tag from "./tag.js";
import Pen from "./pen.js";
import Bull from "./bull.js";
import PregnancyStatus from "./pregnancyStatus.js";

const Animal = sequelize.define("animals", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "farms",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    penId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "pen",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "tag",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    tagName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    pregnancyStatusId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "pregnancy_status",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    pregnancy_status: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "open",
    },
    lactationStatusId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "lactation_status",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    electronicId: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    temp_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    lactation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    animalType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    breedType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    purchase_from: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: DataTypes.ENUM("male", "female"),
        allowNull: false,
    },
    healthStatus: {
        type: DataTypes.ENUM("sick", "milking", "culling"),
        defaultValue: "milking",
        allowNull: true,
    },
    animalCategory: {
        type: DataTypes.ENUM("dry", "milk", "heifers", "calves"),
        defaultValue: "milk",
        allowNull: false,
    },
    ispregnant: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    arrivalDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    birthdate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    price: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    animalWeight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    weightDate: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    picture: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    subcategory: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    is_calve: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    pedigreeInfo: {
        type: DataTypes.JSONB,
        allowNull: true,
    },
    fatherId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "bulls",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    motherId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "animals",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    inseminated_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    calving_date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    last_event: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "animals",
});

Animal.belongsTo(Tag, { foreignKey: "tagId", as: "tag" });
Animal.belongsTo(PregnancyStatus, { foreignKey: "pregnancyStatusId", as: "pregnancyStatus" });
PregnancyStatus.hasOne(Animal, { foreignKey: "pregnancyStatusId", as: "animal" });
Animal.belongsTo(Pen, { foreignKey: "penId", as: "pen" });
Pen.hasMany(Animal, { foreignKey: "penId", as: "animals" });
Animal.belongsTo(Animal, { foreignKey: "motherId", as: "mother" });
Animal.belongsTo(Bull, { foreignKey: "fatherId", as: "father" });
Bull.hasMany(Animal, { foreignKey: "fatherId", as: "father" });

(async () => {
    try {
        await Animal.sync({ alter: true });
        logger.info("Animal table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Animal table:", error);
    }
})
// ();

export default Animal;
