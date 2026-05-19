import { Header } from '../components/header';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function FinalPage() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100">
      <Header />
      
      <main className="flex flex-col items-center justify-center pt-32 pb-20 px-4 text-center">
        {/* Success Icon */}
        <div className="mb-12 relative">
          <div className="h-20 w-20 bg-emerald-50 rounded-full flex items-center justify-center animate-in fade-in zoom-in duration-700">
            <div className="h-14 w-14 bg-white rounded-full border-2 border-emerald-500 flex items-center justify-center shadow-sm">
              <svg 
                viewBox="0 0 24 24" 
                className="h-8 w-8 text-emerald-500" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="3.5"
              >
                <path 
                  d="M20 6L9 17L4 12" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                  className="animate-draw"
                />
              </svg>
            </div>
          </div>
          {/* Subtle pulse ring */}
          <div className="absolute inset-0 h-20 w-20 rounded-full border-2 border-emerald-500/20 animate-ping" />
        </div>

        <h1 className="text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Thank you for your order
        </h1>
        
        <p className="max-w-2xl text-xl text-slate-500 leading-relaxed mb-8">
          We've sent a confirmation to <span className="font-semibold text-slate-900">{user?.name || 'your email'}</span>. 
          Your order is now <span className="font-semibold text-amber-600">pending</span> and will be confirmed once the admin approves it.
        </p>

        <div className="mb-16 flex items-center gap-2">
          <span className="text-base text-slate-400">Order number</span>
          <span className="text-base font-bold text-slate-900 uppercase">ORD-1724</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-center justify-center w-full max-w-md">
          <Link
            to="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-indigo-600 px-10 py-4 text-base font-bold text-white shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
          >
            Back to home
          </Link>
          <Link
            to="/profile"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-10 py-4 text-base font-bold text-slate-700 hover:bg-slate-50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 shadow-sm"
          >
            View orders
          </Link>
        </div>
      </main>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes draw {
          from { stroke-dasharray: 50; stroke-dashoffset: 50; }
          to { stroke-dasharray: 50; stroke-dashoffset: 0; }
        }
        .animate-draw {
          animation: draw 0.6s ease-out forwards;
          animation-delay: 0.3s;
          stroke-dasharray: 50;
          stroke-dashoffset: 50;
        }
      `}} />
    </div>
  );
}
