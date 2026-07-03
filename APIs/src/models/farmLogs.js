import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const Logs = sequelize.define("logs", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    message: {
        type: DataTypes.STRING(100),
        allowNull: false,
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
    }
},
    {
        timestamps: true,
        paranoid: true,
        tableName: "logs",
    }
);


(async () => {
    try {
        await Logs.sync({ alter: true });
        logger.info("Logs table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Logs table:", error);
    }
})
// ();

export default Logs;
