import api from "./api";

export const getUserRecommendations = async () => {
  const response = await api.get("/recommendations");
  return response.data;
};

export const generateRecommendation = async () => {
  const response = await api.post("/recommendations/generate");
  return response.data;
};

// ⭐ FUNGSI BARU
export const checkAndGenerateRecommendations = async () => {
  const response = await api.get("/recommendations/check-and-generate");
  return response.data;
};