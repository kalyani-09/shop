import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types/product'
import type { Review } from '../types/review'
import { toast } from 'react-hot-toast'
import api from '../api/axios'


import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(() => {
    if (id) {
      const saved = localStorage.getItem(`product_qty_${id}`);
      if (saved) {
        const parsed = parseInt(saved, 10);
        if (!isNaN(parsed) && parsed > 0) {
          return parsed;
        }
      }
    }
    return 1;
  });
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  const { isAuthenticated, user } = useAuth();

  // Reviews & Rating states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsPage, setReviewsPage] = useState(0);
  const [totalReviewsPages, setTotalReviewsPages] = useState(0);
  const [reviewsCount, setReviewsCount] = useState(0);
  const [averageRating, setAverageRating] = useState(4.5);

  // Review form states
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [userNameInput, setUserNameInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const updateQuantity = (val: number) => {
    setQuantity(val);
    if (id) {
      localStorage.setItem(`product_qty_${id}`, val.toString());
    }
  };

  useEffect(() => {
    const fetchProductAndCart = async () => {
      try {
        setLoading(true)
        const response = await api.get(`/products/${id}`)
        const item = response.data
        const formatted: Product = {
          id: item.id,
          title: item.name,
          category: item.category,
          price: item.price,
          oldPrice: item.price * 1.2, // Consistent with ProductCard dummy logic
          stock: item.stockQuantity,
          rating: item.averageRating !== undefined && item.averageRating !== null ? item.averageRating : 4.5,
          image: item.imageURL || '',
          description: item.description,
          reviewCount: item.reviewCount || 0,
        }
        setProduct(formatted)
        setAverageRating(formatted.rating)
        setReviewsCount(formatted.reviewCount || 0)
        setError(null)

        const savedQty = localStorage.getItem(`product_qty_${id}`);
        if (savedQty) {
          const parsed = parseInt(savedQty, 10);
          if (!isNaN(parsed) && parsed > 0) {
            setQuantity(Math.min(formatted.stock, parsed));
          } else {
            setQuantity(1);
          }
        } else if (isAuthenticated) {
          try {
            const cartResponse = await api.get('/cart')
            const cartData = cartResponse.data
            if (cartData && cartData.items) {
              const cartItem = cartData.items.find((item: any) => item.productId === formatted.id)
              if (cartItem) {
                setQuantity(cartItem.quantity)
              } else {
                setQuantity(1)
              }
            }
          } catch (cartErr) {
            console.error("Error fetching cart for product quantity:", cartErr)
          }
        } else {
          setQuantity(1)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProductAndCart()
    }
  }, [id, isAuthenticated])

  const fetchReviews = async (page = 0) => {
    if (!id) return;
    try {
      const response = await api.get(`/products/${id}/reviews`, {
        params: { page, size: 5 }
      });
      setReviews(response.data.content || []);
      setTotalReviewsPages(response.data.totalPages || 0);
      setReviewsCount(response.data.totalElements || 0);
    } catch (err) {
      console.error("Error fetching reviews:", err);
    }
  };

  const fetchRating = async () => {
    if (!id) return;
    try {
      const response = await api.get(`/products/${id}/rating`);
      setAverageRating(response.data.averageRating || 0);
      setReviewsCount(response.data.reviewCount || 0);
    } catch (err) {
      console.error("Error fetching rating:", err);
    }
  };

  // Fetch reviews and ratings on load or ID change
  useEffect(() => {
    if (id) {
      fetchReviews(0);
      fetchRating();
      setReviewsPage(0);
    }
  }, [id]);

  // Pre-fill user name for review form
  useEffect(() => {
    if (user?.name) {
      setUserNameInput(user.name);
    }
  }, [user]);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    if (!ratingInput || !userNameInput.trim()) {
      toast.error("Please provide a rating and your name");
      return;
    }

    try {
      setSubmittingReview(true);
      const payload = {
        rating: ratingInput,
        comment: commentInput,
        userName: userNameInput
      };

      if (editingReviewId) {
        await api.put(`/products/${id}/reviews/${editingReviewId}`, payload);
        toast.success("Review updated successfully");
      } else {
        await api.post(`/products/${id}/reviews`, payload);
        toast.success("Review submitted successfully");
      }

      // Reset form
      setShowReviewForm(false);
      setEditingReviewId(null);
      setCommentInput("");
      setRatingInput(5);
      
      // Refresh reviews and rating
      fetchReviews(reviewsPage);
      fetchRating();
    } catch (err: any) {
      console.error("Error submitting review:", err);
      const errMsg = err.response?.data?.error || "Failed to submit review. Make sure you have purchased this product.";
      toast.error(errMsg);
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleDeleteReview = async (reviewId: number) => {
    if (!id) return;
    if (!window.confirm("Are you sure you want to delete this review?")) {
      return;
    }

    try {
      await api.delete(`/products/${id}/reviews/${reviewId}`);
      toast.success("Review deleted successfully");
      const isLastItemOnPage = reviews.length === 1;
      const newPage = isLastItemOnPage && reviewsPage > 0 ? reviewsPage - 1 : reviewsPage;
      setReviewsPage(newPage);
      fetchReviews(newPage);
      fetchRating();
    } catch (err: any) {
      console.error("Error deleting review:", err);
      toast.error(err.response?.data?.error || "Failed to delete review");
    }
  };

  const handleEditReview = (review: Review) => {
    setEditingReviewId(review.id);
    setRatingInput(review.rating);
    setCommentInput(review.comment);
    setUserNameInput(review.userName);
    setShowReviewForm(true);
  };

  const handleAddToCart = async () => {
    try {
      await api.post('/cart/items', null, {
        params: {
          productId: product?.id,
          productName: product?.title,
          quantity: quantity,
          unitPrice: product?.price
        }
      });
      await fetchCartCount();
      if (id) {
        localStorage.removeItem(`product_qty_${id}`);
      }
      toast.success("Product added to cart");
    } catch (error) {
      console.error("Error adding a product to cart:", error)
      toast.error("Sign in to add products to cart");
    }
  }

  const handleBuyNow = async () => {
    try {
      await api.post('/cart/items', null, {
        params: {
          productId: product?.id,
          productName: product?.title,
          quantity: quantity,
          unitPrice: product?.price
        }
      });
      await fetchCartCount();
      if (id) {
        localStorage.removeItem(`product_qty_${id}`);
      }
      navigate("/cart");
    } catch (error) {
      console.error("Error adding a product to cart:", error)
      toast.error("Sign in to buy products");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-4">{error || 'Product not found'}</h2>
          <Link to="/shop" className="text-indigo-600 hover:text-indigo-700 font-medium">
            Back to shop
          </Link>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link to="/shop" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 mb-8 transition-colors">
          <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to shop
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column: Product Image */}
          <div className="relative aspect-square rounded-3xl bg-slate-100 overflow-hidden group">
            {/* Heart/Wishlist Icon */}
            <button className="absolute top-6 right-6 z-10 w-12 h-12 flex items-center justify-center rounded-full bg-white shadow-sm hover:scale-110 transition-transform">
              <svg className="w-6 h-6 text-slate-400 hover:text-red-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </button>

            {/* Product Image */}
            <div className="w-full h-full flex flex-col items-center justify-center text-white text-center p-8">
              <div className="w-full h-full rounded-3xl flex items-center justify-center mb-4">
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x600?text=Product+Image'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col">
            <span className="text-xs font-bold tracking-[0.2em] text-indigo-600 uppercase mb-3">
              {product.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 leading-[1.1]">
              {product.title}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-8">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className={`text-lg ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{averageRating.toFixed(1)}</span>
              <span className="text-slate-200">|</span>
              <span className="text-sm text-slate-500 font-medium">{reviewsCount} {reviewsCount === 1 ? 'review' : 'reviews'}</span>
            </div>

            {/* Price */}
            <div className="flex items-center gap-4 mb-8">
              <span className="text-4xl font-bold text-slate-900">${product.price.toFixed(2)}</span>
              {product.oldPrice && (
                <>
                  <span className="text-xl text-slate-400 line-through">${product.oldPrice.toFixed(2)}</span>
                  <span className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                    Save ${(product.oldPrice - product.price).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            <p className="text-slate-600 text-lg leading-relaxed mb-10 max-w-xl">
              {product.description}
            </p>

            {/* Quantity & Stock */}
            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-1 shadow-sm">
                <button
                  onClick={() => updateQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-bold text-slate-900 text-lg">{quantity}</span>
                <button
                  onClick={() => updateQuantity(Math.min(product.stock, quantity + 1))}
                  className="w-11 h-11 flex items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              </div>
              <span className="text-sm text-slate-400">
                <span className="font-bold text-slate-600">{product.stock}</span> in stock
              </span>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              <button className="flex-[1.2] px-8 py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-900 hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2" onClick={handleAddToCart}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                Add to cart
              </button>
              <button className="flex-[1.5] px-8 py-4 rounded-2xl bg-indigo-600 font-bold text-white hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2" onClick={handleBuyNow}>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Buy now
              </button>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-12">
              {[
                { icon: '🚚', label: 'Free shipping', color: 'bg-blue-50 text-blue-600' },
                { icon: '🔄', label: '30-day returns', color: 'bg-indigo-50 text-indigo-600' },
                { icon: '🛡️', label: '2-year warranty', color: 'bg-purple-50 text-purple-600' }
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className={`w-10 h-10 rounded-xl ${feature.color.split(' ')[0]} flex items-center justify-center text-lg`}>
                    {feature.icon}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{feature.label}</span>
                </div>
              ))}
            </div>


          </div>

          {/* Reviews Section */}
          <div className="mt-16 border-t border-slate-100 pt-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              
              {/* Reviews Summary Card */}
              <div className="lg:col-span-1 bg-slate-50 rounded-3xl p-8 h-fit">
                <h3 className="text-2xl font-bold text-slate-900 mb-6">Customer Reviews</h3>
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="text-5xl font-extrabold text-slate-900">{averageRating.toFixed(1)}</span>
                  <span className="text-lg text-slate-400">out of 5</span>
                </div>
                
                {/* Stars summary */}
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <span key={i} className={`text-xl ${i < Math.floor(averageRating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">({reviewsCount} reviews)</span>
                </div>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                  Only verified purchasers can leave reviews for this product.
                </p>

                {isAuthenticated ? (
                  <button 
                    onClick={() => {
                      setEditingReviewId(null);
                      setRatingInput(5);
                      setCommentInput("");
                      if (user?.name) {
                        setUserNameInput(user.name);
                      }
                      setShowReviewForm(!showReviewForm);
                    }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-center transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                    Write a Review
                  </button>
                ) : (
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-center">
                    <p className="text-sm font-semibold text-amber-800 mb-2">Want to write a review?</p>
                    <Link to="/login" className="text-xs font-bold text-indigo-600 hover:underline">
                      Sign in to get started
                    </Link>
                  </div>
                )}
              </div>

              {/* Reviews List & Write Review Form */}
              <div className="lg:col-span-2 space-y-8">
                
                {/* Write/Edit Review Form */}
                {showReviewForm && (
                  <form onSubmit={handleSubmitReview} className="bg-white border-2 border-slate-100 rounded-3xl p-8 shadow-sm space-y-6">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xl font-bold text-slate-900">
                        {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                      </h4>
                      <button 
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false);
                          setEditingReviewId(null);
                        }}
                        className="text-slate-400 hover:text-slate-600"
                      >
                        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    {/* Rating Selector */}
                    <div className="space-y-2">
                      <label className="block text-sm font-bold text-slate-700">Rating</label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingInput(star)}
                            className="text-3xl transition-transform hover:scale-110 focus:outline-none"
                          >
                            <span className={star <= ratingInput ? 'text-yellow-400' : 'text-slate-200'}>★</span>
                          </button>
                        ))}
                        <span className="text-sm font-medium text-slate-500 ml-2">
                          {ratingInput === 1 && 'Poor'}
                          {ratingInput === 2 && 'Fair'}
                          {ratingInput === 3 && 'Good'}
                          {ratingInput === 4 && 'Very Good'}
                          {ratingInput === 5 && 'Excellent'}
                        </span>
                      </div>
                    </div>

                    {/* Display Name Input */}
                    <div className="space-y-2">
                      <label htmlFor="userName" className="block text-sm font-bold text-slate-700">Display Name</label>
                      <input
                        type="text"
                        id="userName"
                        required
                        value={userNameInput}
                        onChange={(e) => setUserNameInput(e.target.value)}
                        placeholder="e.g. John Doe"
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800"
                      />
                    </div>

                    {/* Comment Input */}
                    <div className="space-y-2">
                      <label htmlFor="comment" className="block text-sm font-bold text-slate-700">Review Comments</label>
                      <textarea
                        id="comment"
                        required
                        rows={4}
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Share details of your experience with this product..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-medium text-slate-800"
                      />
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={submittingReview}
                        className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-300 text-white font-bold transition-all shadow-sm flex items-center justify-center gap-2"
                      >
                        {submittingReview ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : editingReviewId ? (
                          'Update Review'
                        ) : (
                          'Submit Review'
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowReviewForm(false);
                          setEditingReviewId(null);
                        }}
                        className="py-3 px-6 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold transition-all"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Reviews List */}
                <div className="space-y-6">
                  {reviews.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                      <span className="text-4xl">💬</span>
                      <h5 className="text-lg font-bold text-slate-900 mt-4 mb-2">No reviews yet</h5>
                      <p className="text-sm text-slate-500 max-w-sm mx-auto">
                        Have you purchased this product? Be the first to write a review and help others make a decision!
                      </p>
                    </div>
                  ) : (
                    reviews.map((review) => {
                      const isOwnReview = review.userEmail === user?.email;
                      const isAdmin = user?.role === 'ADMIN';
                      const initial = review.userName ? review.userName.charAt(0).toUpperCase() : '?';
                      
                      // Simple background color helper based on name initials
                      const colors = [
                        'bg-indigo-100 text-indigo-700',
                        'bg-emerald-100 text-emerald-700',
                        'bg-sky-100 text-sky-700',
                        'bg-pink-100 text-pink-700',
                        'bg-amber-100 text-amber-700'
                      ];
                      const colorIndex = (review.userName || '').charCodeAt(0) % colors.length || 0;
                      const avatarColorClass = colors[colorIndex];

                      return (
                        <div key={review.id} className="border-b border-slate-100 pb-6 last:border-b-0 last:pb-0">
                          <div className="flex items-start justify-between gap-4">
                            
                            {/* Left: Avatar & Info */}
                            <div className="flex gap-4">
                              <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shrink-0 ${avatarColorClass}`}>
                                {initial}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h5 className="font-bold text-slate-900">{review.userName}</h5>
                                  {isOwnReview && (
                                    <span className="bg-indigo-50 text-indigo-600 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                                      You
                                    </span>
                                  )}
                                </div>
                                
                                {/* Rating & Date */}
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex text-yellow-400">
                                    {[...Array(5)].map((_, i) => (
                                      <span key={i} className={`text-sm ${i < review.rating ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                                    ))}
                                  </div>
                                  <span className="text-xs text-slate-400">|</span>
                                  <span className="text-xs text-slate-400">
                                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                  </span>
                                </div>

                                {/* Comment */}
                                <p className="mt-3 text-slate-600 leading-relaxed text-sm whitespace-pre-wrap">
                                  {review.comment}
                                </p>
                              </div>
                            </div>

                            {/* Right: Actions */}
                            {(isOwnReview || isAdmin) && (
                              <div className="flex items-center gap-1">
                                {isOwnReview && (
                                  <button
                                    onClick={() => handleEditReview(review)}
                                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                                    title="Edit review"
                                  >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDeleteReview(review.id)}
                                  className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                                  title="Delete review"
                                >
                                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            )}

                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Pagination */}
                {totalReviewsPages > 1 && (
                  <div className="flex items-center justify-between border-t border-slate-100 pt-6">
                    <button
                      onClick={() => {
                        const newPage = Math.max(0, reviewsPage - 1);
                        setReviewsPage(newPage);
                        fetchReviews(newPage);
                      }}
                      disabled={reviewsPage === 0}
                      className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Previous
                    </button>
                    <span className="text-sm font-semibold text-slate-500">
                      Page {reviewsPage + 1} of {totalReviewsPages}
                    </span>
                    <button
                      onClick={() => {
                        const newPage = Math.min(totalReviewsPages - 1, reviewsPage + 1);
                        setReviewsPage(newPage);
                        fetchReviews(newPage);
                      }}
                      disabled={reviewsPage === totalReviewsPages - 1}
                      className="px-4 py-2 border border-slate-200 rounded-xl font-bold text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      Next
                    </button>
                  </div>
                )}

              </div>
            </div>
          </div>


        </div>
      </main>

      <Footer />
    </div>
  )
}

