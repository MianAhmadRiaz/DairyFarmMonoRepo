import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "./farm.js";
import { MilkOutTypes } from "../constants/index.js";
import Companies from "./companies.js";
import User from "./user.js";
import MilkCategories from "./milkCategories.js";

const MilkOut = sequelize.define("milk_out", {
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
        onDelete: "CASCADE",
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    volume: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    adj_volume: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    fat: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    snf: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    outType: {
        type: DataTypes.ENUM(Object.values(MilkOutTypes)),
        allowNull: false,
    },
    companyId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "companies",
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    categoryId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "milk_categories",
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    animalId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "animals",
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    pricePerLitre: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    totalPrice: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "users",
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "milk_out",
});

MilkOut.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });
MilkOut.belongsTo(Companies, { foreignKey: "companyId", as: "companies" });
MilkOut.belongsTo(User, { foreignKey: "approvedBy", as: "approved" });
MilkOut.belongsTo(MilkCategories, { foreignKey: "categoryId", as: "category" });


(async () => {
    try {
        await MilkOut.sync({ alter: true });
        logger.info("MilkOut table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the MilkOut table:", error);
    }
})
// ();

export default MilkOut;