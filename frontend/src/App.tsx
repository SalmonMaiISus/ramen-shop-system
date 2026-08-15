import { useState } from "react";
import { Login } from "./components/Login";
import { MenuList } from "./components/MenuList";
import { KitchenQueue } from "./components/KitchenQueue";
import { StaffDashboard } from "./components/StaffDashboard";
import type { User } from "./types";
import "./App.css";

type Tab = "menu" | "kitchen" | "staff";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [tab, setTab] = useState<Tab>("menu");

  function handleLogout() {
    localStorage.removeItem("accessToken");
    setUser(null);
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>🍜 Ramen Shop <span>Dev Console</span></h1>
        {user && (
          <div className="user-badge">
            <span>{user.fullName} · {user.role}</span>
            <button className="link-button" onClick={handleLogout}>ออกจากระบบ</button>
          </div>
        )}
      </header>

      <nav className="tab-bar">
        <button className={tab === "menu" ? "active" : ""} onClick={() => setTab("menu")}>
          เมนู
        </button>
        <button className={tab === "kitchen" ? "active" : ""} onClick={() => setTab("kitchen")}>
          ครัว (ต้อง Login)
        </button>
        <button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>
          พนักงาน (ต้อง Login)
        </button>
      </nav>

      <main className="app-main">
        {tab === "menu" && <MenuList />}
        {tab === "kitchen" && (user ? <KitchenQueue /> : <Login onLoginSuccess={setUser} />)}
        {tab === "staff" && (user ? <StaffDashboard /> : <Login onLoginSuccess={setUser} />)}
      </main>
    </div>
  );
}

export default App;