export const setToken = (token) => {
  localStorage.setItem("token", token);
};

export const getToken = () => {
  return localStorage.getItem("token");
};

export const removeToken = () => {
  localStorage.removeItem("token");
};

export const setUser = (user) => {
  localStorage.setItem("user", JSON.stringify(user));
};

export const getUser = () => {
  const user = localStorage.getItem("user");
  if (!user || user === "undefined" || user === "null") {
    return null;
  }
  try {
    return JSON.parse(user);
  } catch (error) {
    console.error("Error parsing user data:", error);
    // Jika data korup, sebaiknya dihapus agar tidak error terus
    localStorage.removeItem("user");
    return null;
  }
};

export const removeUser = () => {
  localStorage.removeItem("user");
};

// Fungsi logout membersihkan semua storage
export const logout = () => {
  removeToken();
  removeUser();
  // Opsional: Hapus item lain jika ada
  // localStorage.clear(); // Gunakan ini jika ingin menghapus SEMUA data localstorage situs ini
};

export const isAuthenticated = () => {
  // Cek keberadaan token
  return !!getToken();
};

export const isAdmin = () => {
  const user = getUser();
  return user && user.role === 'admin';
};

export const isRegularUser = () => {
  const user = getUser();
  return user && user.role === 'user';
};