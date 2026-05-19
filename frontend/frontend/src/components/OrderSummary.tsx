import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

interface CartItem {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
}

interface OrderSummaryProps {
  cartItems: CartItem[];
  loading: boolean;
  address: {
    fullName: string;
    email: string;
    phone: string;
    addressLine1: string;
    apartment: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  paymentMethod: 'card' | 'upi' | 'cod';
  paymentDetails: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardHolder: string;
    upiId: string;
  };
}

const OrderSummary = ({ 
  cartItems = [], 
  loading, 
  address, 
  paymentMethod, 
  paymentDetails
}: OrderSummaryProps) => {
  const navigate = useNavigate();

  const subtotal = Array.isArray(cartItems)
    ? cartItems.reduce(
        (total, item) => total + item.unitPrice * item.quantity,
        0
      )
    : 0;

  const handlePlaceOrder = async () => {
    // Basic validation
    const isAddressValid = !!(
      address.fullName && 
      address.email && 
      address.phone && 
      address.addressLine1 && 
      address.city && 
      address.state && 
      address.zipCode
    );

    let isPaymentValid = false;
    if (paymentMethod === 'card') {
      isPaymentValid = !!(
        paymentDetails.cardNumber && 
        paymentDetails.expiry && 
        paymentDetails.cvv && 
        paymentDetails.cardHolder
      );
    } else if (paymentMethod === 'upi') {
      isPaymentValid = !!paymentDetails.upiId;
    } else if (paymentMethod === 'cod') {
      isPaymentValid = true;
    }

    if (!isAddressValid || !isPaymentValid) {
      alert("Please fill in all required shipping and payment information.");
      return;
    }

    try {
      await api.post('/cart/checkout');

      navigate('/final');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm sticky top-24">
      
      <h2 className="text-xl font-bold text-slate-900 mb-8">
        Order summary
      </h2>

      {/* Product Preview */}
      {loading ? (
        <p>Loading...</p>
      ) : Array.isArray(cartItems) && cartItems.length > 0 ? (
        cartItems.map((item) => (
          <div key={item.id} className="flex gap-4 mb-8">

            <div className="h-16 w-16 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 overflow-hidden">
              <img
                src={item.imageUrl}
                alt="No image"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="flex-1">
              <h3 className="text-sm font-bold text-slate-900 leading-tight mb-1">
                {item.productName}
              </h3>

              <div className="flex justify-between items-center">
                <span className="text-xs text-slate-500 font-medium">
                  Qty: {item.quantity}
                </span>

                <span className="text-sm font-bold text-slate-900">
                  ₹{item.unitPrice}
                </span>
              </div>
            </div>

          </div>
        ))
      ) : (
        <p>No items</p>
      )}

      {/* Price Breakdown */}
      <div className="space-y-4 border-t border-slate-100 pt-2 mb-8">

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Subtotal</span>
          <span className="font-bold text-slate-900">
            ₹{subtotal}
          </span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-slate-500">Shipping</span>
          <span className="font-bold text-emerald-600 uppercase text-xs tracking-wider">
            Free
          </span>
        </div>

      </div>

      <div className="pt-6 border-t border-slate-100 mb-8">
        <div className="flex justify-between items-end">

          <span className="text-base font-bold text-slate-900">
            Total
          </span>

          <span className="text-3xl font-bold text-slate-900">
            ₹{subtotal}
          </span>

        </div>
      </div>

      <button 
        onClick={handlePlaceOrder}
        className="w-full bg-indigo-600 text-white py-3 rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center gap-2 group mb-4"
      >

        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>

        Place order · ₹{subtotal}

      </button>

      <p className="text-center text-[11px] text-slate-400 leading-relaxed px-4">
        By placing this order you agree to our terms.
      </p>

    </div>
  );
};


export default OrderSummary;