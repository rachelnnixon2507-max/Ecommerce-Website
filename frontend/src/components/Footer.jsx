import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gradient-to-br from-slate-950 via-slate-900 to-purple-950 text-slate-300 border-t border-slate-800/60 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Rachel's Store Logo"
                className="w-10 h-10 object-contain drop-shadow-sm"
              />
              <span className="text-white text-lg font-extrabold bg-gradient-to-r from-purple-400 via-fuchsia-400 to-rose-400 bg-clip-text text-transparent">
                Rachel's Store
              </span>
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Your ultimate destination for premium electronics and smart accessories — handpicked to power your lifestyle and workflow.
            </p>
            {/* Social Icons */}
            <div className="flex gap-3 pt-1">
              <span className="p-2 bg-slate-800 hover:bg-purple-600 hover:text-white rounded-lg cursor-pointer transition duration-300 text-slate-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.8c4.56-.93 8-4.96 8-9.8z" />
                </svg>
              </span>
              <span className="p-2 bg-slate-800 hover:bg-sky-500 hover:text-white rounded-lg cursor-pointer transition duration-300 text-slate-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                </svg>
              </span>
              <span className="p-2 bg-slate-800 hover:bg-pink-600 hover:text-white rounded-lg cursor-pointer transition duration-300 text-slate-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
              </span>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/products" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  All Products
                </Link>
              </li>
              <li>
                <Link to="/cart" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link to="/user" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Support
            </h3>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block cursor-pointer transition-all duration-200">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block cursor-pointer transition-all duration-200">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block cursor-pointer transition-all duration-200">
                  Help Center
                </span>
              </li>
              <li>
                <span className="hover:text-white hover:translate-x-1 inline-block cursor-pointer transition-all duration-200">
                  Returns & Refunds
                </span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4 uppercase tracking-wider">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                support@rachelsstore.com
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                +91 987654321
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 text-purple-400 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Thrissur, Kerala, India
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="border-t border-slate-800/60 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-3">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="w-5 h-5 object-contain opacity-60" />
            <p>© {new Date().getFullYear()} Rachel's Store. All rights reserved.</p>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-slate-300 cursor-pointer transition">Privacy Policy</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Terms of Service</span>
            <span className="hover:text-slate-300 cursor-pointer transition">Cookie Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;