import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function UserPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
        <p className="text-slate-500 mt-2 mb-6">Please login to access your account dashboard.</p>
        <Link to="/login" className="inline-flex bg-slate-900 text-white font-semibold py-2.5 px-5 rounded-xl transition">
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          My Account
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          View your profile credentials and explore shopping actions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
        
        {/* Profile Details Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-2xl p-6 text-center shadow-sm">
          <div className="w-16 h-16 bg-blue-50 border border-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600 font-extrabold text-2xl">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <h2 className="text-xl font-bold text-slate-800 leading-snug">{user.name}</h2>
          <p className="text-xs font-semibold text-slate-400 mt-1 truncate">{user.email}</p>
          
          <div className="mt-5 pt-4 border-t border-slate-100">
            {user.role === "Admin" ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 ring-1 ring-red-600/15">
                Admin Privilege
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-50 text-slate-600 ring-1 ring-slate-500/10">
                Standard Account
              </span>
            )}
          </div>
        </div>

        {/* Dashboard Actions / Message Panel */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-slate-800">
              Welcome back, {user.name}!
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              From your account dashboard, you can view your personal credentials, manage your shopping cart, and review recent checkouts.
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link to="/products" className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold py-2.5 px-4 rounded-xl transition duration-200 shadow-sm">
                Browse Catalogue
              </Link>
              {user.role === "Admin" && (
                <Link to="/admin" className="bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold py-2.5 px-4 rounded-xl transition duration-200">
                  Open Admin Dashboard
                </Link>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-3">
              Recent Settings
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Security settings, multi-factor authentication, and order receipts are currently disabled. Contact system support for assistance.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default UserPage;
