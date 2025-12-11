import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout, getUser } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-red-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold hover:text-red-100 transition">
            Telkom
          </Link>
          
          <div className="flex gap-4 items-center">
            {isAuthenticated() ? (
              <>
                <Link to="/products" className="hover:text-red-100 transition">
                  Products
                </Link>
                <Link to="/dashboard" className="hover:text-red-100 transition">
                  Dashboard
                </Link>
                <span className="text-sm">Hi, {user?.username}</span>
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
