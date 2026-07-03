import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import FeedFormulationsItems from "./feedFormulationItems.js";
import RecipeGroup from "./recipeGroup.js";

const FeedFormulations = sequelize.define("feed_formulations", {
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
    recipeGroupId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "recipe_groups",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
    },
    target_animal_count: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    cost_per_kg: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    nutritional_notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    is_default: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    isDeleted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
},
    {
        timestamps: true,
        paranoid: true,
        tableName: "feed_formulations",
    }
);

FeedFormulations.hasMany(FeedFormulationsItems, { foreignKey: "formulationId", as: "items" });
FeedFormulations.belongsTo(RecipeGroup, { foreignKey: "recipeGroupId", targetKey: "uuid", as: "recipeGroup" });
RecipeGroup.hasMany(FeedFormulations, { foreignKey: "recipeGroupId", sourceKey: "uuid", as: "recipes" });

(async () => {
    try {
        await FeedFormulations.sync({ alter: true });
        logger.info("FeedFormulations table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FeedFormulations table:", error);
    }
})
// ();

export default FeedFormulations;
