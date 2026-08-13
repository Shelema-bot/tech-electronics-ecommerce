import API from "../api/axios";

export const getProductsByCategory = async (category) => {
  const response = await API.get(`/products/category/${category}`);
  return response.data;
};
