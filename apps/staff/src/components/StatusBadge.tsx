const STATUS_LABEL: Record<string, string> = {
    pending: "รอทำ", cooking: "กำลังทำ", serving: "พร้อมเสิร์ฟ", served: "เสิร์ฟแล้ว",
    waiting: "รอพนักงาน", coming: "กำลังไป", paid: "จ่ายแล้ว",
    cancelled_unnotified: "ยกเลิก (ยังไม่แจ้ง)", cancelled_notified: "ยกเลิก (แจ้งแล้ว)",
    occupied: "มีลูกค้า", available: "ว่าง",
};

const STATUS_COLOR: Record<string, string> = {
    pending: "bg-accentSoft text-accent", waiting: "bg-accentSoft text-accent",
    cooking: "bg-yellow-100 text-yellow-800", coming: "bg-yellow-100 text-yellow-800",
    serving: "bg-successSoft text-success", served: "bg-successSoft text-success",
    paid: "bg-successSoft text-success", available: "bg-successSoft text-success",
    cancelled_unnotified: "bg-dangerSoft text-danger", cancelled_notified: "bg-dangerSoft text-danger",
    occupied: "bg-accentSoft text-accent",
};

export function StatusBadge({ status }: { status: string }) {
    return (
        <span className={`badge ${STATUS_COLOR[status] ?? "bg-canvas text-muted"}`}>
            { STATUS_LABEL[status] ?? status }
        </span >
    );
}