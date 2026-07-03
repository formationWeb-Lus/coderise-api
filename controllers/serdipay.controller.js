const { pay } = require("../services/serdipay.service");

// 🚀 INIT PAYMENT
exports.initiatePayment = async (req, res) => {
  try {
    const { courseId, amount, phone, telecom } = req.body;

    const result = await pay({
      amount,
      phone,
      telecom,
    });

    return res.json({
      success: true,
      message: "Paiement lancé",
      data: result,
      redirectUrl: `https://coderise-solution.com/dashboard/enrollment/${courseId}/payment?status=pending`,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.response?.data || error.message,
    });
  }
};

// 🔔 CALLBACK SERDIPAY
exports.serdipayCallback = (req, res) => {
  console.log("📩 CALLBACK:", req.body);

  const payment = req.body.payment;

  if (payment?.status === "success") {
    console.log("✅ PAYMENT OK:", payment.transactionId);

    // TODO:
    // - activer cours utilisateur
    // - enregistrer DB
  }

  res.json({ received: true });
};