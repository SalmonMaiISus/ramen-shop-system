import { useState } from "react";
import type { MenuItem } from "../types";
import { inputClass } from "../ui";

interface OrderOptionsModalProps {
    menuItem: MenuItem;
    onConfirm: (selectedOptionIds: number[], specialNotes: string) => void;
    onCancel: () => void;
}

export function OrderOptionsModal({ menuItem, onConfirm, onCancel }: OrderOptionsModalProps) {
    const [selections, setSelections] = useState<Record<number, number[]>>({});
    const [specialNotes, setSpecialNotes] = useState("");

    function handleSingleSelect(groupId: number, optionId: number) {
        setSelections((prev) => ({ ...prev, [groupId]: [optionId] }));
    }

    function handleMultiToggle(groupId: number, optionId: number) {
        setSelections((prev) => {
            const current = prev[groupId] ?? [];
            const updated = current.includes(optionId)
                ? current.filter((id) => id !== optionId)
                : [...current, optionId];
            return { ...prev, [groupId]: updated };
        });
    }

    const allRequiredSelected = menuItem.optionGroups
        .filter((g) => g.isRequired)
        .every((g) => (selections[g.id]?.length ?? 0) > 0);

    const allSelectedOptionIds = Object.values(selections).flat();

    const extraTotal = menuItem.optionGroups
        .flatMap((g) => g.options)
        .filter((opt) => allSelectedOptionIds.includes(opt.id))
        .reduce((sum, opt) => sum + Number(opt.extraPrice), 0);

    const totalPrice = Number(menuItem.basePrice) + extraTotal;

    function handleConfirm() {
        if (!allRequiredSelected) return;
        onConfirm(allSelectedOptionIds, specialNotes);
    }

    return (
        <div
            className="fixed inset-0 bg-ink/50 flex items-center justify-center p-5 z-[100]"
            onClick={onCancel}
        >
            <div
                className="bg-surface rounded-2xl p-6 max-w-[420px] w-full max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                <h3 className="mt-0 mb-4 text-lg font-semibold">{menuItem.name}</h3>

                {menuItem.optionGroups.length === 0 && (
                    <p className="text-muted">เมนูนี้ไม่มีตัวเลือกเพิ่มเติม</p>
                )}

                {menuItem.optionGroups.map((group) => (
                    <div key={group.id} className="mb-4">
                        <div className="text-sm font-semibold mb-2 flex justify-between">
                            <span>{group.name}</span>
                            {group.isRequired && <span className="text-[11px] text-accent font-normal">* ต้องเลือก</span>}
                        </div>
                        {group.options.map((opt) => {
                            const isSelected = (selections[group.id] ?? []).includes(opt.id);
                            return (
                                <label key={opt.id} className="flex items-center gap-2 py-2 border-b border-border last:border-none cursor-pointer">
                                    <input
                                        type={group.selectionType === "single" ? "radio" : "checkbox"}
                                        name={`group-${group.id}`}
                                        checked={isSelected}
                                        onChange={() =>
                                            group.selectionType === "single"
                                                ? handleSingleSelect(group.id, opt.id)
                                                : handleMultiToggle(group.id, opt.id)
                                        }
                                    />
                                    <span>{opt.name}</span>
                                    {Number(opt.extraPrice) > 0 && (
                                        <span className="ml-auto text-muted text-[13px]">+฿{opt.extraPrice}</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                ))}

                <div className="mb-4">
                    <div className="text-sm font-semibold mb-2">โน้ตเพิ่มเติม (ไม่บังคับ)</div>
                    <input
                        placeholder="เช่น ไม่ใส่ผัก"
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        className={inputClass}
                    />
                </div>

                <p className="font-bold text-lg text-right mt-3">รวม ฿{totalPrice}</p>

                <div className="flex gap-2 mt-5">
                    <button
                        className="flex-1 py-3 rounded-lg border border-border bg-cream text-muted font-semibold cursor-pointer"
                        onClick={onCancel}
                    >
                        ยกเลิก
                    </button>
                    <button
                        className="flex-1 py-3 rounded-lg bg-accent text-white font-semibold cursor-pointer disabled:bg-border disabled:cursor-not-allowed"
                        onClick={handleConfirm}
                        disabled={!allRequiredSelected}
                    >
                        ยืนยันสั่ง
                    </button>
                </div>
            </div>
        </div>
    );
}