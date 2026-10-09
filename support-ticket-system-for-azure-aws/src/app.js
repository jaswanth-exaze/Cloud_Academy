
require("dotenv").config();

const express = require("express");
const pool = require("./config/db");

const usersRoutes = require("./routes/users");
const ticketsRoutes = require("./routes/tickets");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "Support Ticket System API is running",
        environment: process.env.NODE_ENV || "production"
    });
});

app.get("/health/db", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT NOW() AS database_time"
        );

        res.json({
            status: "connected",
            databaseTime: result.rows[0].database_time
        });
    } catch (error) {
        console.error("Database health check failed:", error.message);

        res.status(503).json({
            status: "unavailable",
            error: "Database connection failed"
        });
    }
});

app.use("/api/users", usersRoutes);
app.use("/api/tickets", ticketsRoutes);

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log(`Support Ticket API listening on port ${PORT}`);
});

async function shutdown() {
    server.close(async () => {
        await pool.end();
        process.exit(0);
    });
}

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
