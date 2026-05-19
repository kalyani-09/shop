import React from 'react';
interface PaymentProps {
  paymentMethod: 'card' | 'upi' | 'cod';
  setPaymentMethod: (method: 'card' | 'upi' | 'cod') => void;
  paymentDetails: {
    cardNumber: string;
    expiry: string;
    cvv: string;
    cardHolder: string;
    upiId: string;
  };
  setPaymentDetails: (details: any) => void;
}

export default function Payment({ 
  paymentMethod, 
  setPaymentMethod, 
  paymentDetails, 
  setPaymentDetails 
}: PaymentProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentDetails((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-8">Payment method</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Credit Card */}
        <button 
          onClick={() => setPaymentMethod('card')}
          className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'card' 
            ? 'border-indigo-600 bg-indigo-50/30' 
            : 'border-slate-100 hover:border-slate-200 bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg mb-4 ${paymentMethod === 'card' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="5" width="20" height="14" rx="2" />
              <path d="M2 10h20" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-900 mb-1">Credit / Debit Card</span>
          <span className="text-xs text-slate-500">Visa, Mastercard, Amex</span>
        </button>

        {/* UPI */}
        <button 
          onClick={() => setPaymentMethod('upi')}
          className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'upi' 
            ? 'border-indigo-600 bg-indigo-50/30' 
            : 'border-slate-100 hover:border-slate-200 bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg mb-4 ${paymentMethod === 'upi' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="7" y="2" width="10" height="20" rx="2" ry="2" />
              <path d="M12 18h.01" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-900 mb-1">UPI</span>
          <span className="text-xs text-slate-500">Pay with any UPI app</span>
        </button>

        {/* COD */}
        <button 
          onClick={() => setPaymentMethod('cod')}
          className={`flex flex-col items-start p-5 rounded-2xl border-2 transition-all text-left ${
            paymentMethod === 'cod' 
            ? 'border-indigo-600 bg-indigo-50/30' 
            : 'border-slate-100 hover:border-slate-200 bg-white'
          }`}
        >
          <div className={`p-2 rounded-lg mb-4 ${paymentMethod === 'cod' ? 'text-indigo-600' : 'text-slate-400'}`}>
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </div>
          <span className="text-sm font-bold text-slate-900 mb-1">Cash on Delivery</span>
          <span className="text-xs text-slate-500">Pay when it arrives</span>
        </button>
      </div>

      {/* Card Details Form (Only shown if 'card' is selected) */}
      {paymentMethod === 'card' && (
        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
          <input 
            type="text" 
            name="cardNumber"
            value={paymentDetails.cardNumber}
            onChange={handleChange}
            placeholder="Card number" 
            className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <div className="grid grid-cols-2 gap-4">
            <input 
              type="text" 
              name="expiry"
              value={paymentDetails.expiry}
              onChange={handleChange}
              placeholder="MM / YY" 
              className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
            <input 
              type="text" 
              name="cvv"
              value={paymentDetails.cvv}
              onChange={handleChange}
              placeholder="CVV" 
              className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <input 
            type="text" 
            name="cardHolder"
            value={paymentDetails.cardHolder}
            onChange={handleChange}
            placeholder="Card holder name" 
            className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
      )}

      {paymentMethod === 'upi' && (
        <div className="px-5 py-3 rounded-2xl border border-slate-100 text-center animate-in fade-in slide-in-from-top-2 duration-300">
         <input 
            type="text" 
            name="upiId"
            value={paymentDetails.upiId}
            onChange={handleChange}
            placeholder="Enter your UPI ID" 
            className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />    
         </div>
      )}

      {paymentMethod === 'cod' && (
        <div className="px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100 text-center animate-in fade-in slide-in-from-top-2 duration-300">
          <p className="text-slate-600 text-sm">Please keep the exact amount ready for the delivery partner.</p>
        </div>
      )}
    </section>
  );
}

