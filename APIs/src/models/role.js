import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import RoleAndPermission from "./role&Permission.js";

const Role = sequelize.define("roles", {
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
        type: DataTypes.STRING(255),
        allowNull: false,
        defaultValue: "Default description"
    },
    // The non-deletable account-owner role — bypasses permission checks and
    // cannot be edited/deleted from the UI.
    isOwner: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
    // Marks the seeded default dairy roles so the UI can distinguish them from
    // farm-created custom roles.
    isSystem: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
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
        tableName: "roles",
    }
);

Role.hasMany(RoleAndPermission, { foreignKey: "roleId", as: "rolePermissions" });
RoleAndPermission.belongsTo(Role, { foreignKey: "roleId" });

(async () => {
    try {
        await Role.sync({ alter: true });
        logger.info("Role table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Role table:", error);
    }
})
// ();

export default Role;
