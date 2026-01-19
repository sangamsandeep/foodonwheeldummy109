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
    <div className="flex justify-between items-center p-3 border-b hover:bg-gray-50 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{item.name}</p>
        {item.description && (
          <p className="text-xs text-gray-600">{item.description}</p>
        )}
      </div>
      <div className="flex items-center gap-3 ml-4">
        <p className="font-semibold text-lg text-blue-600">${priceFormatted}</p>
        <button
          onClick={onAdd}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-1 px-3 rounded transition-colors text-sm"
        >
          Add
        </button>
      </div>
    </div>
  );
}
