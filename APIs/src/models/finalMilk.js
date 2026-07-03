import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "./farm.js";

const FinalMilk = sequelize.define("milk", {
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
    milk: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        tableName: "milk",
    }
);

FinalMilk.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });

(async () => {
    try {
        await FinalMilk.sync({ alter: true });
        logger.info("FinalMilk table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FinalMilk table:", error);
    }
})
// ();

export default FinalMilk;
