import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Farms from "./farm.js";

const Employee = sequelize.define("employees", {
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
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    father_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    cnic: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    gender: {
        type: DataTypes.ENUM("male", "female", "other"),
        allowNull: false,
    },
    dob: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    doj: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    city: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    marital_status: {
        type: DataTypes.ENUM("single", "married"),
        allowNull: true,
    },
    designation: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    department: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    acc_no: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    leave_allow: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 1,
    },
    salary: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    opening_advance: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    address: {
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
    updatedBy: {
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
    tableName: "employees",
});

Employee.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });

(async () => {
    try {
        await Employee.sync({ alter: true });
        logger.info("Employee table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Employee table:", error);
    }
})
// ();

export default Employee;
