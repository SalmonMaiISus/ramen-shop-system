import { useState } from "react";
import { X } from "lucide-react";
import type { MenuItem } from "../type";

interface OrderOptionsModalProps {
    menuItem: MenuItem;
    onConfirm: (selectedOptionIds: number[], optionsLabel: string, specialNotes: string) => void;
    onCancel: () => void;
}

export function OrderOptionsModal({ menuItem, onConfirm, onCancel }: OrderOptionsModalProps) {
    const [selections, setSelections] = useState<Record<number, number[]>>({});
    const [specialNotes, setSpecialNotes] = useState("");

    function handleSingle(groupId: number, optionId: number) {
        setSelections((prev) => ({ ...prev, [groupId]: [optionId] }));
    }

    function handleMulti(groupId: number, optionId: number) {
        setSelections((prev) => {
            const current = prev[groupId] ?? [];
            return {
                ...prev,
                [groupId]: current.includes(optionId)
                    ? current.filter((id) => id !== optionId)
                    : [...current, optionId],
            };
        });
    }

    const allRequiredSelected = menuItem.optionGroups
        .filter((g) => g.isRequired)
        .every((g) => (selections[g.id]?.length ?? 0) > 0);

    const selectedIds = Object.values(selections).flat();
    const allOptions = menuItem.optionGroups.flatMap((g) => g.options);
    const selectedOptions = allOptions.filter((o) => selectedIds.includes(o.id));
    const extraTotal = selectedOptions.reduce((sum, o) => sum + Number(o.extraPrice), 0);
    const total = Number(menuItem.basePrice) + extraTotal;
    const optionsLabel = selectedOptions.map((o) => o.name).join(", ");

    return (
        <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[100]" onClick={onCancel}>
            <div
                className="bg-surface rounded-t-3xl sm:rounded-2xl p-5 max-w-md w-full max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-semibold">{menuItem.name}</h3>
                    <button onClick={onCancel} className="icon-btn"><X size={16} /></button>
                </div>

                {menuItem.optionGroups.map((group) => (
                    <div key={group.id} className="mb-4">
                        <div className="flex justify-between text-sm font-semibold mb-2">
                            <span>{group.name}</span>
                            {group.isRequired && <span className="text-accent text-xs font-normal">ต้องเลือก</span>}
                        </div>
                        {group.options.map((opt) => {
                            const isSelected = (selections[group.id] ?? []).includes(opt.id);
                            return (
                                <label
                                    key={opt.id}
                                    className={`flex items-center gap-2 py-2.5 px-3 rounded-xl mb-1.5 cursor-pointer border transition-colors ${isSelected ? "border-accent bg-accentSoft" : "border-border"
                                        }`}
                                >
                                    <input
                                        type={group.selectionType === "single" ? "radio" : "checkbox"}
                                        name={`g-${group.id}`}
                                        checked={isSelected}
                                        onChange={() =>
                                            group.selectionType === "single" ? handleSingle(group.id, opt.id) : handleMulti(group.id, opt.id)
                                        }
                                        className="accent-[var(--color-accent)]"
                                    />
                                    <span className="flex-1 text-sm">{opt.name}</span>
                                    {Number(opt.extraPrice) > 0 && (
                                        <span className="text-xs text-muted">+฿{opt.extraPrice}</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                ))}

                <input
                    placeholder="โน้ตเพิ่มเติม เช่น ไม่ใส่ผัก"
                    value={specialNotes}
                    onChange={(e) => setSpecialNotes(e.target.value)}
                    className="input pl-4 mb-4"
                />

                <button
                    disabled={!allRequiredSelected}
                    onClick={() => onConfirm(selectedIds, optionsLabel, specialNotes)}
                    className="w-full py-3.5 rounded-full bg-accent text-white font-semibold disabled:opacity-40 disabled:cursor-not-allowed flex justify-between px-5"
                >
                    <span>เพิ่มลงตะกร้า</span>
                    <span>฿{total.toFixed(2)}</span>
                </button>
            </div>
        </div>
    );
}