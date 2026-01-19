'use client';

import { useState } from 'react';
import { updateOrderStatus, completeOrder, resendOTP } from '@/lib/api';

interface Order {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  customerPhoneE164: string;
  totalCents: number;
  items: {
    nameSnapshot: string;
    quantity: number;
  }[];
  createdAt: string;
  placedAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
}

const formatTime = (iso: string | null | undefined) =>
  iso ? new Date(iso).toLocaleString() : '—';

const getDurationMinutes = (order: Order) => {
  const start = order.placedAt || order.createdAt;
  const end = order.completedAt || new Date().toISOString();
  const minutes = (new Date(end).getTime() - new Date(start).getTime()) / 60000;
  return Math.max(0, Math.round(minutes));
};

const getSlaColor = (minutes: number) => {
  if (minutes <= 10) return 'bg-green-500 text-white';
  if (minutes <= 15) return 'bg-yellow-500 text-black';
  if (minutes <= 20) return 'bg-red-400 text-white';
  return 'bg-red-600 text-white';
};

interface StaffDashboardProps {
  initialOrders: Order[];
  storeId: string;
  password: string;
}

export default function StaffDashboard({ initialOrders, storeId, password }: StaffDashboardProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [otpInput, setOtpInput] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleStatusUpdate = async (orderId: string, newStatus: 'PREPARING' | 'READY') => {
    setLoading({ ...loading, [orderId]: true });
    setError('');
    setSuccess('');

    try {
      await updateOrderStatus(orderId, newStatus, password);
      
      // Refresh orders
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, status: newStatus, readyAt: newStatus === 'READY' ? new Date().toISOString() : order.readyAt }
          : order
      );
      setOrders(updatedOrders);
      
      if (newStatus === 'READY') {
        setSuccess('Order marked as ready. Call initiated to customer.');
      } else {
        setSuccess('Order status updated successfully.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, [orderId]: false });
    }
  };

  const handleCompleteOrder = async (orderId: string) => {
    const otp = otpInput[orderId];
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading({ ...loading, [orderId]: true });
    setError('');
    setSuccess('');

    try {
      await completeOrder(orderId, otp, password);
      
      // Refresh orders
      const updatedOrders = orders.map((order) =>
        order.id === orderId
          ? { ...order, status: 'COMPLETED', completedAt: new Date().toISOString() }
          : order
      );
      setOrders(updatedOrders);
      setOtpInput({ ...otpInput, [orderId]: '' });
      setSuccess('Order completed successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, [orderId]: false });
    }
  };

  const handleResendOTP = async (orderId: string) => {
    setLoading({ ...loading, [`resend-${orderId}`]: true });
    setError('');
    setSuccess('');

    try {
      await resendOTP(orderId, password);
      setSuccess('OTP resent successfully!');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading({ ...loading, [`resend-${orderId}`]: false });
    }
  };

  const filteredOrders = selectedStatus
    ? orders.filter((order) => order.status === selectedStatus)
    : orders;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-500';
      case 'PREPARING':
        return 'bg-yellow-500';
      case 'READY':
        return 'bg-green-500';
      case 'COMPLETED':
        return 'bg-gray-500';
      default:
        return 'bg-gray-400';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Filter by Status:</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="border rounded px-3 py-2 w-full max-w-xs"
        >
          <option value="">All Orders</option>
          <option value="PLACED">Placed</option>
          <option value="PREPARING">Preparing</option>
          <option value="READY">Ready</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders found</p>
        ) : (
          filteredOrders.map((order) => (
            <div key={order.id} className="bg-white rounded-lg shadow p-4 border">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">Order #{order.orderNumber}</h3>
                  <p className="text-sm text-gray-600">{order.customerPhoneE164}</p>
                  <p className="text-xs text-gray-500">Received: {formatTime(order.placedAt || order.createdAt)}</p>
                  <p className="text-xs text-gray-500">Completed: {formatTime(order.completedAt)}</p>
                </div>
                <div className="text-right">
                  <span className={`px-3 py-1 rounded-full text-white text-sm ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                  <p className="font-bold mt-2">${(order.totalCents / 100).toFixed(2)}</p>
                  <div className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${getSlaColor(getDurationMinutes(order))}`}>
                    {getDurationMinutes(order)} min
                  </div>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-sm font-medium mb-1">Items:</p>
                <ul className="text-sm text-gray-700 space-y-1">
                  {order.items.map((item, idx) => (
                    <li key={idx}>
                      {item.quantity}x {item.nameSnapshot}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex flex-wrap gap-2">
                {order.status === 'PLACED' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'PREPARING')}
                    disabled={loading[order.id]}
                    className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  >
                    {loading[order.id] ? 'Updating...' : 'Start Preparing'}
                  </button>
                )}

                {order.status === 'PREPARING' && (
                  <button
                    onClick={() => handleStatusUpdate(order.id, 'READY')}
                    disabled={loading[order.id]}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:bg-gray-300"
                  >
                    {loading[order.id] ? 'Updating...' : 'Mark Ready (& Call)'}
                  </button>
                )}

                {order.status === 'READY' && (
                  <div className="flex gap-2 items-center w-full">
                    <input
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otpInput[order.id] || ''}
                      onChange={(e) => setOtpInput({ ...otpInput, [order.id]: e.target.value })}
                      className="border rounded px-3 py-2 flex-1"
                      maxLength={6}
                    />
                    <button
                      onClick={() => handleCompleteOrder(order.id)}
                      disabled={loading[order.id]}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-300 whitespace-nowrap"
                    >
                      {loading[order.id] ? 'Verifying...' : 'Complete'}
                    </button>
                    <button
                      onClick={() => handleResendOTP(order.id)}
                      disabled={loading[`resend-${order.id}`]}
                      className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:bg-gray-300 whitespace-nowrap text-sm"
                    >
                      {loading[`resend-${order.id}`] ? 'Sending...' : 'Resend OTP'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
