import paymentService from "../services/payment.service.js";

export const createPayment = async (req, res) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({
        success: false,
        message: "userId et courseId sont obligatoires.",
      });
    }

    const payment = await paymentService.createPayment({
      userId,
      courseId,
    });

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

export const paymentStatus = async (req, res) => {
  try {
    const { reference } = req.params;

    const status = await paymentService.checkPayment(reference);

    return res.json({
      success: true,
      data: status,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};