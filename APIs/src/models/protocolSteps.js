import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const ProtocolSteps = sequelize.define("protocol_steps", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    protocolId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "protocol",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    injectionType: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    hours_offset: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    tableName: "protocol_steps",
    timestamps: true,
});


(async () => {
    try {
        await ProtocolSteps.sync({ alter: true });
        logger.info("ProtocolSteps table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the ProtocolSteps table:", error);
    }
})
// ();

export default ProtocolSteps;
