require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/payment");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/**
 * ==========================================
 * MIDDLEWARES
 * ==========================================
 */

app.use(cors({
    origin: [
        "https://coderise-solution.com",
        "https://www.coderise-solution.com",
        "http://localhost:3000",
    ],
    credentials: true,
}));

app.use(express.json({
    limit: "10mb",
}));

app.use(express.urlencoded({
    extended: true,
    limit: "10mb",
}));

/**
 * ==========================================
 * REQUEST LOGGER
 * ==========================================
 */

app.use((req, res, next) => {

    console.log(
        `[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`
    );

    next();

});

/**
 * ==========================================
 * HEALTH CHECK
 * ==========================================
 */

app.get("/", (req, res) => {

    res.status(200).json({
        success: true,
        service: "CodeRise SerdiPay API",
        version: "1.0.0",
        status: "Running 🚀",
        environment: process.env.NODE_ENV || "development",
        time: new Date().toISOString(),
    });

});

/**
 * ==========================================
 * SERVER STATUS
 * ==========================================
 */

app.get("/health", (req, res) => {

    res.status(200).json({
        success: true,
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
    });

});

/**
 * ==========================================
 * API ROUTES
 * ==========================================
 */

app.use("/api/payment", paymentRoutes);

/**
 * ==========================================
 * 404 NOT FOUND
 * ==========================================
 */

app.use((req, res) => {

    res.status(404).json({
        success: false,
        message: "Route not found.",
    });

});

/**
 * ==========================================
 * GLOBAL ERROR HANDLER
 * ==========================================
 */

app.use(errorHandler);

/**
 * ==========================================
 * START SERVER
 * ==========================================
 */

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {

    console.log("========================================");
    console.log("🚀 CodeRise Payment API Started");
    console.log(`🌍 Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`🚪 Port : ${PORT}`);
    console.log(`🔗 Local : http://localhost:${PORT}`);
    console.log("💳 SerdiPay API Ready");
    console.log("========================================");

});