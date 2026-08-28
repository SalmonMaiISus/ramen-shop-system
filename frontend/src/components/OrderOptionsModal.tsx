import { useState } from "react";
import type { MenuItem } from "../types";

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
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h3>{menuItem.name}</h3>

                {menuItem.optionGroups.length === 0 && (
                    <p className="muted">เมนูนี้ไม่มีตัวเลือกเพิ่มเติม</p>
                )}

                {menuItem.optionGroups.map((group) => (
                    <div key={group.id} className="option-group">
                        <div className="option-group-title">
                            <span>{group.name}</span>
                            {group.isRequired && <span className="option-group-required">* ต้องเลือก</span>}
                        </div>
                        {group.options.map((opt) => {
                            const isSelected = (selections[group.id] ?? []).includes(opt.id);
                            return (
                                <label key={opt.id} className="option-choice">
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
                                        <span className="option-choice-price">+฿{opt.extraPrice}</span>
                                    )}
                                </label>
                            );
                        })}
                    </div>
                ))}

                <div className="option-group">
                    <div className="option-group-title">
                        <span>โน้ตเพิ่มเติม (ไม่บังคับ)</span>
                    </div>
                    <input
                        placeholder="เช่น ไม่ใส่ผัก"
                        value={specialNotes}
                        onChange={(e) => setSpecialNotes(e.target.value)}
                        style={{ width: "100%", padding: 8, border: "1px solid var(--border)", borderRadius: 6 }}
                    />
                </div>

                <p style={{ fontWeight: 700, fontSize: 18, textAlign: "right", marginTop: 12 }}>
                    รวม ฿{totalPrice}
                </p>

                <div className="modal-actions">
                    <button className="btn-cancel" onClick={onCancel}>
                        ยกเลิก
                    </button>
                    <button className="btn-confirm" onClick={handleConfirm} disabled={!allRequiredSelected}>
                        ยืนยันสั่ง
                    </button>
                </div>
            </div>
        </div>
    );
}