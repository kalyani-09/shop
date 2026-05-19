import React from 'react';
interface ShippingAddressProps {
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
  setAddress: (address: any) => void;
}

export default function ShippingAddress({ address, setAddress }: ShippingAddressProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setAddress((prev: any) => ({ ...prev, [name]: value }));
  };

  return (
    <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-8">Shipping address</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input 
          type="text" 
          name="fullName"
          value={address.fullName}
          onChange={handleChange}
          placeholder="Full name *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <input 
          type="email" 
          name="email"
          value={address.email}
          onChange={handleChange}
          placeholder="Email *" 
          required
          className="w-full px-5  py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="mb-4">
        <input 
          type="tel" 
          name="phone"
          value={address.phone}
          onChange={handleChange}
          placeholder="Phone *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          name="addressLine1"
          value={address.addressLine1}
          onChange={handleChange}
          placeholder="Address line 1 *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="mb-4">
        <input 
          type="text" 
          name="apartment"
          value={address.apartment}
          onChange={handleChange}
          placeholder="Apartment, suite, etc. *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <input 
          type="text" 
          name="city"
          value={address.city}
          onChange={handleChange}
          placeholder="City *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <input 
          type="text" 
          name="state"
          value={address.state}
          onChange={handleChange}
          placeholder="State / Region *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input 
          type="text" 
          name="zipCode"
          value={address.zipCode}
          onChange={handleChange}
          placeholder="ZIP / Postal code *" 
          required
          className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
        />
        <div className="relative">
          <select 
            name="country"
            value={address.country}
            onChange={handleChange}
            required
            className="w-full px-5 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          >
            <option value="USA">USA</option>
            <option value="UK">UK</option>
            <option value="CAN">Canada</option>
            <option value="IND">India</option>
          </select>
          <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}

