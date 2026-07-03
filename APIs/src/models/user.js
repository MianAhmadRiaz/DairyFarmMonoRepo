import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Role from "./role.js";
import Farms from "./farm.js";

const User = sequelize.define("users", {
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
    firstname: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    lastname: {
        type: DataTypes.STRING,
        allowNull: false,
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
        allowNull: true,
    },
    roleId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "roles",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    role_name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    createdBy: {
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
    isBlocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otp: {
        type: DataTypes.STRING(10),
        allowNull: true,
    },
    otptype: {
        type: DataTypes.STRING(30),
        allowNull: true,
    },
    otpexpiry: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    // Set when the account is created with a temporary password. The user must
    // set a new password on first login before they can access anything.
    must_reset_password: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
    },
}, {
    timestamps: true,
    tableName: "users",
});

User.belongsTo(Role, { foreignKey: "roleId", as: "role" });
User.belongsTo(Farms, { foreignKey: "farmId", as: "farm" });

(async () => {
    try {
        await User.sync({ alter: true });
        logger.info("User table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the User table:", error);
    }
})
// ();

export default User;
