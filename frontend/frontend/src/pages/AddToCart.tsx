import { Header } from '../components/header'
import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { AdminProductItem } from '../components/AdminProductItem'
import { toast } from 'react-hot-toast'
import api from '../api/axios'
import type { Product } from '../types/product'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

interface CartItemData {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  status: string;
  stockQuantity: number;
}

export default function AddToCart() {
  const [cartItems, setCartItems] = useState<CartItemData[]>([]);
  const [products, setProducts] = useState<Record<number, Product>>({});
  const [totalAmount, setTotalAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartId, setCartId] = useState<number | null>(null);
  const { user } = useAuth();
  const { fetchCartCount } = useCart();

  const fetchCartAndProducts = async () => {
    try {
      setLoading(true);
      // Fetch cart
      const cartResponse = await api.get('/cart');
      const cartData = cartResponse.data;
      
      // Fetch all products to get images/categories
      const productsResponse = await api.get('/products');
      const productsData = productsResponse.data;
      
      // Create a map for quick lookup
      const productMap: Record<number, Product> = {};
      productsData.forEach((item: any) => {
        productMap[item.id] = {
          id: item.id,
          title: item.name,
          category: item.category,
          price: item.price,
          image: item.imageURL || '',
          stock: item.stockQuantity,
          rating: item.rating || 4.5,
          description: item.description
        };
      });

      setProducts(productMap);
      setCartItems(cartData.items || []);
      setTotalAmount(cartData.totalAmount || 0);
      setCartId(cartData.cartId);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to load cart data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartAndProducts();
  }, []);

  const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
    const item = cartItems.find(i => i.productId === productId);
    if (!item) return;

    if (item.quantity === 1 && newQuantity <= 1) {
      toast.error("Quantity cannot be zero");
      return;
    }

    try {
      await api.post('/cart/items', null, {
        params: { productId, quantity: newQuantity }
      });
      
      toast.success("Quantity updated");
      const cartResponse = await api.get('/cart');
      const cartData = cartResponse.data;
      setCartItems(cartData.items || []);
      setTotalAmount(cartData.totalAmount || 0);
      await fetchCartCount();
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    if (!cartId || !user?.email) {
      toast.error("User or Cart not identified");
      return;
    }
    try {
      await api.delete(`/cart/${cartId}/items/${cartItemId}`, {
        params: { userId: user.email }
      });
      
      toast.success("Item removed");
      const cartResponse = await api.get('/cart');
      const cartData = cartResponse.data;
      setCartItems(cartData.items || []);
      setTotalAmount(cartData.totalAmount || 0);
      setCartId(cartData.cartId);
      await fetchCartCount();
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <main className="flex items-center justify-center pt-32">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </main>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Header />
        <main className="flex flex-col items-center justify-center pt-32 px-6 text-center">
          <div className="relative mb-10">
            <div className="absolute inset-0 bg-indigo-500/20 blur-3xl rounded-full scale-150" />
            <div className="relative flex items-center justify-center w-24 h-24 rounded-[2rem] bg-indigo-50 shadow-sm border border-indigo-100">
              <svg viewBox="0 0 24 24" className="h-10 w-10 text-indigo-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-[#1e293b] mb-3">
            Your cart is empty
          </h1>
          <p className="text-[#64748b] text-lg mb-10 max-w-[280px] leading-relaxed">
            Beautiful objects await. Start with the bestsellers.
          </p>

          <Link 
            to="/shop" 
            className="group flex items-center gap-2 bg-indigo-600 text-white px-8 py-3.5 rounded-full font-semibold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100"
          >
            Browse products
            <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-2 block">
            Cart
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mb-1">Your cart</h1>
          <p className="text-sm text-slate-500 font-medium">{cartItems.length} items</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {cartItems.map((item) => {
                const product = products[item.productId] || {
                  id: item.productId,
                  title: item.productName,
                  price: item.unitPrice,
                  category: "General",
                  image: "",
                  stock: item.stockQuantity,
                  rating: 4.5,
                  description: ""
                };

                return (
                  <AdminProductItem
                    key={item.id}
                    product={product}
                    variant="cart"
                    quantity={item.quantity}
                    onUpdateQuantity={handleUpdateQuantity}
                    onDelete={() => handleRemoveItem(item.id)}
                  />
                );
              })}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-slate-900 mb-8">Order summary</h2>
              
              <div className="space-y-4 mb-8">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">${totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Estimated tax</span>
                  <span className="font-bold text-slate-900">${(totalAmount * 0.08).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Shipping</span>
                  <span className="font-bold text-emerald-600 uppercase text-xs tracking-wider">Free</span>
                </div>
              </div>

              <div className="pt-6 border-t border-slate-100 mb-8">
                <div className="flex justify-between items-end">
                  <span className="text-base font-bold text-slate-900">Total</span>
                  <span className="text-3xl font-bold text-slate-900">${(totalAmount * 1.08).toFixed(2)}</span>
                </div>
              </div>

              <Link 
                to="/checkout"
                className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group"
              >
                Proceed to checkout
                <svg viewBox="0 0 24 24" className="h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>

              
              <p className="mt-6 text-center text-[11px] text-slate-400 leading-relaxed px-4">
                Secure encrypted checkout. Free returns within 30 days.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
