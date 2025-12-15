import { Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, getUser, isAdmin, logout } from '../utils/auth';

const Navbar = () => {
  const navigate = useNavigate();
  const user = getUser();
  const adminUser = isAdmin();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Lock scroll saat menu mobile terbuka
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [open]);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-jet text-white shadow-lg relative z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          
          {/* --- LOGO BARU (Icon Sinyal) + TULISAN LAMA --- */}
          <Link
            to={adminUser ? '/admin/dashboard' : '/'}
            className="flex items-center gap-3 group"
            onClick={closeMenu}
          >
            {/* Icon Container (Baru) */}
            <div className="w-10 h-10 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition duration-300">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-6 w-6 text-white" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
              </svg>
            </div>
            
            {/* Text Tetap "Telco" */}
            <span className="text-xl font-bold">Telco</span>
          </Link>
          {/* ----------------------------------------------- */}

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated() ? (
              <>
                {!adminUser ? (
                  <>
                    <Link to="/dashboard" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Home
                    </Link>
                    <Link to="/products" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Products
                    </Link>
                    <Link to="/transactions" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      History
                    </Link>
                    <Link to="/profile" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Profile
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/dashboard" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Dashboard
                    </Link>
                    <Link to="/admin/products" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Products
                    </Link>
                    <Link to="/admin/users" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Users
                    </Link>
                    <Link to="/admin/transactions" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                      Transactions
                    </Link>
                  </>
                )}

                <div className="text-right ml-4">
                  <p className="text-xs text-gray-400">Welcome,</p>
                  <p className="text-sm font-semibold">{user?.username || 'User'}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg hover:bg-red-500 hover:border-red-500 transition cursor-pointer"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-emerald transition px-3 py-2 rounded-lg">
                  Login
                </Link>
                <Link to="/register" className="bg-emerald px-4 py-2 rounded-lg font-semibold hover:bg-emerald-600 transition">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* HAMBURGER */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-3xl hover:text-emerald transition"
            aria-label="Open menu"
          >
            ☰
          </button>
        </div>
      </nav>

      {/* FULLSCREEN MOBILE MENU */}
      <div
        className={`fixed inset-0 bg-black/90 backdrop-blur-xl text-white z-50
        transform transition-transform duration-300 ease-out
        ${open ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* CLOSE */}
        <button
          onClick={closeMenu}
          className="absolute top-6 right-6 text-3xl hover:text-emerald transition"
          aria-label="Close menu"
        >
          ✕
        </button>

        <div className="h-full flex flex-col justify-center px-8 gap-6 text-lg">
          {isAuthenticated() && (
            <div className="mb-4 pb-4 border-b border-white/20">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-2xl font-bold">{user?.username || 'User'}</p>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
          )}

          {!adminUser ? (
            <>
              <Link 
                to="/dashboard" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                🏠 Home
              </Link>
              <Link 
                to="/products" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                📦 Products
              </Link>
              <Link 
                to="/transactions" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                📜 History
              </Link>
              <Link 
                to="/profile" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                👤 Profile
              </Link>
            </>
          ) : (
            <>
              <Link 
                to="/admin/dashboard" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                📊 Dashboard
              </Link>
              <Link 
                to="/admin/products" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                📦 Products
              </Link>
              <Link 
                to="/admin/users" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                👥 Users
              </Link>
              <Link 
                to="/admin/transactions" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                💳 Transactions
              </Link>
            </>
          )}

          {isAuthenticated() ? (
            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-red-500/20 border border-red-500/50 text-red-400 py-3 rounded-xl text-center hover:bg-red-500 hover:text-white transition font-semibold"
            >
              🚪 Logout
            </button>
          ) : (
            <>
              <Link 
                to="/login" 
                onClick={closeMenu} 
                className="hover:text-emerald transition py-2 px-4 rounded-lg hover:bg-white/10"
              >
                Login
              </Link>
              <Link 
                to="/register" 
                onClick={closeMenu} 
                className="bg-emerald px-4 py-3 rounded-lg text-center hover:bg-emerald-600 transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;