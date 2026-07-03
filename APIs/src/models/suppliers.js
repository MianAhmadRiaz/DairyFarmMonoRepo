import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const Suppliers = sequelize.define("suppliers", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    contact: {
        type: DataTypes.ARRAY(DataTypes.STRING(20)),
        allowNull: true,
    },
    address: {
        type: DataTypes.STRING(200),
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
        tableName: "suppliers",
        defaultScope: {
            where: {
                isDeleted: false,
            },
        },
    }
);

(async () => {
    try {
        await Suppliers.sync({ alter: true });
        logger.info("Suppliers table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Suppliers table:", error);
    }
})
// ();

export default Suppliers;
