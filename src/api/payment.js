import axios from "axios";

export const createOrder = (amount) => {
  return axios.post("/api/payment/create-order", { amount });
};

export const verifyPayment = (data) => {
  return axios.post("/api/payment/verify", data);
};