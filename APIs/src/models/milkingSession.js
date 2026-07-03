import { DataTypes } from "sequelize";
import User from "./user.js";
import Animal from "./animal.js";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import { MilkingSessions } from "../constants/index.js";

const MilkingSession = sequelize.define("milking_sessions", {
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
            model: Animal,
            key: "uuid",
        },
        onDelete: "CASCADE",
    },
    milkingTime: {
        type: DataTypes.ENUM(Object.values(MilkingSessions)),
        allowNull: false,
    },
    milk: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    milkedBy: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: User,
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    tagUser: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: User,
            key: "uuid",
        },
        onDelete: "SET NULL",
    },
    remarks: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
}, {
    tableName: "milking_sessions",
    timestamps: true,
});

MilkingSession.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });
MilkingSession.belongsTo(User, { foreignKey: "milkedBy", as: "milked" });
MilkingSession.belongsTo(User, { foreignKey: "tagUser", as: "tag" });

Animal.hasMany(MilkingSession, { foreignKey: "animalId", as: "milkingSessions" });
User.hasMany(MilkingSession, { foreignKey: "milkedBy", as: "milkedSessions" });
User.hasMany(MilkingSession, { foreignKey: "tagUser", as: "taggedSessions" });

(async () => {
    try {
        await MilkingSession.sync({ alter: true });
        logger.info("MilkingSession table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the MilkingSession table:", error);
    }
})
// ();
export default MilkingSession;