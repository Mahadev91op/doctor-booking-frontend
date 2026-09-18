import API from "../api/axios";

const getToken = () => localStorage.getItem("token");

export const createSubscriptionOrder = async (plan) => {
  const response = await API.post(
    "/payment/subscription/create-order",
    { plan },
    {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    },
  );

  return response.data;
};

export const verifySubscriptionPayment = async (paymentData) => {
  const response = await API.post("/payment/subscription/verify", paymentData, {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const getSubscriptionStatus = async () => {
  const response = await API.get("/payment/subscription/status", {
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  return response.data;
};

export const simulateSubscriptionPayment = async (plan = "monthly") => {
  const orderRes = await createSubscriptionOrder(plan);
  const verifyRes = await verifySubscriptionPayment({
    razorpay_order_id: orderRes.order.id,
    razorpay_payment_id: "pay_test_sub_" + Date.now(),
    razorpay_signature: "mock_signature_test",
  });
  return verifyRes;
};

