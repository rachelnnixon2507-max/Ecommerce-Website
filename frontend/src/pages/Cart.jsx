import { useCart } from "../context/CartContext";
import { Link } from "react-router-dom";

function Cart() {
  const {
    cart,
    removeFromCart,
    increaseQuantity,
    decreaseQuantity,
    getTotal,
  } = useCart();

  if (cart.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-fade-in">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-400">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Your Cart is Empty
          </h1>
          <p className="text-slate-500 mt-2 mb-6 max-w-sm mx-auto text-sm">
            Before you can checkout, you must add some premium items to your shopping cart.
          </p>
          <Link
            to="/products"
            className="inline-flex bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm py-3 px-6 rounded-xl transition duration-200"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">
      
      <div className="mb-8 border-b border-slate-200 pb-5">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Shopping Cart
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Review items and proceed to checkout to finalize your purchase.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 flex flex-col sm:flex-row gap-5 items-start sm:items-center shadow-sm"
            >
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0"
                onError={(e) => {
                  e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300";
                }}
              />

              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-4">
                  <h2 className="text-lg font-bold text-slate-800 truncate">
                    {item.name}
                  </h2>
                  <div className="text-right font-extrabold text-slate-900 text-lg hidden sm:block">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </div>
                </div>
                
                <p className="text-sm font-semibold text-slate-500 mt-0.5">
                  ₹{item.price.toLocaleString("en-IN")} each
                </p>

                <div className="flex items-center gap-4 mt-4">
                  
                  {/* Quantity Controls */}
                  <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/50 p-1">
                    <button
                      onClick={() => decreaseQuantity(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 transition text-slate-600 font-bold"
                    >
                      -
                    </button>
                    <span className="w-10 text-center font-bold text-slate-800 text-sm">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => increaseQuantity(item.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-slate-200 transition text-slate-600 font-bold"
                    >
                      +
                    </button>
                  </div>

                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition flex items-center gap-1.5"
                    title="Remove item"
                  >
                    <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                    </svg>
                    <span className="text-xs font-semibold">Remove</span>
                  </button>

                </div>
              </div>

              {/* Line item subtotal for mobile */}
              <div className="w-full border-t border-slate-100 pt-3 flex justify-between items-center sm:hidden">
                <span className="text-xs font-semibold text-slate-400 uppercase">Subtotal</span>
                <span className="font-extrabold text-slate-900 text-lg">
                  ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                </span>
              </div>

            </div>
          ))}
        </div>

        {/* Order Summary Summary Card */}
        <div className="lg:sticky lg:top-24">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-5">
            
            <h2 className="text-xl font-bold text-slate-800">
              Order Summary
            </h2>

            <div className="space-y-3.5 text-sm">
              <div className="flex justify-between text-slate-500 font-medium">
                <span>Subtotal</span>
                <span className="text-slate-800 font-semibold">
                  ₹{getTotal().toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between text-slate-500 font-medium">
                <span>Delivery Shipping</span>
                <span className="text-emerald-600 font-bold">Free</span>
              </div>
            </div>

            <hr className="border-slate-100" />

            <div className="flex justify-between items-baseline">
              <span className="text-slate-800 font-bold">Total Amount</span>
              <span className="text-2xl font-extrabold text-slate-900">
                ₹{getTotal().toLocaleString("en-IN")}
              </span>
            </div>

            <button
              onClick={() => alert("Checkout flow is not configured in this demo!")}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3.5 px-4 rounded-xl shadow-sm hover:shadow transition duration-200 text-sm flex items-center justify-center gap-2"
            >
              Proceed to Checkout
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>

          </div>
        </div>

      </div>

    </div>
  );
}

export default Cart;