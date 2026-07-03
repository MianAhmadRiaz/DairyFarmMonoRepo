import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const FeedFormulationsHistory = sequelize.define("feed_formulations_histories", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    formulation_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    quantity: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    remarks: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    formulationId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "feed_formulations",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
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
    penId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "pen",
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
        paranoid: true,
        tableName: "feed_formulations_histories",
    }
);

(async () => {
    try {
        await FeedFormulationsHistory.sync({ alter: true });
        logger.info("FeedFormulationsHistory table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the FeedFormulationsHistory table:", error);
    }
})
// ();

export default FeedFormulationsHistory;
