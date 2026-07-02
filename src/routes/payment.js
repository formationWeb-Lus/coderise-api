const express = require("express");
const router = express.Router();

const {
    initiatePayment,
} = require("../controllers/paymentController");

router.post("/initiate", initiatePayment);

router.get("/initiate", (req, res) => {
    res.json({
        success: true,
        message: "Payment route works!"
    });
});

module.exports = router;