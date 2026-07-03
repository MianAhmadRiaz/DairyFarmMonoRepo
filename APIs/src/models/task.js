import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import User from "./user.js";

const Tasks = sequelize.define("tasks", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    task: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(200),
        allowNull: true,
    },
    priority: {
        type: DataTypes.ENUM("low", "medium", "high"),
        allowNull: true,
        defaultValue: "medium",
    },
    dead_line: {
        type: DataTypes.DATEONLY,
        allowNull: true,
    },
    assign_date: {
        type: DataTypes.DATEONLY,
        allowNull: true,
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
    assigned_to: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "users",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
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
},
    {
        timestamps: true,
        paranoid: true,
        tableName: "tasks",
        defaultScope: {
            where: {
                isDeleted: false,
            },
        },
    }
);

Tasks.belongsTo(User, { foreignKey: "assigned_to", as: "user" });

(async () => {
    try {
        await Tasks.sync({ alter: true });
        logger.info("Tasks table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Tasks table:", error);
    }
})
// ();

export default Tasks;
