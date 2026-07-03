import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import User from "./user.js";
import { RequestsStatus } from "../constants/index.js";

const Requests = sequelize.define("requests", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    title: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    response: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    status: {
        type: DataTypes.ENUM(Object.values(RequestsStatus)),
        allowNull: false,
        defaultValue: RequestsStatus.PENDING,
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
    respondBy: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "admins",
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
        tableName: "requests",
    }
);

Requests.belongsTo(User, { foreignKey: "createdBy", as: "user" });

(async () => {
    try {
        await Requests.sync({ alter: true });
        logger.info("Requests table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Requests table:", error);
    }
})
// ();

export default Requests;
