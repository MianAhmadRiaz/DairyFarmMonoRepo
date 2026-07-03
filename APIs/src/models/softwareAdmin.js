import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import AdminRoles from "./systemAdminRoles.js";

const Admin = sequelize.define("admins", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        lowercase: true,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    authentication: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    TwoFASecret: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    roleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "admin_roles",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    must_reset_password: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "admins",
});

Admin.belongsTo(AdminRoles, { foreignKey: "roleId", as: "role" });

(async () => {
    try {
        await Admin.sync({ alter: true });
        logger.info("Admin table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Admin table:", error);
    }
})
// ();

export default Admin;
