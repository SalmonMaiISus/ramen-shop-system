import { UtensilsCrossed, Plus } from "lucide-react";
import type { MenuItem } from "../type";

interface ProductCardProps {
    item: MenuItem;
    onAdd: (item: MenuItem) => void;
}

export function ProductCard({ item, onAdd }: ProductCardProps) {
    return (
        <div className="card flex flex-col">
            <div className="aspect-square w-full rounded-xl overflow-hidden bg-accentSoft flex items-center justify-center mb-2">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <UtensilsCrossed className="text-accent" size={32} />
                )}
            </div>
            <h3 className="text-sm font-semibold leading-snug mb-0.5">{item.name}</h3>
            {item.description && (
                <p className="text-xs text-muted line-clamp-2 mb-1">{item.description}</p>
            )}
            <div className="flex items-center justify-between mt-auto pt-1">
                <span className="text-success font-bold text-sm">฿{Number(item.basePrice).toFixed(2)}</span>
                <button
                    disabled={!item.isAvailable}
                    onClick={() => onAdd(item)}
                    className="w-7 h-7 rounded-full bg-accent text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed"
                    aria-label="เพิ่มลงตะกร้า"
                >
                    <Plus size={16} />
                </button>
            </div>
            {!item.isAvailable && (
                <span className="text-[11px] text-accent font-medium mt-1">สินค้าหมด</span>
            )}
        </div>
    );
}