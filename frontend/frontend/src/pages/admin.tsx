import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { AddProductForm } from '../components/AddProductForm';
import { AdminProductList } from '../components/AdminProductList';
import type { Product } from '../types/product';
import {toast} from "react-hot-toast";



export default function Admin() {
  


  const [products, setProducts] = useState<Product[]>([]);
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: 'Electronics',
    price: '',
    oldPrice: '',
    stock: '',
    rating: '4.5',
    image: '',
    description: ''
  });

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      title: product.title,
      category: product.category,
      price: product.price.toString(),
      oldPrice: product.oldPrice?.toString() || '',
      stock: product.stock.toString(),
      rating: product.rating.toString(),
      image: product.image,
      description: product.description || ''
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      title: '',
      category: 'Electronics',
      price: '',
      oldPrice: '',
      stock: '',
      rating: '4.5',
      image: '',
      description: ''
    });
  };

  const handleDeleteProduct = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        const response = await fetch(`http://localhost:8080/products/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete product');
        }

        setProducts(products.filter(p => p.id !== id));
        toast.success("Product Deleted Successfully");
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error("Failed to delete the product . Please try again after sometime");
      }
    }
  };

  const handleUpdateStock = async (id: number, newQuantity: number) => {
    try {
      const response = await fetch(`http://localhost:8081/products/${id}/stock?quantity=${newQuantity}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to update stock');
      }

      setProducts(products.map(p => p.id === id ? { ...p, stock: newQuantity } : p));
      toast.success("Stock Updated Successfully");
    } catch (error) {
      console.error('Error updating stock:', error);
      toast.error("Failed to update stock. Please try again.");
    }
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("http://localhost:8080/products");
        if (!response.ok) throw new Error("Failed to fetch");
        const data = await response.json();
        const formatted: Product[] = data.map((item: any) => ({
          id: item.id,
          title: item.name,
          category: item.category,
          price: item.price,
          oldPrice: item.price,
          stock: item.stockQuantity,
          rating: 0,
          image: item.imageURL || '',
          description: item.description,
        }));
        setProducts(formatted);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#fcfcfd]">
      <Header />
      
      <main className="mx-auto max-w-7xl sm:px-6 py-6">
        <div className="mb-8">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-600 mb-2">Admin</p>
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Catalogue</h1>
          <p className="text-slate-500">Add and manage products in the storefront.</p>
        </div>

        <div className="flex gap-2 mb-8">
          <Link
            to="/admin"
            className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-indigo-600 text-white shadow-lg shadow-indigo-200"
          >
            Products
          </Link>
          <Link
            to="/admin/orders"
            className="px-5 py-2.5 rounded-2xl text-sm font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
          >
            Orders
          </Link>
        </div>

        <div className="grid gap-8 lg:grid-cols-[500px_1fr]">
          {/* Left Column: Add Product Form */}
          <AddProductForm
            setProducts={setProducts}
            formData={formData}
            setFormData={setFormData}
            editingProduct={editingProduct}
            onCancelEdit={handleCancelEdit}
          />

          {/* Right Column: Product List */}
          <AdminProductList 
            products={products}
            onDelete={handleDeleteProduct}
            onEdit={handleEditClick}
            onUpdateStock={handleUpdateStock}
            editingProductId={editingProduct?.id}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
