import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const ProtocolInfo = sequelize.define("protocol_info", {
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
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    ai_time: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    min_DIM: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    max_DIM: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    injections: {
        type: DataTypes.ARRAY(DataTypes.JSONB),
        allowNull: true
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    tableName: "protocol_info",
    timestamps: true,
});


(async () => {
    try {
        await ProtocolInfo.sync({ alter: true });
        logger.info("ProtocolInfo table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the ProtocolInfo table:", error);
    }
})
// ();

export default ProtocolInfo;
