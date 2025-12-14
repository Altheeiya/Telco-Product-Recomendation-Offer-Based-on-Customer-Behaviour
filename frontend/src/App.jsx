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
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
<<<<<<< Updated upstream
import CreateProduct from './pages/CreateProduct';
import Dashboard from './pages/Dashboard';
=======
import Profile from './pages/Profile';
import TransactionHistory from './pages/TransactionHistory';
>>>>>>> Stashed changes

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
<<<<<<< Updated upstream
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route 
            path="/products" 
            element={
              <ProtectedRoute>
                <Products />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/create" 
            element={
              <ProtectedRoute>
                <CreateProduct />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/products/:id" 
            element={
              <ProtectedRoute>
                <ProductDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Layout>
    </Router>
=======
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Redirect logged-in users from login/register */}
            <Route 
              path="/register" 
              element={
                isAuthenticated() ? (
                  <Navigate to={isAdmin() ? "/admin/dashboard" : "/products"} replace />
                ) : (
                  <Register />
                )
              } 
            />
            <Route 
              path="/login" 
              element={
                isAuthenticated() ? (
                  <Navigate to={isAdmin() ? "/admin/dashboard" : "/products"} replace />
                ) : (
                  <Login />
                )
              } 
            />
            
            {/* User Protected Routes - Block Admin from accessing these */}
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
            
            {/* Admin Protected Routes - Only Admin can access */}
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

            {/* 404 - Redirect based on role */}
            <Route 
              path="*" 
              element={
                isAuthenticated() ? (
                  isAdmin() ? <Navigate to="/admin/dashboard" replace /> : <Navigate to="/products" replace />
                ) : (
                  <Navigate to="/" replace />
                )
              } 
            />
          </Routes>
        </Layout>
      </Router>
>>>>>>> Stashed changes
    </ErrorBoundary>
  );
}

export default App;