import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import User from "./user.js";
import Pen from "./pen.js";
import { MilkQualities } from "../constants/index.js";
import Animal from "./animal.js";
import Farms from "./farm.js";

const MilkIn = sequelize.define("milk_in", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    penId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: Pen,
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    animalId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "animals",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    animal_curr_lactation: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 1,
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
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    milk1: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    milk2: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    milk3: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    totalMilk: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    milkiQuality: {
        type: DataTypes.ENUM(Object.values(MilkQualities)),
        allowNull: false,
    },
    approvedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        tableName: "milk_in",
    }
);

MilkIn.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });
MilkIn.belongsTo(Pen, { foreignKey: "penId", as: "pen" });
MilkIn.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });
Animal.hasMany(MilkIn, { foreignKey: "animalId", as: "milk" });

(async () => {
    try {
        await MilkIn.sync({ alter: true });
        logger.info("MilkIn table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the MilkIn table:", error);
    }
})
// ();

export default MilkIn;
