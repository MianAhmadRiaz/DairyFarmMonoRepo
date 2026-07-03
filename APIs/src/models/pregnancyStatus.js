import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const PregnancyStatus = sequelize.define("pregnancy_status", {
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
        type: DataTypes.ENUM("pregnant", "open", "inseminated"),
        allowNull: false,
        defaultValue: "open"
    },
},
    {
        timestamps: true,
        tableName: "pregnancy_status",
    }
);

(async () => {
    try {
        await PregnancyStatus.sync({ alter: true });
        logger.info("PregnancyStatus table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the PregnancyStatus table:", error);
    }
})
// ();

export default PregnancyStatus;
