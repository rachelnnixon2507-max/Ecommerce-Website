import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/api";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

/* ── Star Rating helper ── */
function StarRating({ value, onChange, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`text-2xl transition-transform duration-100 ${
            readonly ? "cursor-default" : "cursor-pointer hover:scale-110"
          } ${(hovered || value) >= star ? "text-amber-400" : "text-slate-200"}`}
        >
          ★
        </button>
      ))}
    </div>
  );
}

/* ── Individual review card ── */
function ReviewCard({ review }) {
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-2 hover:shadow-sm transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-rose-400 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            {review.author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-slate-800 text-sm">{review.author}</p>
            <p className="text-xs text-slate-400">{review.date}</p>
          </div>
        </div>
        <StarRating value={review.rating} readonly />
      </div>
      <p className="text-slate-600 text-sm leading-relaxed pt-1">{review.comment}</p>
    </div>
  );
}

function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  /* ── Reviews state (local / demo) ── */
  const storageKey = `reviews_product_${id}`;
  const [reviews, setReviews] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(storageKey)) || [];
    } catch {
      return [];
    }
  });
  const [newRating, setNewRating] = useState(0);
  const [newComment, setNewComment] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await api.get(`/api/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const averageRating =
    reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : null;

  const handleSubmitReview = (e) => {
    e.preventDefault();
    setReviewError("");
    if (newRating === 0) {
      setReviewError("Please select a star rating.");
      return;
    }
    if (newComment.trim().length < 10) {
      setReviewError("Review must be at least 10 characters.");
      return;
    }
    const review = {
      id: Date.now(),
      author: user?.name || "Anonymous",
      rating: newRating,
      comment: newComment.trim(),
      date: new Date().toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    };
    const updated = [review, ...reviews];
    setReviews(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
    setNewRating(0);
    setNewComment("");
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  /* ─── Loading / Not Found ─── */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <div className="inline-block w-8 h-8 border-4 border-slate-200 border-t-purple-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-sm font-semibold text-slate-500">Loading product details...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center animate-fade-in">
        <h1 className="text-2xl font-bold text-rose-600">Product Not Found</h1>
        <p className="text-slate-500 mt-2 mb-6">
          The requested product could not be located.
        </p>
        <Link
          to="/products"
          className="inline-flex bg-gradient-to-r from-purple-600 to-rose-500 text-white font-semibold py-2.5 px-5 rounded-xl transition"
        >
          Back to Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 animate-fade-in">

      {/* Back Button */}
      <div className="mb-6">
        <Link
          to="/products"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-purple-700 uppercase tracking-wider transition"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
          Back to Catalogue
        </Link>
      </div>

      {/* Product Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 p-6 sm:p-10">

          {/* IMAGE */}
          <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-slate-50 to-purple-50/30 border border-slate-100 flex items-center justify-center min-h-[280px]">
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full max-h-[500px] object-contain hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                e.target.src = "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800";
              }}
            />
          </div>

          {/* DETAILS */}
          <div className="flex flex-col justify-between py-2">
            <div>
              {product.category?.name && (
                <span className="inline-block bg-purple-50 text-purple-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border border-purple-100">
                  {product.category.name}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mt-4 tracking-tight leading-tight">
                {product.name}
              </h1>

              {/* Rating preview */}
              {averageRating && (
                <div className="flex items-center gap-2 mt-3">
                  <StarRating value={Math.round(parseFloat(averageRating))} readonly />
                  <span className="text-sm font-bold text-amber-500">{averageRating}</span>
                  <span className="text-xs text-slate-400">({reviews.length} {reviews.length === 1 ? "review" : "reviews"})</span>
                </div>
              )}

              <p className="text-slate-500 mt-4 text-base leading-relaxed">
                {product.description}
              </p>

              {/* Price */}
              <div className="flex items-center gap-4 mt-6 mb-8">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                  ₹{product.price.toLocaleString("en-IN")}
                </h2>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200/50">
                  20% OFF
                </span>
              </div>

              {/* Specs */}
              <div className="border-t border-b border-slate-100 py-5 my-2 space-y-3.5 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 w-28">Availability:</span>
                  {product.stock > 0 ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600/10">
                      {product.stock} items available
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 ring-1 ring-rose-600/10">
                      Out of stock
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-500 w-28">Product ID:</span>
                  <span className="text-slate-600 font-medium font-mono">#{product.id}</span>
                </div>
                {product.createdDate && (
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500 w-28">Release Date:</span>
                    <span className="text-slate-600 font-medium">
                      {new Date(product.createdDate).toLocaleDateString("en-IN", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 mt-6">
              <button
                onClick={() => {
                  if (!isAuthenticated()) {
                    alert("Please login to add products to your cart.");
                    return;
                  }
                  addToCart(product);
                }}
                disabled={product.stock <= 0}
                className="flex-1 bg-slate-900 disabled:bg-slate-200 disabled:cursor-not-allowed hover:bg-slate-800 text-white font-semibold py-3.5 px-6 rounded-xl shadow-sm hover:shadow transition duration-200 text-sm flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
                </svg>
                Add to Cart
              </button>
              <button
                disabled={product.stock <= 0}
                onClick={() => { 
                  if (!isAuthenticated()) {
                    alert("Please login to add products to your cart.");
                    return;
                  }
                  addToCart(product); 
                  alert("Added to cart! Checkout coming soon."); 
                }}
                className="flex-1 bg-gradient-to-r from-purple-600 to-rose-500 disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-700 hover:to-rose-600 text-white font-semibold py-3.5 px-6 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2"
              >
                Buy Now
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────
          REVIEWS & RATINGS SECTION
      ──────────────────────────────────────── */}
      <div className="mt-12">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Customer Reviews
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {reviews.length === 0
                ? "Be the first to share your experience!"
                : `${reviews.length} verified ${reviews.length === 1 ? "review" : "reviews"} for this product`}
            </p>
          </div>
          {averageRating && (
            <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-4 py-2.5">
              <span className="text-3xl font-extrabold text-amber-500">{averageRating}</span>
              <div>
                <StarRating value={Math.round(parseFloat(averageRating))} readonly />
                <p className="text-xs text-slate-400 mt-0.5">{reviews.length} reviews</p>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Write a Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-rose-400 text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
                  </svg>
                </div>
                <h3 className="text-lg font-bold text-slate-800">Write a Review</h3>
              </div>

              {!isAuthenticated() ? (
                <div className="text-center py-4">
                  <p className="text-slate-500 text-sm mb-4">Please sign in to leave a review.</p>
                  <Link
                    to="/login"
                    className="inline-flex bg-gradient-to-r from-purple-600 to-rose-500 text-white font-semibold text-sm py-2.5 px-5 rounded-xl"
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitReview} className="space-y-4">
                  {reviewSuccess && (
                    <div className="px-4 py-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Review submitted! Thank you.
                    </div>
                  )}

                  {reviewError && (
                    <div className="px-3 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                      {reviewError}
                    </div>
                  )}

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-2">
                      Your Rating
                    </label>
                    <StarRating value={newRating} onChange={setNewRating} />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
                      Your Review
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Share your experience with this product..."
                      rows="4"
                      className="w-full border border-slate-200 bg-slate-50/60 hover:bg-white focus:bg-white p-3 rounded-xl text-sm outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-400 transition duration-200 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-rose-500 hover:from-purple-700 hover:to-rose-600 text-white font-bold py-3 px-4 rounded-xl shadow-md shadow-purple-200 hover:shadow-lg transition duration-200 text-sm flex items-center justify-center gap-2"
                  >
                    Submit Review
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Review List */}
          <div className="lg:col-span-2 space-y-4">
            {reviews.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-200 rounded-2xl p-12 text-center">
                <div className="text-4xl mb-3">⭐</div>
                <p className="font-semibold text-slate-600">No reviews yet</p>
                <p className="text-slate-400 text-sm mt-1">
                  Be the first to review this product!
                </p>
              </div>
            ) : (
              reviews.map((review) => (
                <ReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}

export default ProductDetails;