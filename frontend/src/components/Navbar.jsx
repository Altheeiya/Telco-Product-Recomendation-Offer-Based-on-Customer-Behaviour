import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getUser, isAdmin } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const adminUser = isAdmin();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-jet text-white shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">

          {/* LOGO */}
          <Link to={adminUser ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Telco</span>
          </Link>

          {/* MENU */}
          <div className="flex gap-4 items-center">
            {isAuthenticated() ? (
              <>
                {/* ===== ADMIN MENU ===== */}
                {adminUser ? (
                  <>
                    <Link to="/admin/dashboard" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Dashboard
                    </Link>
                    <Link to="/admin/products" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Products
                    </Link>
                    <Link to="/admin/users" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Users
                    </Link>
                    <Link to="/admin/transactions" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Transactions
                    </Link>
                  </>
                ) : (
                  /* ===== USER MENU ===== */
                  <>
                    <Link to="/products" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Products
                    </Link>
                    <Link to="/transactions" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      History
                    </Link>
                    <Link to="/profile" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Profile
                    </Link>
                  </>
                )}

                {/* USER INFO */}
                <div className="flex items-center space-x-3">
                  <Link
                    to={adminUser ? "/admin/dashboard" : "/profile"}
                    className="text-right hidden sm:block hover:opacity-80 transition"
                  >
                    <p className="text-xs text-gray-400">Welcome,</p>
                    <p className="text-sm font-semibold">{user?.username}</p>
                  </Link>

                  <Link
                    to={adminUser ? "/admin/dashboard" : "/profile"}
                    className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center text-white font-bold border-2 border-gray-700 hover:border-emerald transition relative"
                  >
                    {user?.username?.charAt(0)?.toUpperCase()}
                    {adminUser && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald rounded-full border-2 border-jet" />
                    )}
                  </Link>
                </div>

                {/* LOGOUT */}
                <button
                  onClick={handleLogout}
                  className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/20 transition text-sm"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm font-medium text-gray-300 hover:text-emerald transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-emerald text-white px-4 py-2 rounded-lg hover:bg-emerald-600 transition text-sm font-semibold"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
