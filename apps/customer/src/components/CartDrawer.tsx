import { X, Minus, Plus, Trash2 } from "lucide-react";
import type { CartItem } from "../type";

interface CartDrawerProps {
    items: CartItem[];
    onUpdateQty: (key: string, delta: number) => void;
    onRemove: (key: string) => void;
    onClose: () => void;
    onSubmit: () => void;
    submitting: boolean;
}

export function CartDrawer({ items, onUpdateQty, onRemove, onClose, onSubmit, submitting }: CartDrawerProps) {
    const total = items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end justify-center z-[100]" onClick={onClose}>
            <div
                className="bg-surface rounded-t-3xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold">ตะกร้าของคุณ</h3>
                    <button onClick={onClose} className="icon-btn"><X size={16} /></button>
                </div>

                {items.length === 0 ? (
                    <p className="text-muted text-sm text-center py-8">ยังไม่มีรายการในตะกร้า</p>
                ) : (
                    <div className="flex flex-col gap-3 mb-4">
                        {items.map((item) => (
                            <div key={item.key} className="flex items-start gap-3 border-b border-border pb-3">
                                <div className="flex-1">
                                    <p className="text-sm font-semibold">{item.name}</p>
                                    {item.optionsLabel && <p className="text-xs text-muted">{item.optionsLabel}</p>}
                                    {item.specialNotes && <p className="text-xs text-muted italic">"{item.specialNotes}"</p>}
                                    <p className="text-success text-sm font-bold mt-1">฿{(item.unitPrice * item.quantity).toFixed(2)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => onUpdateQty(item.key, -1)} className="icon-btn w-7 h-7"><Minus size={14} /></button>
                                    <span className="text-sm w-4 text-center">{item.quantity}</span>
                                    <button onClick={() => onUpdateQty(item.key, 1)} className="icon-btn w-7 h-7"><Plus size={14} /></button>
                                    <button onClick={() => onRemove(item.key)} className="text-accent ml-1"><Trash2 size={16} /></button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {items.length > 0 && (
                    <button
                        onClick={onSubmit}
                        disabled={submitting}
                        className="w-full py-3.5 rounded-full bg-accent text-white font-semibold flex justify-between px-5 disabled:opacity-50"
                    >
                        <span>{submitting ? "กำลังส่ง..." : "ยืนยันสั่งอาหาร"}</span>
                        <span>฿{total.toFixed(2)}</span>
                    </button>
                )}
            </div>
        </div>
    );
}