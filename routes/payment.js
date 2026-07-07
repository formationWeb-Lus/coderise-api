const express = require("express");
const router = express.Router();

const {
  initiatePayment,
  paymentCallback,
} = require("../controllers/serdipay.controller");

router.post("/initiate", initiatePayment);

router.post("/callback", paymentCallback);

module.exports = router;