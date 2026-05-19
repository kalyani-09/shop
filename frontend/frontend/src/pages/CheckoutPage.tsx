import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/header';
import ShippingAddress from '../components/ShippingAddress';
import Payment from '../components/Payment';
import OrderSummary from '../components/OrderSummary';
import api from '../api/axios';


interface CartItem{
  id:number;
  productId:number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

export default function CheckoutPage() {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [address, setAddress] = useState({
    fullName: '',
    email: '',
    phone: '',
    addressLine1: '',
    apartment: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA'
  });
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardHolder: '',
    upiId: ''
  });

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cart')
      .then((response) => {
        const data = response.data;
        if (Array.isArray(data)) {
          setCartItems(data);
        } else if (Array.isArray(data.items)) {
          const formattedItems = data.items.map((item: CartItem) => ({
            id: item.id,
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            imageUrl: item.imageUrl
          }));
          setCartItems(formattedItems);
        } else {
          setCartItems([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching cart :", error);
        setCartItems([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-[#f8fafc] font-sans">
      <Header />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-12">
          <Link 
            to="/cart" 
            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-6 text-sm font-medium"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Back to cart
          </Link>
          <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-2 block">
            Checkout
          </span>
          <h1 className="text-4xl font-bold text-slate-900">Almost there</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-8">
            <ShippingAddress address={address} setAddress={setAddress} />

            <Payment 
              paymentMethod={paymentMethod} 
              setPaymentMethod={setPaymentMethod} 
              paymentDetails={paymentDetails}
              setPaymentDetails={setPaymentDetails}
            />
          </div>

          <div className="lg:col-span-4">
            <OrderSummary 
              cartItems={cartItems} 
              loading={loading} 
              address={address}
              paymentMethod={paymentMethod}
              paymentDetails={paymentDetails}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

