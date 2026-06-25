import {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

const CartContext = createContext();

// Returns a user-specific localStorage key so different users
// never share the same cart data.
const cartKey = (userId) => (userId ? `cart_${userId}` : "cart_guest");

export function CartProvider({ children, userId, clearCartRef }) {
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem(cartKey(userId));
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // When the logged-in user changes (login / logout), reload their cart.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(cartKey(userId));
      setCart(saved ? JSON.parse(saved) : []);
    } catch {
      setCart([]);
    }
  }, [userId]);

  // Persist cart whenever it changes.
  useEffect(() => {
    localStorage.setItem(cartKey(userId), JSON.stringify(cart));
  }, [cart, userId]);

  const clearCart = () => {
    // Remove the current user's cart from localStorage
    localStorage.removeItem(cartKey(userId));
    setCart([]);
  };

  // Expose clearCart to the Root via ref so AuthProvider can call it on logout.
  useEffect(() => {
    if (clearCartRef) clearCartRef.current = clearCart;
  });

  const addToCart = (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const increaseQuantity = (id) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, quantity: item.quantity - 1 } : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id, quantity) => {
    setCart((prev) =>
      prev.map((item) =>
        item.id === id
          ? { ...item, quantity: quantity < 1 ? 1 : quantity }
          : item
      )
    );
  };

  const getCartTotal = () =>
    cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const getTotal = getCartTotal;

  const getCartCount = () =>
    cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        updateQuantity,
        removeFromCart,
        clearCart,
        getTotal,
        getCartTotal,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
