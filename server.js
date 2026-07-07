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
    "http://localhost:3000"
  ],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * ==========================================
 * HEALTH CHECK
 * ==========================================
 */

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "CodeRise SerdiPay API",
    version: "1.0.0",
    status: "Running 🚀",
    time: new Date()
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
 * 404
 * ==========================================
 */

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found."
  });
});

/**
 * ==========================================
 * ERROR HANDLER
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
  console.log("======================================");
  console.log("🚀 CodeRise Payment API Started");
  console.log(`🌍 Port : ${PORT}`);
  console.log(`🔗 Local : http://localhost:${PORT}`);
  console.log(`💳 SerdiPay Ready`);
  console.log("======================================");
});