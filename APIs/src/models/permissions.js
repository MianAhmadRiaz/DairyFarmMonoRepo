import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import RoleAndPermission from "./role&Permission.js";

const Permissions = sequelize.define("permissions", {
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
    resource: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    main_resource: {
        type: DataTypes.STRING(50),
        allowNull: true,
    },
    type: {
        type: DataTypes.ENUM("farm", "system_admin"),
        allowNull: false,
        defaultValue: "farm",
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        tableName: "permissions",
    }
);

// Permissions Model
Permissions.hasMany(RoleAndPermission, { foreignKey: "permissionId", as: "rolePermissions" });
RoleAndPermission.belongsTo(Permissions, { foreignKey: "permissionId", as: "permission" });

(async () => {
    try {
        await Permissions.sync({ alter: true });
        logger.info("Permissions table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Permissions table:", error);
    }
})
// ();

export default Permissions;
