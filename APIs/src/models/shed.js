import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const Shed = sequelize.define("sheds", {
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
    description: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    location: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    shed_type: {
        type: DataTypes.ENUM('lactating', 'dry', 'heifer', 'calf', 'bull', 'mixed'),
        allowNull: false,
        defaultValue: 'mixed'
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
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
}, {
    timestamps: true,
    paranoid: true,
    tableName: "sheds",
    indexes: [
        {
            fields: ['farmId']
        },
        {
            fields: ['shed_type']
        },
        {
            fields: ['is_active']
        }
    ]
});

(async () => {
    try {
        await Shed.sync({ alter: true });
        logger.info("Shed table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Shed table:", error);
    }
})
// ();

export default Shed;