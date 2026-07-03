import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Employee from "./employee.js";

const Attendance = sequelize.define("attendance", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    farmId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "farms",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    employee_id: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "employees",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    status: {
        type: DataTypes.ENUM(["present", "absent", "leave"]),
        allowNull: true,
        defaultValue: "present",
    },
}, {
    timestamps: true,
    tableName: "attendance",
});

Attendance.belongsTo(Employee, { foreignKey: "employee_id", as: "employee" });

(async () => {
    try {
        await Attendance.sync({ alter: true });
        logger.info("Attendance table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Attendance table:", error);
    }
})
// ();

export default Attendance;
