import { useState } from "react";
import api from "../api/api";
import { useNavigate, Link } from "react-router-dom";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/api/Auth/register", {
        name,
        email,
        password,
      });

      console.log("REGISTER SUCCESS:", res.data);
      alert("Registered Successfully!");
      navigate("/login");
    } catch (err) {
      console.log("ERROR:", err.response?.data || err.message);
      alert(err.response?.data || "Registration Failed");
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-6 py-8 sm:px-8 bg-white border border-slate-200/80 rounded-2xl shadow-sm mt-12 mb-12 animate-fade-in">
      <h1 className="text-2xl font-bold text-slate-900 text-center tracking-tight">
        Create Your Account
      </h1>
      <p className="text-xs text-slate-500 text-center mt-1 mb-6">
        Get started with MyStore to order premium goods.
      </p>

      <form onSubmit={handleRegister} className="space-y-4">
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Full Name</label>
          <input
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email Address</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
            required
          />
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border border-slate-200 bg-slate-50/50 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition duration-200"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-4 rounded-xl shadow-sm hover:shadow transition duration-200 text-sm flex items-center justify-center gap-2 mt-2"
        >
          Sign Up
        </button>
      </form>

      <div className="border-t border-slate-100 mt-6 pt-5 text-center text-xs text-slate-500">
        Already have an account?{" "}
        <Link to="/login" className="text-blue-600 font-semibold hover:underline">
          Sign In
        </Link>
      </div>
    </div>
  );
}

export default Register;