import { Header } from '../components/header'
import { Footer } from '../components/footer'
import { useState, useEffect } from 'react'
import { ProductCard } from '../components/product'
import api from '../api/axios'
import type { Product } from '../types/product'

const categories = [
  'All products',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Beauty',
  'Sports',
  'Books',
]



export default function Shop() {
  const [selectedCategory, setSelectedCategory] = useState('All products')
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/products");
        const data = response.data;
        const formatted: Product[] = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          category: item.category,
          price: item.price,
          oldPrice: item.price * 1.2,
          stock: item.stockQuantity,
          rating: item.rating || 4.5,
          image: item.imageURL || '',
          description: item.description,
        }));
        setProducts(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const filteredProducts = selectedCategory === 'All products' 
    ? products 
    : products.filter(product => {
        const productCat = product.category?.toLowerCase();
        const selectedCat = selectedCategory.toLowerCase();
        
        if (selectedCategory === 'Home & Living') {
          return productCat === 'home' || 
                 productCat === 'living' || 
                 productCat === 'home and living' || 
                 productCat === 'home & living';
        }
        
        return productCat === selectedCat;
      });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-7xl mt-0 sm:px-6 py-8">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <span className="text-[10px] font-bold tracking-[0.2em] text-indigo-600 uppercase mb-2 block">
              Shop
            </span>
            <h1 className="text-4xl font-bold text-black mb-1">{selectedCategory}</h1>
            <p className="text-sm text-slate-600">{filteredProducts.length} items found</p>
          </div>
          
          {/* <div className="flex items-center gap-2 relative">
            <CustomDropdown/>
          </div> */}
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* Sidebar */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="space-y-8 sticky top-24">
              {/* Category Filter */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">
                  Category
                </h3>
                <ul className="space-y-1">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        className={`w-full text-left px-4 py-2 rounded-xl text-sm transition-all ${
                          selectedCategory === category
                            ? 'bg-indigo-50 text-indigo-600 font-medium'
                            : 'text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Price Range */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">
                  Price Range
                </h3>
                <div className="px-2">
                  <div className="h-1.5 w-full bg-indigo-100 rounded-full relative mb-4">
                    <div className="absolute inset-y-0 left-0 w-full bg-indigo-500 rounded-full"></div>
                    <div className="absolute -top-1 left-0 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full shadow-sm"></div>
                    <div className="absolute -top-1 right-0 w-3.5 h-3.5 bg-white border-2 border-indigo-500 rounded-full shadow-sm"></div>
                  </div>
                  <div className="flex justify-between text-xs font-medium text-slate-600">
                    <span>$0</span>
                    <span>$400</span>
                  </div>
                </div>
              </div>

              {/* Rating Filter */}
              <div>
                <h3 className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-4">
                  Minimum Rating
                </h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-4 py-2 rounded-xl text-sm bg-indigo-50 text-indigo-600 font-medium">
                    Any
                  </button>
                  <button className="w-full text-left px-4 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-2">
                    <span className="text-yellow-400">★</span> 3+ stars
                  </button>
                </div>
              </div>
            </div>
          </aside>

       <ProductCard products={filteredProducts} loading={loading}/>

        </div>
      </main>

      <Footer />
    </div>
  )
}
