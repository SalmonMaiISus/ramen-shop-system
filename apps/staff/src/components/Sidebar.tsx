import { NavLink } from "react-router-dom";
import {
    ChefHat, ClipboardList, Receipt, Bell, Split, UtensilsCrossed,
    LayoutGrid, Users, BarChart3, LogOut, UtensilsCrossed as Logo,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { ThemeToggle } from "./ThemeToggle";
import { useTheme } from "../hooks/useTheme";

const NAV = [
    { to: "/kitchen", label: "ครัว", icon: ChefHat, roles: ["chef", "admin"] },
    { to: "/serving", label: "เสิร์ฟอาหาร", icon: ClipboardList, roles: ["staff", "admin"] },
    { to: "/bills", label: "เรียกเก็บเงิน", icon: Receipt, roles: ["staff", "admin"] },
    { to: "/cancellations", label: "แจ้งเตือนของหมด", icon: Bell, roles: ["staff", "admin"] },
    { to: "/split-bill", label: "แยกบิล", icon: Split, roles: ["staff", "admin"] },
    { to: "/admin/menu", label: "จัดการเมนู", icon: UtensilsCrossed, roles: ["admin"] },
    { to: "/admin/tables", label: "จัดการโต๊ะ", icon: LayoutGrid, roles: ["admin"] },
    { to: "/admin/users", label: "จัดการพนักงาน", icon: Users, roles: ["admin"] },
    { to: "/admin/reports", label: "รายงานยอดขาย", icon: BarChart3, roles: ["admin"] },
];

export function Sidebar() {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const visibleNav = NAV.filter((item) => user && item.roles.includes(user.role));

    return (
        <aside className="w-60 shrink-0 bg-surface border-r border-border flex flex-col h-screen sticky top-0">
            <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
                <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                    <Logo className="text-white" size={16} />
                </div>
                <span className="font-semibold text-sm">Ramen Staff</span>
            </div>

            <nav className="flex-1 px-2 py-3 flex flex-col gap-1 overflow-y-auto">
                {visibleNav.map(({ to, label, icon: Icon }) => (
                    <NavLink
                        key={to}
                        to={to}
                        className={({ isActive }) =>
                            `flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-colors ${isActive ? "bg-accentSoft text-accent font-semibold" : "text-muted hover:bg-canvas"
                            }`
                        }
                    >
                        <Icon size={17} />
                        {label}
                    </NavLink>
                ))}
            </nav>

            <div className="px-3 py-3 border-t border-border">
                <div className="flex items-center justify-between mb-2 px-1">
                    <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{user?.fullName}</p>
                        <p className="text-xs text-muted">{user?.role}</p>
                    </div>
                    <ThemeToggle theme={theme} onToggle={toggleTheme} />
                </div>
                <button onClick={logout} className="btn-secondary w-full">
                    <LogOut size={15} /> ออกจากระบบ
                </button>
            </div>
        </aside>
    );
}