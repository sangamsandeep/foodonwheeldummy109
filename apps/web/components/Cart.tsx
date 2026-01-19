'use client';

import { useState } from 'react';

interface CartItem {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

interface CartProps {
  items: CartItem[];
  onUpdateQuantity: (menuItemId: string, quantity: number) => void;
  onCheckout: (phoneE164: string, consentCall: boolean, consentSms: boolean, tipCents: number) => void;
  isLoading?: boolean;
}

export default function Cart({ items, onUpdateQuantity, onCheckout, isLoading }: CartProps) {
  const [phone, setPhone] = useState('');
  const [consentCall, setConsentCall] = useState(true);
  const [consentSms, setConsentSms] = useState(true);
  const [tip, setTip] = useState('0');
  const [error, setError] = useState('');

  const subtotal = items.reduce((sum, item) => sum + item.priceCents * item.quantity, 0);
  const tipCents = Math.round(parseFloat(tip || '0') * 100);
  const total = subtotal + tipCents;

  const handleCheckout = () => {
    setError('');

    // Validate phone number (simple E.164 format)
    if (!phone.match(/^\+[1-9]\d{1,14}$/)) {
      setError('Please enter a valid phone number in E.164 format (e.g., +12025551234)');
      return;
    }

    onCheckout(phone, consentCall, consentSms, tipCents);
  };

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
        <p className="text-gray-500">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Your Cart</h2>
      
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <div key={item.menuItemId} className="flex justify-between items-center border-b pb-3">
            <div className="flex-1">
              <p className="font-medium">{item.name}</p>
              <p className="text-sm text-gray-600">${(item.priceCents / 100).toFixed(2)} each</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => onUpdateQuantity(item.menuItemId, item.quantity - 1)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                disabled={isLoading}
              >
                -
              </button>
              <span className="font-semibold w-8 text-center">{item.quantity}</span>
              <button
                onClick={() => onUpdateQuantity(item.menuItemId, item.quantity + 1)}
                className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded"
                disabled={isLoading}
              >
                +
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t pt-4 space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal:</span>
          <span className="font-semibold">${(subtotal / 100).toFixed(2)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <label htmlFor="tip" className="text-sm">Tip (optional):</label>
          <input
            id="tip"
            type="number"
            step="0.01"
            min="0"
            value={tip}
            onChange={(e) => setTip(e.target.value)}
            className="border rounded px-2 py-1 w-24 text-right"
            placeholder="0.00"
            disabled={isLoading}
          />
        </div>

        <div className="flex justify-between text-lg font-bold pt-2 border-t">
          <span>Total:</span>
          <span>${(total / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone Number (with country code):
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+12025551234"
            className="w-full border rounded px-3 py-2"
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={consentSms}
              onChange={(e) => setConsentSms(e.target.checked)}
              disabled={isLoading}
            />
            <span>Send me pickup OTP via SMS</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={consentCall}
              onChange={(e) => setConsentCall(e.target.checked)}
              disabled={isLoading}
            />
            <span>Call me when order is ready</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <button
          onClick={handleCheckout}
          disabled={isLoading}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Proceed to Payment'}
        </button>
      </div>
    </div>
  );
}
