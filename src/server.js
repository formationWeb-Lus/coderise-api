require("dotenv").config();

const express = require("express");
const cors = require("cors");

const paymentRoutes = require("./routes/payment");
const callbackRoutes = require("./routes/callback");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Coderise API is running 🚀",
    });
});

app.use("/payments", paymentRoutes);
app.use("/serdipay/callback", callbackRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});