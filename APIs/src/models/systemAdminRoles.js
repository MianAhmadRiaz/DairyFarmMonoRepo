import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import AdminRoleAndPermission from "./systmenAdminRoles&Permissions.js";

const AdminRoles = sequelize.define("admin_roles", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING(100),
        allowNull: false,
        defaultValue: "Default description"
    },
    createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
    },
    updatedBy: {
        type: DataTypes.UUID,
        allowNull: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        tableName: "admin_roles",
    }
);

AdminRoles.hasMany(AdminRoleAndPermission, { foreignKey: "roleId", as: "rolePermissions" });
AdminRoleAndPermission.belongsTo(AdminRoles, { foreignKey: "roleId" });

(async () => {
    try {
        await AdminRoles.sync({ alter: true });
        logger.info("AdminRoles table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the AdminRoles table:", error);
    }
})
// ();

export default AdminRoles;
