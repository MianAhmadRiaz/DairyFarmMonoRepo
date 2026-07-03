import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const RecipeGroup = sequelize.define("recipe_groups", {
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
        type: DataTypes.TEXT,
        allowNull: true,
    },
    animal_category: {
        type: DataTypes.ENUM('lactating_cows', 'dry_cows', 'heifers', 'calves', 'bulls', 'pregnant_cows', 'fresh_cows', 'high_producing', 'maintenance'),
        allowNull: false
    },
    nutritional_focus: {
        type: DataTypes.ENUM('high_protein', 'high_energy', 'maintenance', 'growth', 'reproduction', 'milk_production', 'weight_gain'),
        allowNull: true
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    tableName: "recipe_groups",
    indexes: [
        {
            fields: ['farmId']
        },
        {
            fields: ['animal_category']
        },
        {
            fields: ['is_active']
        },
        {
            unique: true,
            fields: ['farmId', 'name', 'isDeleted']
        }
    ]
});

(async () => {
    try {
        await RecipeGroup.sync({ alter: true });
        logger.info("RecipeGroup table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the RecipeGroup table:", error);
    }
})
// ();

export default RecipeGroup;