import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const FarmConfiguration = sequelize.define("farm_configurations", {
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
    allowed_employees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 10,
    },
    current_employees: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 1,
    },
    allowed_animals: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 10,
    },
    current_animals: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    cows_count: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    heifers_count: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    calves_count: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    other_count: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 0,
    },
    is_milk_report_allow: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    per_animal_rate: {
        type: DataTypes.DOUBLE,
        allowNull: true,
        defaultValue: 100,
    },
    is_mobile_allow: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    is_web_allow: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
},
    {
        timestamps: true,
        tableName: "farm_configurations",
    }
);

(async () => {
    try {
        await FarmConfiguration.sync({ alter: true });
        logger.info("FarmConfiguration table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FarmConfiguration table:", error);
    }
})
// ();

export default FarmConfiguration;
