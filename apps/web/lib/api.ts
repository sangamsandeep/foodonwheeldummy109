const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function fetchMenu(slug: string) {
  const res = await fetch(`${API_URL}/api/stores/${slug}/menu`, {
    cache: 'no-store',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch menu');
  }
  
  return res.json();
}

export async function createCheckoutSession(data: {
  storeId: string;
  cartItems: { menuItemId: string; quantity: number }[];
  phoneE164: string;
  consentCall: boolean;
  consentSms: boolean;
  tipCents?: number;
}) {
  const res = await fetch(`${API_URL}/api/checkout-session`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to create checkout session');
  }

  return res.json();
}

export async function fetchOrder(orderId: string) {
  const res = await fetch(`${API_URL}/api/orders/${orderId}`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch order');
  }

  return res.json();
}

export async function fetchStaffOrders(storeId: string, status?: string, password?: string) {
  const params = new URLSearchParams({ storeId });
  if (status) params.append('status', status);

  const res = await fetch(`${API_URL}/api/staff/orders?${params}`, {
    headers: {
      'X-Staff-Password': password || '',
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Unauthorized or failed to fetch orders');
  }

  return res.json();
}

export async function updateOrderStatus(
  orderId: string,
  status: 'PREPARING' | 'READY',
  password: string
) {
  const res = await fetch(`${API_URL}/api/staff/orders/${orderId}/status`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Staff-Password': password,
    },
    body: JSON.stringify({ status }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to update status');
  }

  return res.json();
}

export async function completeOrder(orderId: string, otp: string, password: string) {
  const res = await fetch(`${API_URL}/api/staff/orders/${orderId}/complete`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Staff-Password': password,
    },
    body: JSON.stringify({ otp }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to complete order');
  }

  return res.json();
}

export async function resendOTP(orderId: string, password: string) {
  const res = await fetch(`${API_URL}/api/staff/orders/${orderId}/resend-otp`, {
    method: 'POST',
    headers: {
      'X-Staff-Password': password,
    },
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to resend OTP');
  }

  return res.json();
}

export async function fetchDailyReport(storeId: string, date: string, password: string) {
  const params = new URLSearchParams({ storeId, date });
  
  const res = await fetch(`${API_URL}/api/staff/reports/daily?${params}`, {
    headers: {
      'X-Staff-Password': password,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch daily report');
  }

  return res.json();
}

export async function fetchItemsReport(
  storeId: string,
  dateFrom: string,
  dateTo: string,
  password: string
) {
  const params = new URLSearchParams({ storeId, dateFrom, dateTo });
  
  const res = await fetch(`${API_URL}/api/staff/reports/items?${params}`, {
    headers: {
      'X-Staff-Password': password,
    },
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch items report');
  }

  return res.json();
}
