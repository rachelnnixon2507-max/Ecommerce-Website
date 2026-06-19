import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { getCartCount } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const cartCount = getCartCount();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname === path;

  const navLinkClass = (path) =>
    `relative py-2 px-3 text-sm font-medium transition-all duration-200 flex items-center gap-1.5 rounded-lg ${
      isActive(path)
        ? "text-purple-700 bg-purple-50"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
    }`;

  return (
    <nav className="sticky top-0 z-50 glass-nav shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">

          {/* Logo / Brand */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <img
              src="/logo.png"
              alt="Rachel's Store Logo"
              className="w-9 h-9 object-contain group-hover:scale-110 transition-transform duration-300 drop-shadow-sm"
            />
            <span className="text-xl font-extrabold bg-gradient-to-r from-purple-700 via-fuchsia-600 to-rose-500 bg-clip-text text-transparent">
              Rachel's Store
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Link to="/" className={navLinkClass("/")}>
              Home
            </Link>

            <Link to="/products" className={navLinkClass("/products")}>
              Products
            </Link>
              
                {user && user.role !== "Admin" && (
                <Link to="/my-orders">My Orders</Link>
                  )}
              
            {isAuthenticated() && !isAdmin() && (
              <Link to="/cart" className={navLinkClass("/cart")}>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
                  />
                </svg>
                <span>Cart</span>
                {cartCount > 0 && (
                  <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gradient-to-r from-purple-600 to-rose-500 px-1 text-[11px] font-bold text-white shadow-sm ring-2 ring-white">
                    {cartCount}
                  </span>
                )}
              </Link>
            )}

            {isAuthenticated() && (
              <Link to="/user" className={navLinkClass("/user")}>
                My Account
              </Link>
            )}

            {isAdmin() && (
              <Link
                to="/admin"
                className={`py-2 px-3 text-sm font-semibold rounded-lg flex items-center gap-1 transition-all duration-200 ${
                  isActive("/admin")
                    ? "text-rose-700 bg-rose-50"
                    : "text-rose-600 hover:text-rose-700 hover:bg-rose-50/50"
                }`}
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
                  />
                </svg>
                Admin
              </Link>
            )}

            <div className="h-6 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 mr-2 text-slate-500 hover:text-slate-900 transition-colors"
              aria-label="Toggle Theme"
            >
              {theme === "light" ? "🌙" : "☀️"}
            </button>

            {!isAuthenticated() ? (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-600 hover:text-slate-900 py-2 px-3.5 rounded-lg transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 py-2 px-4 rounded-lg shadow-sm hover:shadow-md transition duration-200"
                >
                  Register
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3.5">
                <span className="hidden md:inline-block text-xs font-semibold text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-full">
                  Hi, {user?.name} 👋
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm font-medium text-slate-700 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 shadow-sm py-2 px-3.5 rounded-lg flex items-center gap-1.5 transition duration-200"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75"
                    />
                  </svg>
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </nav>
  );
}

export default Navbar;