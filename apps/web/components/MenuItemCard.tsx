interface MenuItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string | null;
    priceCents: number;
  };
  onAdd: () => void;
}

export default function MenuItemCard({ item, onAdd }: MenuItemCardProps) {
  const priceFormatted = (item.priceCents / 100).toFixed(2);

  return (
    <div className="border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow bg-white">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{item.name}</h3>
          {item.description && (
            <p className="text-sm text-gray-600 mt-1">{item.description}</p>
          )}
        </div>
        <div className="ml-4 text-right">
          <p className="font-bold text-lg">${priceFormatted}</p>
        </div>
      </div>
      <button
        onClick={onAdd}
        className="w-full mt-3 bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Add to Cart
      </button>
    </div>
  );
}
