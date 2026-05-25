import React from 'react';
import type { Product } from '../types/product';


interface AdminProductItemProps {
  product: Product;
  variant?: 'admin' | 'cart';
  quantity?: number;
  onDelete?: (id: number) => Promise<void>;
  onEdit?: (product: Product) => void;
  onUpdateQuantity?: (id: number, newQuantity: number) => Promise<void>;
  isEditing?: boolean;
}

export const AdminProductItem: React.FC<AdminProductItemProps> = ({ 
  product, 
  variant = 'admin', 
  quantity = 1,
  onDelete,
  onEdit,
  onUpdateQuantity,
  isEditing
}) => {
  return (
    <div className={`group flex items-center gap-6 bg-white p-4 rounded-[2rem] border transition-all duration-300 
      ${isEditing ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'border-slate-100 shadow-sm hover:shadow-md'}
      ${variant === 'cart' ? 'mb-4' : ''}`}>
      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-2xl bg-slate-50">
        <img 
          src={product.image} 
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      
      <div className="flex-grow min-w-0">
        <h3 className="text-lg font-bold text-slate-900 truncate mb-1">{product.title}</h3>
        <div className="flex items-center gap-2 text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          <span>{product.category}</span>
          {variant === 'admin' && (
            <>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className="text-slate-600">${product.price.toFixed(2)}</span>
              <span className="h-1 w-1 rounded-full bg-slate-300" />
              <span className={product.stock > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                {product.stock} in stock
              </span>
            </>
          )}
        </div>
        
        {variant === 'cart' && onUpdateQuantity && (
          <div className="flex items-center bg-slate-50 border border-slate-200 rounded-full p-0.5 shadow-sm w-fit mt-2">
            <button
              onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M20 12H4" />
              </svg>
            </button>
            <span className="w-8 text-center font-bold text-slate-900 text-sm">{quantity}</span>
            <button
              onClick={() => onUpdateQuantity(product.id, Math.min(product.stock, quantity + 1))}
              className="w-8 h-8 flex items-center justify-center rounded-full text-slate-600 hover:bg-white hover:text-indigo-600 hover:shadow-sm transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex flex-col items-end gap-2">
        {variant === 'admin' && (
          <button 
            onClick={() => onEdit?.(product)}
            className={`p-2 rounded-xl transition-all ${isEditing ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:text-indigo-600 hover:bg-indigo-50'}`}
            aria-label={`Edit ${product.title}`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
        
        <button 
          onClick={() => onDelete?.(product.id)}
          className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
          aria-label={variant === 'admin' ? `Delete ${product.title}` : `Remove ${product.title}`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        {variant === 'cart' && (
          <span className="text-lg font-bold text-slate-900">${(product.price * quantity).toFixed(2)}</span>
        )}
      </div>
    </div>
  );
};
