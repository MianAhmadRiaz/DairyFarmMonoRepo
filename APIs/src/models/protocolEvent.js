import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Animal from "./animal.js";

const Protocol = sequelize.define("protocol", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
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
    animalId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "animals",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
    },
    start_time: {
        type: DataTypes.TIME,
        allowNull: true,
    },
    min_DIM: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    max_DIM: {
        type: DataTypes.INTEGER,
        allowNull: true,
    }
}, {
    tableName: "protocol",
    timestamps: true,
});

Protocol.belongsTo(Animal, { foreignKey: "animalId", as: "animal" });

(async () => {
    try {
        await Protocol.sync({ alter: true });
        logger.info("Protocol table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Protocol table:", error);
    }
})
// ();

export default Protocol;
