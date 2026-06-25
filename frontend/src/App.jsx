import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import UserLayout from "./layouts/UserLayout";
import Home from "./pages/Home";
import Products from "./pages/Products";
import ProductDetails from "./pages/ProductDetails";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Admin from "./pages/Admin";
import UserPage from "./pages/UserPage";
import { RequireAuth, RequireAdmin } from "./components/RequireAuth";
import MyOrders from "./pages/Orders";

// Import new pages
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";

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
        <Route path="/category/:id" element={<Products />} />

        {/* Logged-in Users */}
        <Route element={<RequireAuth />}>
          <Route path="/cart" element={<Cart />} />
          <Route path="/user" element={<UserPage />} />
          <Route path="/my-orders" element={<MyOrders />} />
          
          {/* New Checkout Routes */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order/:orderId" element={<OrderConfirmation />} />
        </Route>

        {/* Admin Only */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<Admin />} />
        </Route>
        
      </Route>
    </Routes>
  );
}

export default App;