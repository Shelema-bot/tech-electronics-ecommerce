import axios from "axios";

const API_URL = "http://localhost:5000/api/products";

export const getProductsByCategory = async (category) => {
  const response = await axios.get(`${API_URL}/category/${category}`);
  return response.data;
};