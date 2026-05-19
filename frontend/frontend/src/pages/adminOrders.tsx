import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { toast } from 'react-hot-toast';
import api from '../api/axios';

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
  userId: string;
  status: string;
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
  approvedBy?: string;
  items: OrderItem[];
}

type FilterTab = 'ALL' | 'PENDING' | 'CONFIRMED' | 'REJECTED';

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('PENDING');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/cart/admin/orders');
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filteredOrders = activeTab === 'ALL'
    ? orders
    : orders.filter(o => o.status === activeTab);

  const handleAccept = async (orderNumber: string) => {
    setActionLoading(orderNumber);
    try {
      await api.put(`/cart/admin/orders/${orderNumber}/accept`);
      toast.success(`Order ${orderNumber} accepted`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to accept order');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (orderNumber: string) => {
    if (!window.confirm(`Are you sure you want to reject order ${orderNumber}?`)) return;
    setActionLoading(orderNumber);
    try {
      await api.put(`/cart/admin/orders/${orderNumber}/reject`);
      toast.success(`Order ${orderNumber} rejected`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to reject order');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED':
        return 'text-[#10b981] bg-[#ecfdf5] border-[#10b981]/20';
      case 'PENDING':
        return 'text-[#f59e0b] bg-[#fffbeb] border-[#f59e0b]/20';
      case 'REJECTED':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-slate-500 bg-slate-50 border-slate-200';
    }
  };

  const tabs: { label: string; value: FilterTab; count: number }[] = [
    { label: 'All', value: 'ALL', count: orders.length },
    { label: 'Pending', value: 'PENDING', count: orders.filter(o => o.status === 'PENDING').length },
    { label: 'Confirmed', value: 'CONFIRMED', count: orders.filter(o => o.status === 'CONFIRMED').length },
    { label: 'Rejected', value: 'REJECTED', count: orders.filter(o => o.status === 'REJECTED').length },
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header />

      <main className="mx-auto max-w-7xl sm:px-6 py-6">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-2">Admin</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Orders</h1>
          <p className="text-slate-500">Review and manage customer orders.</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Link
            to="/admin"
            className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          >
            Orders
          </Link>
        </div>

        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`px-5 py-2.5 rounded-2xl text-sm font-bold transition-all ${
                activeTab === tab.value
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {tab.label}
              <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${
                activeTab === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-100 text-slate-500'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-indigo-600" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
            <p className="text-slate-500 font-medium">No orders found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div
                key={order.id}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.04)]"
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-extrabold text-[#0f172a]">{order.orderNumber}</span>
                      <span className={`rounded-full border px-3 py-1 text-[10px] font-bold tracking-wide uppercase ${getStatusStyles(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-500">
                      <span><span className="font-medium text-slate-700">User:</span> {order.userId}</span>
                      <span><span className="font-medium text-slate-700">Items:</span> {order.items?.length || 0}</span>
                      <span><span className="font-medium text-slate-700">Date:</span> {new Date(order.createdAt).toLocaleDateString()}</span>
                      {order.approvedBy && (
                        <span><span className="font-medium text-slate-700">Approved by:</span> {order.approvedBy}</span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {order.items?.map((item, i) => (
                        <span key={i} className="text-xs bg-slate-50 px-2.5 py-1 rounded-full text-slate-600 border border-slate-100">
                          {item.productName} x{item.quantity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 lg:flex-shrink-0">
                    <span className="text-2xl font-extrabold text-[#0f172a]">&#8377;{order.totalAmount}</span>
                    {order.status === 'PENDING' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleAccept(order.orderNumber)}
                          disabled={actionLoading === order.orderNumber}
                          className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-[#10b981] hover:bg-[#059669] transition-all disabled:opacity-50"
                        >
                          {actionLoading === order.orderNumber ? 'Processing...' : 'Accept'}
                        </button>
                        <button
                          onClick={() => handleReject(order.orderNumber)}
                          disabled={actionLoading === order.orderNumber}
                          className="px-5 py-2.5 rounded-2xl text-sm font-bold text-white bg-red-500 hover:bg-red-600 transition-all disabled:opacity-50"
                        >
                          {actionLoading === order.orderNumber ? 'Processing...' : 'Reject'}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
