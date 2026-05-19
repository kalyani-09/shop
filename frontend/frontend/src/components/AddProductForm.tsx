import React from "react";
import type { Product } from "../types/product";
import toast from "react-hot-toast";
import CustomDropdown from "./CustomDropdown";


interface AddProductFormProps {
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  formData: {
    title: string;
    category: string;
    price: string;
    oldPrice: string;
    stock: string;
    rating: string;
    image: string;
    description: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    title: string;
    category: string;
    price: string;
    oldPrice: string;
    stock: string;
    rating: string;
    image: string;
    description: string;
  }>>;
  editingProduct: Product | null;
  onCancelEdit: () => void;
}

export function AddProductForm({ 
  setProducts, 
  formData, 
  setFormData, 
  editingProduct, 
  onCancelEdit 
}: AddProductFormProps) {

  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const price = parseFloat(formData.price);
    const stock = parseInt(formData.stock);

    // Validation
    if (!formData.title.trim()) {
      return toast.error("Product title is required");
    }

    if (isNaN(price) || price <= 0) {
      return toast.error("Enter a valid price");
    }
    
    if (formData.stock && (isNaN(stock) || stock < 0)) {
      return toast.error("Stock cannot be negative");
    }

    if (!formData.image.trim()) {
      return toast.error("Image url is required");
    }

    const payload = {
      name: formData.title,
      description: formData.description,
      price: price,
      stockQuantity: stock || 0,
      imageURL: formData.image,
      category: formData.category,
      sku: editingProduct ? editingProduct.id.toString() : `SKU-${Date.now()}`
    };

    try {
      setLoading(true);

      const url = editingProduct 
        ? `http://localhost:8080/products/${editingProduct.id}`
        : "http://localhost:8080/products";
      
      const method = editingProduct ? "PUT" : "POST";

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Failed to ${editingProduct ? 'update' : 'add'} product`);
      }

      const savedProduct = await response.json();

      if (editingProduct) {
        setProducts((prev) => prev.map(p => p.id === editingProduct.id ? {
          ...p,
          title: savedProduct.name || formData.title,
          category: savedProduct.category || formData.category,
          price: savedProduct.price || price,
          stock: savedProduct.stockQuantity || stock,
          image: savedProduct.imageURL || formData.image,
          description: savedProduct.description || formData.description
        } : p));
        toast.success("Product updated successfully");
        onCancelEdit();
      } else {
        setProducts((prev) => [
          {
            id: savedProduct.id || Date.now(),
            title: savedProduct.name,
            category: savedProduct.category,
            price: savedProduct.price,
            stock: savedProduct.stockQuantity,
            rating: 0,
            image: savedProduct.imageURL || savedProduct.image,
            description: savedProduct.description
          },
          ...prev
        ]);
        toast.success("Product added successfully");
        // Reset Form
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
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(`${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className={`bg-white rounded-3xl mt-4 border transition-all duration-300 p-6 shadow-sm h-fit ${editingProduct ? 'ring-2 ring-indigo-500/20 border-indigo-500' : 'border-slate-100'}`}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className={`${editingProduct ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-600'} p-2 rounded-lg transition-colors`}>
            {editingProduct ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900">{editingProduct ? 'Edit product' : 'Add new product'}</h2>
        </div>
        {editingProduct && (
          <button 
            onClick={onCancelEdit}
            className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Cancel
          </button>
        )}
      </div>

      {editingProduct && (
        <div className="mb-6 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50 text-sm text-indigo-900">
          <p>
            Editing <span className="font-bold text-indigo-600">{editingProduct.title}</span>. 
            Changes are saved instantly to the catalogue.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="text"
            name="title"
            placeholder="Product title *"
            value={formData.title}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            required
          />
        </div>

        <div>
          <CustomDropdown
            options={["Electronics", "Fashion", "Home & Living", "Beauty", "Sports", "Books"]}
            selected={formData.category}
            onSelect={(category) => setFormData(prev => ({ ...prev, category }))}
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="price"
            placeholder="Price *"
            value={formData.price}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            required
          />
          <input
            type="number"
            name="oldPrice"
            placeholder="Old price"
            value={formData.oldPrice}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            name="stock"
            placeholder="Stock"
            value={formData.stock}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
          <input
            type="text"
            name="rating"
            placeholder="Rating (e.g. 4.5)"
            value={formData.rating}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div>
          <input
            type="text"
            name="image"
            placeholder="Image URL *"
            value={formData.image}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            required
          />
        </div>

        <div>
          <textarea
            name="description"
            placeholder="Description"
            rows={4}
            value={formData.description}
            onChange={handleInputChange}
            className="w-full px-5 py-3 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            disabled={loading}
            className={`flex-grow flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-bold text-white shadow-lg transition-all 
            ${loading
                ? "bg-indigo-400 cursor-not-allowed"
                : "bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] shadow-indigo-200"
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="3" fill="none" />
                </svg>
                {editingProduct ? 'Saving...' : 'Adding...'}
              </>
            ) : (
              <>
                {editingProduct ? (
                   <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                {editingProduct ? 'Save changes' : 'Add product'}
              </>
            )}
          </button>
          
          {editingProduct && (
            <button
              type="button"
              onClick={onCancelEdit}
              className="px-8 rounded-2xl py-4 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all"
            >
              Discard
            </button>
          )}
        </div>
      </form>
    </div>
  );
}