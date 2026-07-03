import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "./farm.js";

const Storage = sequelize.define("storage", {
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
    temprature: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    weight_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    capacity: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    cuurent_level: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    status: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    tank_id: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    session_id: {
        type: DataTypes.STRING,
        allowNull: false,
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
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "storage",
});

Storage.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });
Farms.hasMany(Storage, { foreignKey: "farmId", as: "storages" });

(async () => {
    try {
        await Storage.sync({ alter: true });
        logger.info("Storage table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Storage table:", error);
    }
})
// ();

export default Storage;
