const express = require("express");
const router = express.Router();

const {
    serdiPayCallback,
} = require("../controllers/paymentController");

router.post("/", serdiPayCallback);

module.exports = router;