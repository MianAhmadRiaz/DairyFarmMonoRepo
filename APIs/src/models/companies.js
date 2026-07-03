import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "./farm.js";

const Companies = sequelize.define("companies", {
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
    country: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    arrival_date: {
        type: DataTypes.DATE,
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
    tableName: "companies",
});

Companies.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });
Farms.hasMany(Companies, { foreignKey: "farmId", as: "company" });

(async () => {
    try {
        await Companies.sync({ alter: true });
        logger.info("Companies table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Companies table:", error);
    }
})
// ();

export default Companies;
