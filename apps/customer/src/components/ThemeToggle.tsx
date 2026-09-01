import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
    theme: "light" | "dark";
    onToggle: () => void;
}

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
    return (
        <button className="icon-btn" onClick={onToggle} aria-label="Toggle theme">
            {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
        </button>
    );
}