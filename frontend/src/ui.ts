export const card = "bg-surface border border-border rounded-xl p-4";
export const cardGrid = "grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4";

export const btnDark =
    "w-full mt-2 py-2.5 px-4 rounded-lg bg-ink text-white text-sm cursor-pointer hover:opacity-85 disabled:bg-border disabled:cursor-not-allowed";

export const btnAccent =
    "w-full mt-2 py-2.5 px-4 rounded-lg bg-accent text-white text-sm font-semibold cursor-pointer hover:opacity-85";

export const btnMuted =
    "w-full mt-2 py-2.5 px-4 rounded-lg bg-muted text-white text-sm cursor-pointer hover:opacity-85";

export const btnSuccess =
    "w-full mt-2 py-2.5 px-4 rounded-lg bg-success text-white text-sm cursor-pointer hover:opacity-85";

export const btnPill =
    "px-4 py-2.5 rounded-full border border-border bg-surface text-muted text-sm cursor-pointer";

export const btnPillActive = "bg-accent border-accent text-white";

export const categoryTag =
    "text-xs text-muted bg-cream px-2.5 py-0.5 rounded-full inline-block";

export const tagBase = "text-xs px-2.5 py-0.5 rounded-full font-semibold inline-block";

export const loginCard =
    "max-w-xs mx-auto bg-surface border border-border rounded-xl p-6 flex flex-col gap-3.5";

export const inputClass = "p-2.5 border border-border rounded-lg text-sm w-full";

export const labelClass = "flex flex-col gap-1.5 text-xs text-muted";

export const priceClass = "font-bold text-accent m-0";

export const mutedClass = "text-muted";

export const errorClass = "text-red-600 text-xs m-0";

export function statusTagClass(status: string): string {
    const map: Record<string, string> = {
        pending: "bg-accentSoft text-accent",
        cooking: "bg-yellow-100 text-yellow-800",
        serving: "bg-successSoft text-success",
        served: "bg-successSoft text-success",
        waiting: "bg-accentSoft text-accent",
        coming: "bg-yellow-100 text-yellow-800",
        paid: "bg-successSoft text-success",
        cancelled_unnotified: "bg-red-100 text-red-700",
        cancelled_notified: "bg-red-50 text-red-500",
    };
    return `${tagBase} ${map[status] ?? "bg-cream text-muted"}`;
}