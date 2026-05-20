import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

export function AdminNotificationListener() {
  const { isAuthenticated, user, token } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user || user.role !== 'ADMIN' || !token) {
      return;
    }

    console.log('Admin detected, connecting to order notifications SSE...');
    
    // Construct SSE URL with the JWT token as query param
    const sseUrl = `http://localhost:8080/cart/admin/orders/notifications?token=${encodeURIComponent(token)}`;
    const eventSource = new EventSource(sseUrl);

    eventSource.onopen = () => {
      console.log('Order notification SSE connection opened.');
    };

    eventSource.addEventListener('order-notification', (event) => {
      console.log('Received notification event:', event.data);
      
      // Beautiful and premium looking Toast notification
      toast(event.data, {
        icon: '🔔',
        duration: 8000,
        style: {
          borderRadius: '20px',
          background: 'linear-gradient(135deg, #4f46e5 0%, #312e81 100%)',
          color: '#ffffff',
          fontWeight: 700,
          boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.4), 0 8px 10px -6px rgba(79, 70, 229, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '16px 24px',
          fontSize: '15px',
        },
      });
    });

    eventSource.addEventListener('INIT', (event) => {
      console.log('SSE connection initialized:', event.data);
    });

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
    };

    return () => {
      console.log('Disconnecting from order notifications SSE...');
      eventSource.close();
    };
  }, [isAuthenticated, user, token]);

  return null;
}
