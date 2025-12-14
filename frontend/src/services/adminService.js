import axios from 'axios';

const API_URL = 'http://localhost:5173/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  };
};

// Dashboard
export const getDashboardStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dashboard/stats`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard stats:', error.response?.data || error);
    throw error;
  }
};

export const getSalesChart = async (period = 'month') => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/dashboard/sales-chart?period=${period}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching sales chart:', error.response?.data || error);
    throw error;
  }
};

export const getTopProducts = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/dashboard/top-products`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching top products:', error.response?.data || error);
    throw error;
  }
};

export const getRecentTransactions = async (limit = 10) => {
  try {
    const response = await axios.get(
      `${API_URL}/admin/dashboard/recent-transactions?limit=${limit}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching recent transactions:', error.response?.data || error);
    throw error;
  }
};

// Users
export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_URL}/admin/users`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error fetching users:', error.response?.data || error);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/users/${id}`, 
      userData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating user:', error.response?.data || error);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/users/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error deleting user:', error.response?.data || error);
    throw error;
  }
};

// Transactions
export const getAllTransactionsAdmin = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    if (params.userId) queryParams.append('userId', params.userId);
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await axios.get(
      `${API_URL}/admin/transactions?${queryParams.toString()}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching transactions:', error.response?.data || error);
    throw error;
  }
};

// Products
export const createProduct = async (productData) => {
  try {
    const response = await axios.post(
      `${API_URL}/products`, 
      productData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error creating product:', error.response?.data || error);
    throw error;
  }
};

export const updateProduct = async (id, productData) => {
  try {
    const response = await axios.put(
      `${API_URL}/admin/products/${id}`, 
      productData, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error updating product:', error.response?.data || error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/admin/products/${id}`, getAuthHeader());
    return response.data;
  } catch (error) {
    console.error('Error deleting product:', error.response?.data || error);
    throw error;
  }
};

// Reports
export const generateReport = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.startDate) queryParams.append('startDate', params.startDate);
    if (params.endDate) queryParams.append('endDate', params.endDate);
    
    const response = await axios.get(
      `${API_URL}/admin/reports/generate?${queryParams.toString()}`, 
      getAuthHeader()
    );
    return response.data;
  } catch (error) {
    console.error('Error generating report:', error.response?.data || error);
    throw error;
  }
};