interface Order {
  id: string;
  orderNumber: number;
  status: string;
  paymentStatus: string;
  totalCents: number;
  items: {
    nameSnapshot: string;
    quantity: number;
    priceCentsSnapshot: number;
  }[];
  store: {
    name: string;
  };
  pickupOtpLast4?: string | null;
  placedAt?: string | null;
  readyAt?: string | null;
  completedAt?: string | null;
}

interface OrderStatusProps {
  order: Order;
}

export default function OrderStatus({ order }: OrderStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED':
        return 'bg-blue-100 text-blue-800';
      case 'PREPARING':
        return 'bg-yellow-100 text-yellow-800';
      case 'READY':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Order #{order.orderNumber}</h1>
        <p className="text-gray-600">{order.store.name}</p>
      </div>

      <div className="mb-6">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-lg font-semibold">Status:</span>
          <span className={`px-4 py-2 rounded-full font-medium ${getStatusColor(order.status)}`}>
            {order.status}
          </span>
        </div>

        {order.status === 'READY' && order.pickupOtpLast4 && (
          <div className="bg-green-50 border border-green-200 rounded p-4">
            <p className="font-semibold text-green-800 mb-1">
              Your order is ready for pickup!
            </p>
            <p className="text-sm text-green-700">
              OTP ends with: ****{order.pickupOtpLast4}
            </p>
            <p className="text-xs text-green-600 mt-2">
              Provide the full 6-digit OTP to staff when picking up.
            </p>
          </div>
        )}

        {order.status === 'COMPLETED' && (
          <div className="bg-gray-50 border border-gray-200 rounded p-4">
            <p className="font-semibold text-gray-800">
              Order completed. Thank you!
            </p>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-xl font-bold mb-3">Order Items</h2>
        <div className="space-y-2">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between py-2 border-b">
              <span>
                {item.quantity}x {item.nameSnapshot}
              </span>
              <span className="font-medium">
                ${((item.priceCentsSnapshot * item.quantity) / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
        <div className="flex justify-between pt-3 mt-3 border-t font-bold text-lg">
          <span>Total:</span>
          <span>${(order.totalCents / 100).toFixed(2)}</span>
        </div>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        {order.placedAt && (
          <p>Placed: {new Date(order.placedAt).toLocaleString()}</p>
        )}
        {order.readyAt && (
          <p>Ready: {new Date(order.readyAt).toLocaleString()}</p>
        )}
        {order.completedAt && (
          <p>Completed: {new Date(order.completedAt).toLocaleString()}</p>
        )}
      </div>
    </div>
  );
}
