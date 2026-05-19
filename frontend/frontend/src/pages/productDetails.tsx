import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { Product } from '../types/product'
import { toast } from 'react-hot-toast'
import api from '../api/axios'


import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [quantity, setQuantity] = useState(1)
  const navigate = useNavigate();
  const { fetchCartCount } = useCart();
  useEffect(() => {
    const fetchProduct = async () => {
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
          rating: item.rating || 4.5,
          image: item.imageURL || '',
          description: item.description,
        }
        setProduct(formatted)
        setError(null)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

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
                  <span key={i} className={`text-lg ${i < Math.floor(product.rating) ? 'text-yellow-400' : 'text-slate-200'}`}>★</span>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-900">{product.rating}</span>
              <span className="text-slate-200">|</span>
              <span className="text-sm text-slate-500 font-medium">1284 reviews</span>
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
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-11 h-11 flex items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
                  </svg>
                </button>
                <span className="w-12 text-center font-bold text-slate-900 text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
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
        </div>
      </main>

      <Footer />
    </div>
  )
}

