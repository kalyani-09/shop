import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

interface HeaderProps {
  variant?: 'light' | 'dark'
}

export function Header({ variant = 'light' }: HeaderProps) {
  const { isAuthenticated, user } = useAuth();
  const { cartCount } = useCart();

  const isDark = variant === 'dark';

  return (
    <header className={`mx-auto flex w-full max-w-8xl items-center gap-6 px-6 py-3 transition-colors duration-300 ${
      isDark ? 'border-b border-white/10 bg-black/20 backdrop-blur-md' : 'border-b border-gray-200 bg-white'
    }`}>
      <div className="flex items-center gap-2 group cursor-pointer">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-100 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110">
          <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
            <path fill="currentColor" d="M12 2l1.2 4.8 4.8 1.2-4.8 1.2-1.2 4.8-1.2-4.8-4.8-1.2 4.8-1.2L12 2z" />
          </svg>
        </div>
        <span className={`text-lg font-semibold tracking-tight ${isDark ? 'text-white' : 'text-slate-900'}`}>Zestlo</span>
      </div>

      <nav className={`hidden items-center gap-6 text-sm md:flex ${isDark ? 'text-white/70' : 'text-slate-600'}`}>
        <Link className="text-indigo-600 font-medium" to="/home">Home</Link>
        <Link className={`hover:text-white transition-colors ${!isDark && 'hover:text-slate-900'}`} to="/shop">Shop</Link>
        <Link className={`hover:text-white transition-colors ${!isDark && 'hover:text-slate-900'}`} to="/shop">Electronics</Link>
        <Link className={`hover:text-white transition-colors ${!isDark && 'hover:text-slate-900'}`} to="/reels">Reels</Link>
        <Link className={`hover:text-white transition-colors ${!isDark && 'hover:text-slate-900'}`} to="/shop">Fashion</Link>
        {isAuthenticated && user?.role === 'ADMIN' && (
          <Link className={`hover:text-white transition-colors ${!isDark && 'hover:text-slate-900'}`} to="/admin">Admin</Link>
        )}
        {isAuthenticated && user?.role === 'ADMIN' && (
          <Link className={`hover:text-white transition-colors ${!isDark && 'hover:text-slate-900'}`} to="/admin/orders">Orders</Link>
        )}
      </nav>

      <div className="ml-auto flex items-center gap-3">
        <label className="relative hidden w-[360px] md:block">
          <span className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-white/40' : 'text-slate-400'}`}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </span>
          <input 
            className={`w-full rounded-full border py-2 pl-10 pr-4 text-sm outline-none ring-indigo-500 focus:ring-2 transition-all ${
              isDark 
                ? 'border-white/10 bg-white/10 text-white placeholder:text-white/40' 
                : 'border-slate-200 bg-slate-50 text-slate-700 placeholder:text-slate-400'
            }`} 
            placeholder="Search products..." 
          />
        </label>

        {isAuthenticated ? (
          <>
            <Link to="/profile">
              <button type="button" className={`grid h-10 w-10 place-items-center rounded-full border transition-all ${
                isDark 
                  ? 'border-white/10 bg-white/10 text-white hover:bg-white/20' 
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`} aria-label="Account">
                <i className="fa-solid fa-user"></i>
              </button>
            </Link>
          </>
        ) : (
          <Link to="/login">
            <button type="button" className="rounded-full bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 transition-all">
              Sign In
            </button>
          </Link>
        )}

        <Link to="/cart">
          <button type="button" className={`relative grid h-10 w-10 place-items-center rounded-full border transition-all ${
            isDark 
              ? 'border-white/10 bg-white/10 text-white hover:bg-white/20' 
              : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
          }`} aria-label="Cart">
            <i className="fa-solid fa-cart-shopping"></i>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {cartCount}
              </span>
            )}
          </button>
        </Link>
      </div>
    </header>
  )
}
