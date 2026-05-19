import { Header } from '../components/header'
import { Footer } from '../components/footer'
import {Link} from "react-router-dom"
import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import api from '../api/axios'

interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}


interface Order {
  id: number;
  orderNumber: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  totalAmount: number;
  imageUrl?: string;
  items: OrderItem[];

}

export default function UserDetails() {
  const { user, logout } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user?.email) return;
      
      try {
        const response = await api.get('/cart/orders');
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [user?.email]);

  const handleDeleteOrder = async (orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to delete order ${orderNumber}?`)) return;

    try {
      await api.delete(`/cart/orders/${orderNumber}`);
      setOrders((prev) => prev.filter((order) => order.orderNumber !== orderNumber));
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("Failed to delete order. Please try again.");
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'confirmed':
        return 'text-[#10b981] bg-[#ecfdf5]';
      case 'pending':
      case 'in transit':
        return 'text-[#f59e0b] bg-[#fffbeb]';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-slate-500 bg-slate-50';
    }
  };

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header />

      <main className="mx-auto w-full max-w-7xl px-8 pb-24 pt-8">
        {/* Header section */}
        <div className="mb-8">
          <span className="text-[11px] font-bold tracking-[0.25em] text-[#6366f1] uppercase">Account</span>
          <h1 className="mt-4 text-[44px] font-extrabold tracking-tight text-[#0f172a]">Hello, {user?.name || 'Guest'}</h1>
          <p className="mt-2 text-[15px] font-medium text-slate-500">Manage your orders, profile and saved addresses.</p>
        </div>

        <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
          {/* Sidebar */}
          <aside>
            <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white p-2.5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)]">
              <nav className="space-y-1">
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-2xl bg-[#eff6ff] px-4 py-3.5 text-[14px] font-semibold text-[#4f46e5] transition-all"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                    <path d="m3.3 7 8.7 5 8.7-5" />
                    <path d="M12 22V12" />
                  </svg>
                  Orders
                </a>
               <Link to="/profile" className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50 transition-all hover:text-slate-900">
               <i className="fa-solid fa-user"></i>
                 Profile
               </Link>
                <a
                  href="#"
                  className="flex items-center gap-3 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-slate-500 hover:bg-slate-50 transition-all hover:text-slate-900"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  Addresses
                </a>
                <button
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-[14px] font-medium text-red-500 hover:bg-red-50 transition-all"
                >
                  <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              </nav>
            </div>
          </aside>

          {/* Main Content */}
          <section className="space-y-5">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            ) : orders.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
                <p className="text-slate-500 font-medium">You haven't placed any orders yet.</p>
                <Link to="/shop" className="text-indigo-600 font-bold mt-4 inline-block hover:underline">Start Shopping</Link>
              </div>
            ) : (
              orders.map((order) => (
                <div
                  key={order.id}
                  className="group flex flex-col sm:flex-row sm:items-center justify-between rounded-3xl border border-slate-100 bg-white p-7 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)] transition-all hover:shadow-[0_8_30px_-4px_rgba(0,0,0,0.08)]"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3.5">
                      <span className="text-[17px] font-extrabold text-[#0f172a]">{order.orderNumber}</span>
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-[13px] font-medium text-slate-400">
                      {new Date(order.createdAt).toLocaleDateString()} <span className="mx-1.5 text-slate-300">·</span> {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-6 sm:mt-0">
                    <span className="text-[19px] font-extrabold text-[#0f172a]">₹{order.totalAmount}</span>
                    <div className="flex items-center gap-4">
                      <Link
                        to={`/order-detail/${order.orderNumber}`}
                        className="text-[14px] font-bold text-[#4f46e5] hover:text-[#4338ca] transition-colors"
                      >
                        View details
                      </Link>
                      <button 
                        className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                        title="Delete Order"
                        onClick={() => handleDeleteOrder(order.orderNumber)}
                      >
                        <i className="fa-solid fa-trash-can text-[15px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}

