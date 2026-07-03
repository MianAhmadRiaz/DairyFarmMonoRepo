import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const LactationHistory = sequelize.define("lactation_history", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    animalId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "animals",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    lactation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
    },
    pre_calving_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    calving_date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
},
    {
        timestamps: true,
        tableName: "lactation_history",
    }
);

LactationHistory.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await LactationHistory.sync({ alter: true });
        logger.info("LactationHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the LactationHistory table:", error);
    }
})
// ();

export default LactationHistory;
