import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const AdminRoleAndPermission = sequelize.define("admin_role_permissions", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    roleId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "admin_roles",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    permissionId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "permissions",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        tableName: "admin_role_permissions",
    }
);


(async () => {
    try {
        await AdminRoleAndPermission.sync({ alter: true });
        logger.info("AdminRoleAndPermission table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the AdminRoleAndPermission table:", error);
    }
})
// ();

export default AdminRoleAndPermission;
