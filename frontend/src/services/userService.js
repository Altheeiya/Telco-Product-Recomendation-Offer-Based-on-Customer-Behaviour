import api from "./api";

// Mengambil data lengkap user (termasuk badge dan behavior)
export const getUserProfile = async () => {
  const response = await api.get("/users/profile"); 
  // Pastikan URL '/users/profile' sesuai dengan backend-1/server.js atau userRoutes.js Anda.
  // Jika di server.js Anda define app.use('/api/users', userRoutes), maka urlnya benar.
  return response.data;
};

// Update data profile
export const updateUserProfile = async (userData) => {
  const response = await api.put("/users/profile", userData);
  return response.data;
};