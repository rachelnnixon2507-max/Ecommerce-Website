import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

function UserPage() {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-purple-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-slate-800">Access Denied</h1>
        <p className="text-slate-500 mt-2 mb-6">Please sign in to access your account dashboard.</p>
        <Link
          to="/login"
          className="inline-flex bg-gradient-to-r from-purple-600 to-rose-500 text-white font-semibold py-2.5 px-6 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition"
        >
          Sign In
        </Link>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const quickActions = [
    { to: "/products", label: "Browse Catalogue", icon: "🛍️", color: "from-blue-50 to-indigo-50 text-blue-700 border-blue-100 hover:border-blue-300" },
    ...(user.role !== "Admin" 
      ? [{ to: "/cart", label: "My Cart", icon: "🛒", color: "from-purple-50 to-fuchsia-50 text-purple-700 border-purple-100 hover:border-purple-300" }]
      : []),
    ...(user.role === "Admin"
      ? [{ to: "/admin", label: "Admin Dashboard", icon: "⚙️", color: "from-rose-50 to-orange-50 text-rose-700 border-rose-100 hover:border-rose-300" }]
      : []),
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* Page Header */}
      <div className="mb-8 border-b border-slate-200 pb-6 flex items-center gap-3">
        <img src="/logo.png" alt="Rachel's Store" className="w-8 h-8 object-contain" />
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            My Account
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Rachel's Store — Your personal dashboard
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">

        {/* Profile Card */}
        <div className="md:col-span-1 bg-white border border-slate-200 rounded-3xl p-6 text-center shadow-sm overflow-hidden relative">
          {/* Gradient bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500" />

          <div className="mt-2">
            <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-rose-400 rounded-full flex items-center justify-center mx-auto mb-4 text-white font-extrabold text-2xl shadow-lg shadow-purple-200">
              {initials}
            </div>
            <h2 className="text-xl font-extrabold text-slate-900 leading-snug">{user.name}</h2>
            <p className="text-xs font-medium text-slate-400 mt-1 truncate px-4">{user.email}</p>

            <div className="mt-4">
              {user.role === "Admin" ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 ring-1 ring-rose-600/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  Admin Privilege
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 ring-1 ring-purple-500/15">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                  Verified Member
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                { label: "Member Since", value: "2024" },
                { label: "Account Type", value: user.role },
              ].map((s) => (
                <div key={s.label} className="bg-slate-50 rounded-2xl p-3">
                  <p className="text-xs text-slate-400 font-medium">{s.label}</p>
                  <p className="text-sm font-bold text-slate-800 mt-0.5">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Panel */}
        <div className="md:col-span-2 space-y-5">

          {/* Welcome Card */}
          <div className="bg-gradient-to-br from-purple-600 via-fuchsia-600 to-rose-500 rounded-3xl p-6 text-white shadow-xl shadow-purple-200 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-8 translate-x-8" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-8 -translate-x-4" />
            <div className="relative">
              <p className="text-sm font-medium text-white/80 mb-1">Welcome back 👋</p>
              <h3 className="text-2xl font-extrabold tracking-tight">{user.name}</h3>
              <p className="text-white/70 text-sm mt-2 leading-relaxed">
                Happy to see you at Rachel's Store! Explore our latest collection of premium electronics and accessories.
              </p>
              <Link
                to="/products"
                className="inline-flex mt-4 bg-white text-purple-700 font-bold text-sm py-2.5 px-5 rounded-xl shadow-md hover:shadow-lg transition duration-200 gap-2 items-center"
              >
                Shop Now
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {quickActions.map((action) => (
                <Link
                  key={action.to}
                  to={action.to}
                  className={`flex items-center gap-3 bg-gradient-to-br ${action.color} border rounded-2xl p-4 font-semibold text-sm transition-all duration-200 hover:shadow-sm hover:-translate-y-0.5`}
                >
                  <span className="text-xl">{action.icon}</span>
                  {action.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account Info */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-800 mb-4">Account Details</h3>
            <div className="space-y-3">
              {[
                { label: "Full Name", value: user.name, icon: "👤" },
                { label: "Email Address", value: user.email, icon: "✉️" },
                { label: "Account Role", value: user.role, icon: "🔑" },
              ].map((field) => (
                <div key={field.label} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                  <span className="text-lg">{field.icon}</span>
                  <div>
                    <p className="text-xs text-slate-400 font-medium">{field.label}</p>
                    <p className="text-sm font-semibold text-slate-800 mt-0.5">{field.value}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserPage;
