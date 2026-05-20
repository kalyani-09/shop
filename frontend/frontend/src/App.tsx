import { Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from "react-hot-toast";
import Home from './pages/home'
import Shop from './pages/shop'
import Admin from './pages/admin'
import AdminOrders from './pages/adminOrders'
import ProductDetails from './pages/productDetails'
import UserDetails from './pages/userDetails'
import AddToCart from './pages/AddToCart'
import CheckoutPage from './pages/CheckoutPage'
import FinalPage from './pages/FinalPage'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import ViewOrderDetail from './pages/viewOrderDetail'
import ReelsPage from './pages/ReelsPage'
import UploadReelPage from './pages/UploadReelPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AdminNotificationListener } from './components/AdminNotificationListener'

function App() {
  return (

    <>
      <Toaster position="top-right" />
      <AdminNotificationListener />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/shop" element={<Shop />} />
        
        {/* Protected Routes */}
        <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/admin/orders" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><UserDetails /></ProtectedRoute>} />
        <Route path="/order-detail/:orderNumber" element={<ProtectedRoute><ViewOrderDetail /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute><AddToCart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/final" element={<ProtectedRoute><FinalPage /></ProtectedRoute>} />
        
        {/* Public Routes */}
        <Route path="/product/:id" element={<ProductDetails />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/reels" element={<ReelsPage />} />
        <Route path="/reels/upload" element={<ProtectedRoute><UploadReelPage /></ProtectedRoute>} />

      </Routes>
    </>

  )
}

export default App
