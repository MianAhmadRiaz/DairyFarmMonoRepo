import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const UnitsOfMeasure = sequelize.define("units_of_measures", {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "units_of_measures",
});

(async () => {
    try {
        await UnitsOfMeasure.sync({ alter: true });
        logger.info("UnitsOfMeasure table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the UnitsOfMeasure table:", error);
    }
})
// ();

export default UnitsOfMeasure;
