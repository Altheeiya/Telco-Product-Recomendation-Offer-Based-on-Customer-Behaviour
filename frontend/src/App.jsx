import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { isAuthenticated, isAdmin } from './utils/auth';

// Components
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Public Pages
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';

// User Pages
import Dashboard from './pages/Dashboard'; // ⭐ TAMBAHKAN INI
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Profile from './pages/Profile';
import TransactionHistory from './pages/TransactionHistory';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminProducts from './pages/admin/AdminProducts';
import AdminTransactions from './pages/admin/AdminTransactions';
import CreateProducts from './pages/admin/CreateProducts';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Layout>
          <Routes>

            {/* ================= PUBLIC ================= */}
            <Route path="/" element={<Home />} />

            <Route
              path="/login"
              element={
                isAuthenticated()
                  ? <Navigate to={isAdmin() ? '/admin/dashboard' : '/dashboard'} replace />
                  : <Login />
              }
            />

            <Route
              path="/register"
              element={
                isAuthenticated()
                  ? <Navigate to={isAdmin() ? '/admin/dashboard' : '/dashboard'} replace />
                  : <Register />
              }
            />

            {/* ================= USER ================= */}
            {/* ⭐ ROUTE BARU: Dashboard User */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Dashboard />}
                </ProtectedRoute>
              }
            />

            <Route
              path="/products"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <Navigate to="/admin/products" replace /> : <Products />}
                </ProtectedRoute>
              }
            />

            <Route
              path="/products/:id"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <Navigate to="/admin/products" replace /> : <ProductDetail />}
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Profile />}
                </ProtectedRoute>
              }
            />

            <Route
              path="/transactions"
              element={
                <ProtectedRoute>
                  {isAdmin() ? <Navigate to="/admin/transactions" replace /> : <TransactionHistory />}
                </ProtectedRoute>
              }
            />

            {/* ================= ADMIN ================= */}
            <Route
              path="/admin/dashboard"
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/users"
              element={
                <AdminRoute>
                  <AdminUsers />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/products"
              element={
                <AdminRoute>
                  <AdminProducts />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/products/create"
              element={
                <AdminRoute>
                  <CreateProducts />
                </AdminRoute>
              }
            />

            <Route
              path="/admin/transactions"
              element={
                <AdminRoute>
                  <AdminTransactions />
                </AdminRoute>
              }
            />

            {/* ================= FALLBACK ================= */}
            <Route
              path="*"
              element={
                isAuthenticated()
                  ? (isAdmin()
                      ? <Navigate to="/admin/dashboard" replace />
                      : <Navigate to="/dashboard" replace />)
                  : <Navigate to="/" replace />
              }
            />

          </Routes>
        </Layout>
      </Router>
    </ErrorBoundary>
  );
}

export default App;