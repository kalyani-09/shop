export interface Product {
  id: number;
  title: string;
  category: string;
  price: number;
  oldPrice?: number;
  stock: number;
  rating: number;
  image: string;
  description: string;
  reviewCount?: number;
}

