const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const paymentRoutes = require("./routes/payment");
app.use("/api/payment", paymentRoutes);

const PORT = 3000;
app.listen(PORT, () => {
  console.log("SerdiPay VPS running on port", PORT);
});