import { useState } from "react";
import { Login } from "./components/Login";
import { MenuList } from "./components/MenuList";
import { KitchenQueue } from "./components/KitchenQueue";
import { StaffDashboard } from "./components/StaffDashboard";
import { useSession } from "./hooks/useSession";
import { ScanQr } from "./components/ScanQr";
import { CustomerOrder } from "./components/CustomerOrder";
import { AdminMenu } from "./components/AdminMenu";
import { AdminReports } from "./components/AdminReports";
import { AdminTables } from "./components/AdminTables";
import { AdminUsers } from "./components/AdminUsers";
import { SplitBill } from "./components/SplitBill";
import { useEffect } from "react";
import { api } from "./api/client";
import type { User } from "./types";
import "./App.css";

type Tab = "menu" | "customer" | "kitchen" | "staff" | "splitBill" | "admin" | "adminReports" | "adminTables" | "adminUsers";

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const { sessionToken, tableNumber, saveSession, clearSession } = useSession();
  const [tab, setTab] = useState<Tab>("menu");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setCheckingAuth(false);
      return;
    }
    api.get("/auth/me").then((res) => setUser(res.data.data)).catch(() => {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    }).finally(() => setCheckingAuth(false));
  }, []);

  function handleLogout() {
    api.post("/auth/logout").catch(() => {});
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    setUser(null);
  }

  return (
    <div className="app-shell">
      {checkingAuth ? (
        <p className="muted" style={{ padding: 40, textAlign: "center" }}>กำลังตรวจสอบสถานะ...</p>
      ) : (
        <>
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
            <button className={tab === "customer" ? "active" : ""} onClick={() => setTab("customer")}>
              ลูกค้าจำลอง
            </button>
            <button className={tab === "kitchen" ? "active" : ""} onClick={() => setTab("kitchen")}>
              ครัว (ต้อง Login)
            </button>
            <button className={tab === "staff" ? "active" : ""} onClick={() => setTab("staff")}>
              พนักงาน (ต้อง Login)
            </button>
            <button className={tab === "splitBill" ? "active" : ""} onClick={() => setTab("splitBill")}>
              แยกบิล
            </button>
            <button className={tab === "admin" ? "active" : ""} onClick={() => setTab("admin")}>
              แอดมิน (ต้อง Login)
            </button>
            <button className={tab === "adminReports" ? "active" : ""} onClick={() => setTab("adminReports")}>
              รายงานยอดขาย
            </button>
            <button className={tab === "adminTables" ? "active" : ""} onClick={() => setTab("adminTables")}>
              จัดการโต๊ะ
            </button>
            <button className={tab === "adminUsers" ? "active" : ""} onClick={() => setTab("adminUsers")}>
              จัดการพนักงาน
            </button>
          </nav>

          <main className="app-main">
            {tab === "menu" && <MenuList />}
            {tab === "customer" && (
              sessionToken && tableNumber
                ? <CustomerOrder tableNumber={tableNumber} sessionToken={sessionToken} onSessionExpired={clearSession} />
                : <ScanQr onScanned={saveSession} />
            )}
            {tab === "kitchen" && (user ? <KitchenQueue /> : <Login onLoginSuccess={setUser} />)}
            {tab === "staff" && (user ? <StaffDashboard /> : <Login onLoginSuccess={setUser} />)}
            {tab === "splitBill" && (user ? <SplitBill /> : <Login onLoginSuccess={setUser} />)}
            {tab === "admin" && (user ? <AdminMenu /> : <Login onLoginSuccess={setUser} />)}
            {tab === "adminReports" && (user ? <AdminReports /> : <Login onLoginSuccess={setUser} />)}
            {tab === "adminTables" && (user ? <AdminTables /> : <Login onLoginSuccess={setUser} />)}
            {tab === "adminUsers" && (user ? <AdminUsers /> : <Login onLoginSuccess={setUser} />)}
          </main>
        </>
      )}
    </div>
  );
}

export default App;