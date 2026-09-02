import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";

export function Layout() {
    return (
        <div className="flex min-h-screen bg-canvas">
            <Sidebar />
            <main className="flex-1 p-6 max-w-6xl">
                <Outlet />
            </main>
        </div>
    );
}