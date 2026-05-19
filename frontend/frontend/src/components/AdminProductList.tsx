import { AdminProductItem } from './AdminProductItem';
import type { Product } from '../types/product';

interface AdminProductListProps {
  products: Product[];
  onDelete: (id: number) => Promise<void>;
  onEdit: (product: Product) => void;
  onUpdateStock: (id: number, newQuantity: number) => Promise<void>;
  editingProductId?: number;
}

export const AdminProductList: React.FC<AdminProductListProps> = ({ 
  products, 
  onDelete, 
  onEdit, 
  onUpdateStock,
  editingProductId 
}) => {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6 text-slate-500 text-sm">
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M3 8h18M10 12h4" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        <span>{products.length} products in catalogue</span>
      </div>

      <div className="space-y-4">
        {products.map((product) => (
          <AdminProductItem 
            key={product.id} 
            product={product} 
            onDelete={onDelete} 
            onEdit={onEdit}
            onUpdateQuantity={onUpdateStock}
            isEditing={editingProductId === product.id}
          />
        ))}

        {products.length === 0 && (
          <div className="py-20 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-slate-300" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 8l-2-2H5L3 8v10a2 2 0 002 2h14a2 2 0 002-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p className="text-slate-500 font-medium">No products in catalogue yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
