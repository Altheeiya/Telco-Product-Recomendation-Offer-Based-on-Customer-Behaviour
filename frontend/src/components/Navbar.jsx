import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { isAuthenticated, getUser, isAdmin, removeUser } from '../utils/auth';

const Navbar = () => {
  const user = getUser();
  const adminUser = isAdmin();
  const [open, setOpen] = useState(false);

  const closeMenu = () => setOpen(false);

  const handleLogout = () => {
    removeUser();
    window.location.href = '/login';
  };

  // lock scroll saat menu kebuka (biar nggak chaos)
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : 'auto';
  }, [open]);

  return (
    <>
      {/* NAVBAR */}
      <nav className="bg-jet text-white shadow-lg relative z-50">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
          {/* LOGO */}
          <Link
            to={adminUser ? '/admin/dashboard' : '/'}
            className="flex items-center gap-2"
            onClick={closeMenu}
          >
            <div className="w-8 h-8 bg-emerald rounded-full flex items-center justify-center">
              ⚡
            </div>
            <span className="text-xl font-bold">Telco</span>
          </Link>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex gap-4 items-center">
            {isAuthenticated() ? (
              <>
                {!adminUser ? (
                  <>
                    <Link to="/dashboard" className="nav-link">Home</Link>
                    <Link to="/products" className="nav-link">Products</Link>
                    <Link to="/transactions" className="nav-link">History</Link>
                    <Link to="/profile" className="nav-link">Profile</Link>
                  </>
                ) : (
                  <>
                    <Link to="/admin/dashboard" className="nav-link">Dashboard</Link>
                    <Link to="/admin/products" className="nav-link">Products</Link>
                    <Link to="/admin/users" className="nav-link">Users</Link>
                    <Link to="/admin/transactions" className="nav-link">Transactions</Link>
                  </>
                )}

                <div className="text-right">
                  <p className="text-xs text-gray-400">Welcome,</p>
                  <p className="text-sm font-semibold">{user?.username}</p>
                </div>

                <button
                  onClick={handleLogout}
                  className="bg-white/10 border border-white/20 px-4 py-2 rounded-lg hover:bg-white/20 transition"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="nav-link">Login</Link>
                <Link to="/register" className="bg-emerald px-4 py-2 rounded-lg font-semibold">
                  Register
                </Link>
              </>
            )}
          </div>

          {/* HAMBURGER */}
          <button
            onClick={() => setOpen(true)}
            className="md:hidden text-3xl"
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
          className="absolute top-6 right-6 text-3xl"
        >
          ✕
        </button>

        <div className="h-full flex flex-col justify-center px-8 gap-6 text-lg">
          {isAuthenticated() && (
            <div className="mb-4">
              <p className="text-sm text-gray-400">Logged in as</p>
              <p className="text-2xl font-bold">{user?.username}</p>
            </div>
          )}

          {!adminUser ? (
            <>
              <Link to="/dashboard" onClick={closeMenu} className="spotify-link">
                Home
              </Link>
              <Link to="/products" onClick={closeMenu} className="spotify-link">
                Products
              </Link>
              <Link to="/transactions" onClick={closeMenu} className="spotify-link">
                History
              </Link>
              <Link to="/profile" onClick={closeMenu} className="spotify-link">
                Profile
              </Link>
            </>
          ) : (
            <>
              <Link to="/admin/dashboard" onClick={closeMenu} className="spotify-link">
                Dashboard
              </Link>
              <Link to="/admin/products" onClick={closeMenu} className="spotify-link">
                Products
              </Link>
              <Link to="/admin/users" onClick={closeMenu} className="spotify-link">
                Users
              </Link>
              <Link to="/admin/transactions" onClick={closeMenu} className="spotify-link">
                Transactions
              </Link>
            </>
          )}

          {isAuthenticated() ? (
            <button
              onClick={handleLogout}
              className="mt-8 w-full bg-red-500/20 text-red-400 py-3 rounded-xl text-center"
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="spotify-link">
                Login
              </Link>
              <Link to="/register" onClick={closeMenu} className="spotify-link">
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
