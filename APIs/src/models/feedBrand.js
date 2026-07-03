import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const FeedBrand = sequelize.define("feed_brands", {
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
    manufacturer: {
        type: DataTypes.STRING(100),
        allowNull: true,
    },
    brand_type: {
        type: DataTypes.ENUM('commercial', 'concentrate', 'premix', 'supplement', 'complete_feed', 'raw_material'),
        allowNull: false,
        defaultValue: 'commercial',
    },
    protein_content: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    energy_content: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    fat_content: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    fiber_content: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: true
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    recommended_usage: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    target_animals: {
        type: DataTypes.STRING(255),
        allowNull: true
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
    tableName: "feed_brands",
    indexes: [
        {
            fields: ['farmId']
        },
        {
            fields: ['brand_type']
        },
        {
            fields: ['is_active']
        }
    ]
});

(async () => {
    try {
        await FeedBrand.sync({ alter: true });
        logger.info("FeedBrand table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FeedBrand table:", error);
    }
})
// ();

export default FeedBrand;