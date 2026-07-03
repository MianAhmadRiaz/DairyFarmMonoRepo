import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import logger from "../logger/index.js";
import Shed from "./shed.js";

const Pen = sequelize.define("pen", {
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
    shedId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
            model: "sheds",
            key: "uuid",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
    },
    capacity: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    pen_type: {
        type: DataTypes.ENUM('lactating', 'dry', 'heifer', 'calf', 'bull', 'isolation', 'mixed'),
        allowNull: true
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
        tableName: "pen",
        defaultScope: {
            where: {
                isDeleted: false,
            },
        },
    }
);

Pen.belongsTo(Shed, { foreignKey: "shedId", as: "shed" });
Shed.hasMany(Pen, { foreignKey: "shedId", as: "pens" });

(async () => {
    try {
        await Pen.sync({ alter: true });
        logger.info("Pen table created or updated successfully.");
    } catch (error) {
        logger.error("Error creating the Pen table:", error);
    }
})
// ();

export default Pen;
