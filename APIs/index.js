/* eslint-disable no-undef */
import cluster from "cluster";
import "./src/config/db.js";
import "./src/models/index.js"
import "./src/jobs/index.js";
import seedSoftwareAdmin from "./src/seeders/seedSoftwareAdmin.js";
import seedPermissions from "./src/seeders/seedPermissions.js";
import os from "os";
import cors from "cors";
import AppRoutes from "./src/routes/index.js";
import ENV from "./src/config/keys.js";
import print from "./src/utils/print.js";
import { globalErrorHandlerMiddleware, handleApiNotFound, handleUncaughtException } from "./src/utils/globalErrorHandlers.js";
import express from "express";
import { swaggerUi, specs } from "./src/config/swagger.js";

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// Swagger UI setup
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
    explorer: true,
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: "Cattle Care API Documentation",
    swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        docExpansion: 'none',
        filter: true,
        showRequestHeaders: true,
        tryItOutEnabled: true
    }
}));

const production = false;
if (cluster.isPrimary && process.env.NODE_ENV === "production" && production) {
    const cpus = os.cpus().length;
    print("info", `Forking for ${cpus} CPUs`);

    // run nodejs on all cpus available on the System
    for (let i = 0; i < cpus; i++) {
        cluster.fork();
    }

    // respawn a new worker if one dies
    cluster.on("exit", (worker) => {
        print("info", `worker ${worker.process.pid} died`);
        cluster.fork();
    });
} else {
    // helloo
    const dateDeployed = `${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`;
    app.get("/", (req, res) => {
        res.send(`
            <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; text-align: center;">
                <h1>🐄 Cattle Care Web API</h1>
                <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
                <p><strong>Last Deployed:</strong> ${dateDeployed}</p>
                <p><strong>Worker PID:</strong> ${process.pid}</p>
                <div style="margin: 30px 0;">
                    <a href="/api-docs" style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-size: 16px;">
                        📚 View API Documentation
                    </a>
                </div>
                <div style="margin-top: 20px; font-size: 14px; color: #666;">
                    <p>🚀 <strong>Quick Links:</strong></p>
                    <p><a href="/api/v1/salaries/employees" style="color: #2196F3;">Employee Salaries</a> | 
                       <a href="/api-docs" style="color: #2196F3;">Swagger UI</a> | 
                       <a href="/api/v1/" style="color: #2196F3;">API Base</a></p>
                </div>
            </div>
        `);
    });

    // apis
    app.use("/api/v1/", AppRoutes);

    // route not found
    app.use(handleApiNotFound);

    // error handler
    app.use(globalErrorHandlerMiddleware);

    // uncaughtException and unhandledRejection
    process.on("uncaughtException", handleUncaughtException);
    process.on("unhandledRejection", handleUncaughtException);

    app.listen(ENV.PORT, async () => {
        print("info", `Dairy Form is running on port ${ENV.PORT}...`);
        print("info", `This is ${process.env.NODE_ENV} environment...`);
        print("info", `📚 API Documentation available at: http://localhost:${ENV.PORT}/api-docs`);
        print("info", `🏠 Homepage available at: http://localhost:${ENV.PORT}/`);
        // Bootstrap the software-admin account, default plans and the farm-side
        // permission catalog (all idempotent). Delayed slightly so table sync in
        // models/index.js has completed.
        setTimeout(() => {
            seedPermissions().catch((err) => print("error", `Permission seeding failed: ${err.message}`));
            seedSoftwareAdmin().catch((err) => print("error", `Software-admin seeding failed: ${err.message}`));
        }, 3000);
    });

}