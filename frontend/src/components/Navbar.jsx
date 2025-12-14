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
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
<<<<<<< Updated upstream
          <Link to="/" className="text-2xl font-bold hover:text-red-100 transition">
            Telkom
=======
          <Link to={adminUser ? "/admin/dashboard" : "/"} className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-emerald rounded-full flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold tracking-tight">Telco</span>
>>>>>>> Stashed changes
          </Link>
          
          <div className="flex gap-4 items-center">
            {isAuthenticated() ? (
              <>
<<<<<<< Updated upstream
                <Link to="/products" className="hover:text-red-100 transition">
                  Products
                </Link>
                <Link to="/dashboard" className="hover:text-red-100 transition">
                  Dashboard
                </Link>
                <span className="text-sm">Hi, {user?.username}</span>
=======
                {/* Admin Menu */}
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
                  /* User Menu */
                  <>
                    <Link to="/" className="hidden md:block text-sm font-medium text-gray-300 hover:text-emerald transition">
                      Dashboard
                    </Link>
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

                <div className="flex items-center space-x-3">
                  <Link to={adminUser ? "/admin/dashboard" : "/profile"} className="text-right hidden sm:block hover:opacity-80 transition">
                    <div className="flex items-center gap-2">
                      <div>
                        <p className="text-xs text-gray-400">Welcome,</p>
                        <p className="text-sm font-semibold">{user?.username}</p>
                      </div>
                      {adminUser && (
                        <span className="bg-emerald/20 text-emerald text-[10px] font-bold px-2 py-1 rounded-full border border-emerald/30">
                          ADMIN
                        </span>
                      )}
                    </div>
                  </Link>
                  <Link to={adminUser ? "/admin/dashboard" : "/profile"} className="w-10 h-10 rounded-full bg-emerald flex items-center justify-center text-white font-bold border-2 border-gray-700 hover:border-emerald transition relative">
                    {user?.username?.charAt(0).toUpperCase()}
                    {adminUser && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald rounded-full border-2 border-jet flex items-center justify-center">
                        <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </span>
                    )}
                  </Link>
                </div>
>>>>>>> Stashed changes
                <button
                  onClick={handleLogout}
                  className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-red-100 transition">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-white text-red-600 px-4 py-2 rounded-lg hover:bg-red-50 transition"
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