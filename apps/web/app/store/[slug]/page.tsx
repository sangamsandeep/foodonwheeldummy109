'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import MenuDisplay from '@/components/MenuDisplay';
import Cart from '@/components/Cart';
import { fetchMenu, createCheckoutSession } from '@/lib/api';

interface MenuItem {
  id: string;
  name: string;
  category: string | null;
  priceCents: number;
  price: string;
  imageUrl: string | null;
  isAvailable: boolean;
}

interface MenuCategory {
  [key: string]: MenuItem[];
}

interface Store {
  id: string;
  name: string;
  slug: string;
  categories: MenuCategory;
  itemCount: number;
}

interface CartItem {
  menuItemId: string;
  name: string;
  priceCents: number;
  quantity: number;
}

export default function StorePage() {
  const params = useParams();
  const slug = params.slug as string;

  const [store, setStore] = useState<Store | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartQuantities, setCartQuantities] = useState<{ [itemId: string]: number }>({});

  useEffect(() => {
    async function loadMenu() {
      try {
        const data = await fetchMenu(slug);
        setStore(data);
      } catch (err) {
        setError('Failed to load menu');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMenu();
  }, [slug]);

  const handleAddToCart = (item: MenuItem) => {
    const existingItem = cart.find((c) => c.menuItemId === item.id);
    const newQty = (cartQuantities[item.id] || 0) + 1;

    if (existingItem) {
      setCart(
        cart.map((c) =>
          c.menuItemId === item.id ? { ...c, quantity: newQty } : c
        )
      );
    } else {
      setCart([
        ...cart,
        {
          menuItemId: item.id,
          name: item.name,
          priceCents: item.priceCents,
          quantity: newQty,
        },
      ]);
    }

    setCartQuantities({
      ...cartQuantities,
      [item.id]: newQty,
    });
  };

  const handleRemoveFromCart = (itemId: string) => {
    const currentQty = cartQuantities[itemId] || 0;
    const newQty = Math.max(0, currentQty - 1);

    if (newQty === 0) {
      setCart(cart.filter((c) => c.menuItemId !== itemId));
      const newQties = { ...cartQuantities };
      delete newQties[itemId];
      setCartQuantities(newQties);
    } else {
      setCart(
        cart.map((c) =>
          c.menuItemId === itemId ? { ...c, quantity: newQty } : c
        )
      );
      setCartQuantities({
        ...cartQuantities,
        [itemId]: newQty,
      });
    }
  };

  const handleUpdateQuantity = (menuItemId: string, quantity: number) => {
    if (quantity <= 0) {
      setCart(cart.filter((c) => c.menuItemId !== menuItemId));
      const newQties = { ...cartQuantities };
      delete newQties[menuItemId];
      setCartQuantities(newQties);
    } else {
      setCart(
        cart.map((c) =>
          c.menuItemId === menuItemId ? { ...c, quantity } : c
        )
      );
      setCartQuantities({
        ...cartQuantities,
        [menuItemId]: quantity,
      });
    }
  };

  const handleCheckout = async (
    phoneE164: string,
    consentCall: boolean,
    consentSms: boolean,
    tipCents: number
  ) => {
    if (!store) return;

    setCheckoutLoading(true);
    setError('');

    try {
      const cartItems = cart.map((c) => ({
        menuItemId: c.menuItemId,
        quantity: c.quantity,
      }));

      const result = await createCheckoutSession({
        storeId: store.id,
        cartItems,
        phoneE164,
        consentCall,
        consentSms,
        tipCents,
      });

      if (result.sessionUrl) {
        window.location.href = result.sessionUrl;
      }
    } catch (err: any) {
      setError(err.message);
      setCheckoutLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-red-50">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-300 border-t-orange-600" />
          </div>
          <p className="text-xl font-semibold text-gray-700">Loading menu...</p>
        </div>
      </div>
    );
  }

  if (error && !store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md rounded-lg bg-white p-6 shadow-lg">
          <p className="text-xl font-bold text-red-600 mb-4">{error}</p>
          <a href="/" className="inline-block rounded-lg bg-orange-500 px-6 py-2 font-semibold text-white hover:bg-orange-600 transition-colors">
            Go back home
          </a>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-orange-50">
        <p className="text-xl font-semibold text-gray-600">Store not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-40 border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
                {store.name}
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {store.itemCount} items available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-orange-100 px-3 py-1">
                <span className="text-sm font-semibold text-orange-700">
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      <div className="flex">
        {/* Menu Section */}
        <div className="flex-1">
          <MenuDisplay
            categories={store.categories}
            onAddToCart={handleAddToCart}
            onRemoveFromCart={handleRemoveFromCart}
            cartItems={cartQuantities}
          />
        </div>

        {/* Cart Sidebar - Sticky on desktop */}
        {cart.length > 0 && (
          <div className="hidden lg:block w-80 border-l border-gray-200 bg-white">
            <div className="sticky top-24 p-6">
              <Cart
                items={cart}
                onUpdateQuantity={handleUpdateQuantity}
                onCheckout={handleCheckout}
                isLoading={checkoutLoading}
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cart - Fixed at bottom */}
      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 border-t border-gray-200 bg-white p-4 shadow-xl lg:hidden">
          <Cart
            items={cart}
            onUpdateQuantity={handleUpdateQuantity}
            onCheckout={handleCheckout}
            isLoading={checkoutLoading}
          />
        </div>
      )}

      {/* Bottom padding for mobile */}
      {cart.length > 0 && <div className="h-24 lg:hidden" />}
    </div>
  );
}
