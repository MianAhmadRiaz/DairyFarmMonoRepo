import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const LactationStatus = sequelize.define("lactation_status", {
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
    status: {
        type: DataTypes.ENUM("milking", "dry"),
        allowNull: false,
        defaultValue: "dry"
    },
},
    {
        timestamps: true,
        tableName: "lactation_status",
    }
);

LactationStatus.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await LactationStatus.sync({ alter: true });
        logger.info("LactationStatus table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the LactationStatus table:", error);
    }
})
// ();

export default LactationStatus;
