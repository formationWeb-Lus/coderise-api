const express = require("express");
const router = express.Router();

const {
  initiatePayment,
  serdipayCallback,
} = require("../controllers/serdipay.controller");

router.post("/initiate", initiatePayment);
router.post("/callback", serdipayCallback);

module.exports = router;