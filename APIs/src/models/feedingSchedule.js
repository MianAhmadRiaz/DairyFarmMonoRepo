import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Shed from "./shed.js";
import Pen from "./pen.js";
import FeedFormulations from "./feedFormulation.js";

const FeedingSchedule = sequelize.define("feeding_schedules", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    shedId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "sheds",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    penId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "pen",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    formulationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "feed_formulations",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    feeding_date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    meal_time: {
        type: DataTypes.ENUM('morning', 'afternoon', 'evening', 'night'),
        allowNull: false,
        defaultValue: 'morning',
    },
    scheduled_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    actual_quantity: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    animals_count: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    per_animal_quantity: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false
    },
    feeding_status: {
        type: DataTypes.ENUM('scheduled', 'in_progress', 'completed', 'skipped', 'partially_completed'),
        allowNull: false,
        defaultValue: 'scheduled',
    },
    fed_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
    },
    fed_at: {
        type: DataTypes.DATE,
        allowNull: true
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    is_stock_deducted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    paranoid: true,
    tableName: "feeding_schedules",
    indexes: [
        {
            fields: ['farmId']
        },
        {
            fields: ['shedId']
        },
        {
            fields: ['penId']
        },
        {
            fields: ['feeding_date']
        },
        {
            fields: ['feeding_status']
        },
        {
            fields: ['meal_time']
        }
    ]
});

FeedingSchedule.belongsTo(Shed, { foreignKey: "shedId", as: "shed" });
FeedingSchedule.belongsTo(Pen, { foreignKey: "penId", as: "pen" });
FeedingSchedule.belongsTo(FeedFormulations, { foreignKey: "formulationId", as: "feedFormulation" });

(async () => {
    try {
        await FeedingSchedule.sync({ alter: true });
        logger.info("FeedingSchedule table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FeedingSchedule table:", error);
    }
})
// ();

export default FeedingSchedule;