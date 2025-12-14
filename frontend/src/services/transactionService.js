import api from "./api";

export const createTransaction = async (productId) => {
  const response = await api.post("/transactions", { productId });
  return response.data;
};

export const getTransactionHistory = async () => {
  const response = await api.get("/transactions");
  return response.data;
};
