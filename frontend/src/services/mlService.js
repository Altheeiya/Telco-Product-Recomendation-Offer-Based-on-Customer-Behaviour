import api from "./api";

export const generateRecommendation = async (behaviorData) => {
  const response = await api.post("/ml/generate-recommendation", behaviorData);
  return response.data;
};

export const getMyRecommendations = async () => {
  const response = await api.get("/recommendations");
  return response.data;
};

export const checkMLHealth = async () => {
  const response = await api.get("/ml/health");
  return response.data;
};