import api from "./api";

export const getUserRecommendations = async () => {
  const response = await api.get("/recommendations");
  return response.data;
};

export const generateRecommendation = async () => {
  const response = await api.post("/ml/generate-recommendation");
  return response.data;
};
