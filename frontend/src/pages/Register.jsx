import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/api/Auth/register", { name, email, password });
      navigate("/login");
    } catch (err) {
      setError(err.response?.data || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md animate-fade-in">

        {/* Card */}
        <div className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-100 overflow-hidden">

          {/* Top accent */}
          <div className="h-1.5 w-full bg-gradient-to-r from-purple-600 via-fuchsia-500 to-rose-500" />

          <div className="px-8 py-9">
            {/* Logo + Heading */}
            <div className="flex flex-col items-center mb-8">
              <img src="/logo.png" alt="Rachel's Store" className="w-14 h-14 object-contain mb-3 drop-shadow" />
              <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Create Your Account
              </h1>
              <p className="text-xs text-slate-500 mt-1 text-center">
                Join{" "}
                <span className="font-semibold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent">
                  Rachel's Store
                </span>{" "}
                and start shopping today
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rachel Nixon"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition duration-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition duration-200"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white p-3.5 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition duration-200"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2 mt-2"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </>
                )}
              </button>
            </form>

            {/* Perks */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              {[
                { icon: "🚚", label: "Free Shipping" },
                { icon: "🔒", label: "Secure Checkout" },
                { icon: "⭐", label: "Exclusive Deals" },
              ].map((perk) => (
                <div
                  key={perk.label}
                  className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl p-3 text-center"
                >
                  <span className="text-lg">{perk.icon}</span>
                  <span className="text-[10px] font-semibold text-slate-500">{perk.label}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-slate-100 mt-6 pt-5 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <Link to="/login" className="font-bold bg-gradient-to-r from-purple-600 to-rose-500 bg-clip-text text-transparent hover:underline">
                Sign In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Register;