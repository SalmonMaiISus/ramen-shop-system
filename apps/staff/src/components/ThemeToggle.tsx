import { Sun, Moon } from "lucide-react";

export function ThemeToggle({ theme, onToggle }: { theme: "light" | "dark"; onToggle: () => void }) {
    return (
        <button className="icon-btn" onClick={onToggle} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
    );
}