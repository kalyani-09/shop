import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Product } from '../types/product'
import CustomDropdown from './CustomDropdown'


interface ProductCardProps {
  products: Product[];
  loading: boolean;
}

export function ProductCard({ products, loading }: ProductCardProps) {
    const [sortBy, setSortBy] = useState('Most popular');
    
    const sortOptions = [
      "Most popular",
      "Newest",
      "Price: Low to High",
      "Price: High to Low",
    ];

    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      );
    }

    const sortedProducts = [...products].sort((a, b) => {
      if (sortBy === 'Price: Low to High') return a.price - b.price;
      if (sortBy === 'Price: High to Low') return b.price - a.price;
      if (sortBy === 'Newest') return b.id - a.id;
      return 0;
    });

    return(
        <>
         <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-slate-600 font-medium">
                {sortedProducts.length} items found
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sort by:</span>
                <CustomDropdown 
                  options={sortOptions} 
                  selected={sortBy} 
                  onSelect={setSortBy} 
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-x-8 gap-y-12">
              {sortedProducts.map((product) => (

                <Link to={`/product/${product.id}`} key={product.id} className="group cursor-pointer">
                  <div className="relative aspect-[4/5] rounded-2xl bg-slate-200 overflow-hidden mb-4 shadow-sm group-hover:shadow-md transition-shadow">
                    {/* Badge */}
                    {product.stock < 10 && product.stock > 0 && (
                      <div className="absolute top-4 left-4 z-10">
                        <span className="bg-orange-500/90 backdrop-blur-sm px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider text-white shadow-sm uppercase">
                          Low Stock
                        </span>
                      </div>
                    )}
                    
                    {/* Placeholder for image */}
                    <div className="w-full h-full flex items-center justify-center text-slate-400 group-hover:scale-105 transition-transform duration-500">
                      {product.image ? (
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      ) : (
                        <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase block mb-1">
                      {product.category}
                    </span>
                    <h3 className="text-lg font-semibold text-black group-hover:text-indigo-600 transition-colors mb-2">
                      {product.title}
                    </h3>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl font-bold text-black">${product.price.toFixed(2)}</span>
                        {product.oldPrice && (
                          <span className="text-sm text-slate-400 line-through">${product.oldPrice.toFixed(2)}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <div className="flex text-yellow-400 text-sm">
                          {[...Array(5)].map((_, i) => (
                            <span key={i}>{i < Math.floor(product.rating) ? '★' : '☆'}</span>
                          ))}
                        </div>
                        <span className="text-xs font-semibold text-slate-500">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div></>
    )
}