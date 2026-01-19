'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import OrderStatus from '@/components/OrderStatus';
import { fetchOrder } from '@/lib/api';

export default function OrderPage() {
  const params = useParams();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadOrder() {
      try {
        const data = await fetchOrder(orderId);
        setOrder(data);
      } catch (err) {
        setError('Failed to load order');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();

    // Poll for updates every 10 seconds
    const interval = setInterval(loadOrder, 10000);

    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-xl">Loading order...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-xl text-red-600 mb-4">{error || 'Order not found'}</p>
          <a href="/" className="text-blue-500 hover:underline">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <OrderStatus order={order} />
    </div>
  );
}
