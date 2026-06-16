import { Routes, Route } from "react-router-dom";

import UserLayout from "./Layouts/UserLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import UserPage from "./pages/UserPage";
import { RequireAuth, RequireAdmin } from "./components/RequireAuth";

function App() {
  return (
    <Routes>
      <Route element={<UserLayout />}>

        {/* Public Pages */}
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<Products />} />
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Logged-in Users */}
        <Route element={<RequireAuth />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/user" element={<UserPage />} />
        </Route>

        {/* Admin Only */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        <Route
          path="/category/:id"
          element={<Products />}
        />
      </Route>
    </Routes>
  );
}

export default App;