import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";

const CalvingOffSprints = sequelize.define("calving_off_sprints", {
    uuid: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
    },
    calvingId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
            model: "calving_events",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    breedType: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    penId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "pen",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    tagId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "tag",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
    },
    weight: {
        type: DataTypes.FLOAT,
        allowNull: true,
    },
    gender: {
        type: DataTypes.ENUM("male", "female"),
        allowNull: false,
    },
    isAlive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    temp_id: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    reason_if_dead: {
        type: DataTypes.STRING,
        allowNull: true,
    },
}, {
    tableName: "calving_off_sprints",
    timestamps: true,
});


(async () => {
    try {
        await CalvingOffSprints.sync({ alter: true });
        logger.info("CalvingOffSprints table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the CalvingOffSprints table:", error);
    }
})
// ();

export default CalvingOffSprints;
