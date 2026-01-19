'use client';

import { useState } from 'react';
import Image from 'next/image';

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

interface MenuProps {
  categories: MenuCategory;
  onAddToCart: (item: MenuItem) => void;
  onRemoveFromCart: (itemId: string) => void;
  cartItems: { [itemId: string]: number }; // itemId -> quantity
}

export default function MenuDisplay({
  categories,
  onAddToCart,
  onRemoveFromCart,
  cartItems,
}: MenuProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => new Set([...prev, itemId]));
  };

  const categoryOrder = [
    'SNACKS',
    'GRILL',
    'PANI PURI',
    'CHAT',
    'VEG APPETIZERS',
    'NON VEG APPETIZERS',
    'GOAT',
    'TIFFINS',
    'DOSA',
    'NON VEG TIFFINS',
    'IDLY',
    'RICE',
    'NOODLES',
    'POT DUM BIRYANI',
    'COOKER PULAV',
    'ENTREES',
    'SIDES',
    'BIRYANIS',
    'DESSERTS',
    'DRINKS',
  ];

  const sortedCategories = categoryOrder.filter((cat) => categories[cat]);

  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {sortedCategories.length === 0 ? (
          <div className="flex min-h-96 items-center justify-center">
            <p className="text-lg text-gray-500">No menu items available</p>
          </div>
        ) : (
          sortedCategories.map((categoryName) => (
            <div key={categoryName} className="mb-12">
              <div className="mb-6 border-b-2 border-orange-400 pb-2">
                <h2 className="text-2xl font-bold text-gray-800 sm:text-3xl">
                  {categoryName}
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  {categories[categoryName].length} items
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {categories[categoryName].map((item) => (
                  <div
                    key={item.id}
                    className="group overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-orange-300"
                  >
                    {/* Image Section */}
                    <div className="relative h-48 w-full bg-gray-200 overflow-hidden">
                      {!imageErrors.has(item.id) && item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={() => handleImageError(item.id)}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-300 to-gray-400">
                          <svg
                            className="h-12 w-12 text-gray-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-col p-4">
                      <h3 className="mb-1 line-clamp-2 text-base font-semibold text-gray-800">
                        {item.name}
                      </h3>

                      <div className="mb-4 flex items-baseline justify-between">
                        <span className="text-xl font-bold text-orange-600">
                          ₹{item.price}
                        </span>
                        {!item.isAvailable && (
                          <span className="text-xs font-medium text-red-500">
                            Not Available
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="mt-auto flex items-center gap-2">
                        {(cartItems[item.id] || 0) > 0 ? (
                          <div className="flex w-full items-center justify-between rounded-lg border border-orange-300 bg-orange-50">
                            <button
                              onClick={() => onRemoveFromCart(item.id)}
                              className="flex-1 px-2 py-2 text-center font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                              disabled={!item.isAvailable}
                            >
                              −
                            </button>
                            <span className="flex-1 text-center font-semibold text-gray-800">
                              {cartItems[item.id]}
                            </span>
                            <button
                              onClick={() => onAddToCart(item)}
                              className="flex-1 px-2 py-2 text-center font-bold text-orange-600 hover:bg-orange-100 transition-colors"
                              disabled={!item.isAvailable}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => onAddToCart(item)}
                            disabled={!item.isAvailable}
                            className="w-full rounded-lg bg-gradient-to-r from-orange-500 to-red-500 px-4 py-2 font-semibold text-white transition-all duration-200 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed hover:from-orange-600 hover:to-red-600"
                          >
                            + Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
