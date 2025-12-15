import api from "./api";

// Mengambil data lengkap user (termasuk badge dan behavior)
export const getUserProfile = async () => {
  const response = await api.get("/users/profile"); 
  return response.data;
};

// Update data profile
export const updateUserProfile = async (userData) => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};

// [PENTING] Top Up Saldo
// Endpoint harus sama dengan yang ada di userRoutes.js ('/users/topup')
export const topUpBalance = async (amount) => {
  const response = await api.post("/users/topup", { amount });
  return response.data;
};