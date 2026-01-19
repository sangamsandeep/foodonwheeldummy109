'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import StaffDashboard from '@/components/StaffDashboard';
import { fetchStaffOrders } from '@/lib/api';

export default function StaffPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [storeId, setStoreId] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Try to fetch orders to validate credentials
      const data = await fetchStaffOrders(storeId, '', password);
      setOrders(data);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError('Invalid credentials or store ID');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full">
          <h1 className="text-3xl font-bold mb-6 text-center">Staff Login</h1>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="storeId" className="block text-sm font-medium mb-1">
                Store ID:
              </label>
              <input
                id="storeId"
                type="text"
                value={storeId}
                onChange={(e) => setStoreId(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                placeholder="Enter store UUID"
              />
              <p className="text-xs text-gray-500 mt-1">
                Tip: Check the database or seed output for store ID
              </p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">
                Password:
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border rounded px-3 py-2"
                required
                placeholder="Enter staff password"
              />
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded disabled:bg-gray-400"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Staff Dashboard</h1>
          <button
            onClick={() => setIsAuthenticated(false)}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>

        <StaffDashboard
          initialOrders={orders}
          storeId={storeId}
          password={password}
        />
      </div>
    </div>
  );
}
