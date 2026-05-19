import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { Link, useParams } from "react-router-dom"
import { useState, useEffect } from 'react'
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
  items: OrderItem[];
}

export default function ViewOrderDetail() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/cart/orders/${orderNumber}`);
        setOrder(response.data.order);
      } catch (error) {
        console.error("Error fetching order details:", error);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  const getStatusStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
      case 'delivered':
      case 'confirmed':
        return 'text-[#10b981] bg-[#ecfdf5] border-[#10b981]/20';
      case 'pending':
      case 'in transit':
        return 'text-[#f59e0b] bg-[#fffbeb] border-[#f59e0b]/20';
      case 'cancelled':
      case 'rejected':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fcfcfd]">
        <Header />
        <div className="flex h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-[#fcfcfd]">
        <Header />
        <div className="mx-auto max-w-7xl px-8 py-20 text-center">
          <h2 className="text-2xl font-bold text-slate-900">Order not found</h2>
          <p className="mt-2 text-slate-500">We couldn't find the order you're looking for.</p>
          <Link to="/profile" className="mt-6 inline-block font-bold text-indigo-600 hover:underline">
            Back to My Orders
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header />

      <main className="mx-auto w-full max-w-4xl px-8 pb-24 pt-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <Link to="/profile" className="group flex items-center gap-2 text-[13px] font-bold text-slate-400 transition-colors hover:text-indigo-600">
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              BACK TO ORDERS
            </Link>
            <h1 className="mt-4 text-[32px] font-extrabold tracking-tight text-[#0f172a]">
              Order <span className="text-indigo-600">#{order.orderNumber}</span>
            </h1>
            <p className="mt-2 text-[15px] font-medium text-slate-500">
              Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className={`rounded-full border px-4 py-1.5 text-[12px] font-bold tracking-wide uppercase ${getStatusStyles(order.status)}`}>
            {order.status}
          </div>
        </div>

        <div className="grid gap-8">
          {/* Order Items */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)]">
            <div className="border-b border-slate-50 bg-slate-50/50 px-8 py-5">
              <h3 className="text-[15px] font-bold text-slate-900 uppercase tracking-wider">Order Items</h3>
            </div>
            <div className="divide-y divide-slate-50 px-8">
              {order.items?.map((item, index) => (
                <div key={index} className="flex items-center justify-between py-6">
                  <div className="flex items-center gap-6">
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-slate-50">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="text-indigo-600">
                          <i className="fa-solid fa-box text-xl"></i>
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-[16px] font-bold text-slate-900">{item.productName}</h4>
                      <p className="mt-1 text-[13px] font-medium text-slate-400">
                        Quantity: <span className="text-slate-600">{item.quantity}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[16px] font-bold text-slate-900">₹{item.unitPrice * item.quantity}</p>
                    <p className="mt-1 text-[12px] font-medium text-slate-400">₹{item.unitPrice} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="overflow-hidden rounded-[32px] border border-slate-100 bg-white shadow-[0_4px_25px_-4px_rgba(0,0,0,0.03)]">
            <div className="p-8">
              <h3 className="mb-6 text-[15px] font-bold text-slate-900 uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-4">
                <div className="flex justify-between text-[15px]">
                  <span className="font-medium text-slate-500">Subtotal</span>
                  <span className="font-bold text-slate-900">₹{order.totalAmount}</span>
                </div>
                <div className="flex justify-between text-[15px]">
                  <span className="font-medium text-slate-500">Shipping</span>
                  <span className="font-bold text-[#10b981]">FREE</span>
                </div>
                <div className="flex justify-between text-[15px]">
                  <span className="font-medium text-slate-500">Tax</span>
                  <span className="font-bold text-slate-900">₹0.00</span>
                </div>
                <div className="mt-6 flex justify-between border-t border-slate-100 pt-6">
                  <span className="text-[18px] font-bold text-slate-900">Total Amount</span>
                  <span className="text-[24px] font-extrabold text-indigo-600">₹{order.totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button 
              onClick={() => window.print()}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-4 text-[14px] font-bold text-slate-600 transition-all hover:bg-slate-50"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              Print Invoice
            </button>
            <Link 
              to="/shop"
              className="flex flex-1 items-center justify-center rounded-2xl bg-indigo-600 py-4 text-[14px] font-bold text-white transition-all hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-200"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
