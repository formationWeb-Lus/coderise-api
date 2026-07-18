require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/payment");
const errorHandler = require("./middleware/errorHandler");

const app = express();

/**
 * ==========================================
 * CORS
 * ==========================================
 */
app.use(
  cors({
    origin: [
      "https://coderise-solution.com",
      "https://www.coderise-solution.com",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

/**
 * ==========================================
 * BODY PARSER
 * ==========================================
 */
app.use(
  express.json({
    limit: "10mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb",
  })
);

/**
 * ==========================================
 * REQUEST LOGGER
 * ==========================================
 */
app.use((req, res, next) => {
  console.log("\n========================================");
  console.log("📥 NOUVELLE REQUÊTE");
  console.log("========================================");
  console.log("Date :", new Date().toISOString());
  console.log("IP :", req.ip);
  console.log("Method :", req.method);
  console.log("Route :", req.originalUrl);
  console.log("Headers :");
  console.log(JSON.stringify(req.headers, null, 2));

  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Body :");
    console.log(JSON.stringify(req.body, null, 2));
  }

  console.log("========================================");

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
    environment: process.env.NODE_ENV || "development",
    status: "Running",
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
    memory: process.memoryUsage(),
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

/**
 * ==========================================
 * ROUTES
 * ==========================================
 */
app.use("/api/payment", paymentRoutes);

/**
 * ==========================================
 * JSON ERROR
 * ==========================================
 */
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    console.error("\n========================================");
    console.error("❌ JSON ERROR");
    console.error("========================================");
    console.error("Route :", req.originalUrl);
    console.error("Method :", req.method);
    console.error("Message :", err.message);
    console.error("========================================\n");

    return res.status(400).json({
      success: false,
      message: "JSON invalide.",
      details: err.message,
    });
  }

  next(err);
});

/**
 * ==========================================
 * 404
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
 * ERREURS NODE
 * ==========================================
 */
process.on("uncaughtException", (err) => {
  console.error("\n========================================");
  console.error("❌ UNCAUGHT EXCEPTION");
  console.error("========================================");
  console.error(err);
  console.error("========================================");
});

process.on("unhandledRejection", (reason) => {
  console.error("\n========================================");
  console.error("❌ UNHANDLED REJECTION");
  console.error("========================================");
  console.error(reason);
  console.error("========================================");
});

/**
 * ==========================================
 * START SERVER
 * ==========================================
 */
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("\n========================================");
  console.log("🚀 CodeRise Payment API Started");
  console.log("========================================");
  console.log("Environment :", process.env.NODE_ENV || "development");
  console.log("Port :", PORT);
  console.log("Local :", `http://localhost:${PORT}`);
  console.log("SerdiPay :", "READY");
  console.log("========================================\n");
});