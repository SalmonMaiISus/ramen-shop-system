import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Kitchen } from "./pages/Kitchen";
import { Serving } from "./pages/Serving";
import { Bills } from "./pages/Bills";
import { Cancellations } from "./pages/Cancellations";
import { SplitBill } from "./pages/SplitBill";
import { AdminMenu } from "./pages/AdminMenu";
import { AdminTables } from "./pages/AdminTable";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminReports } from "./pages/AdminReports";

function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted">กำลังตรวจสอบ...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function RequireRole({ roles, children }: { roles: string[]; children: React.ReactNode }) {
  const { user } = useAuth();
  if (!user || !roles.includes(user.role)) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/kitchen" element={<RequireRole roles={["chef", "admin"]}><Kitchen /></RequireRole>} />
            <Route path="/serving" element={<RequireRole roles={["staff", "admin"]}><Serving /></RequireRole>} />
            <Route path="/bills" element={<RequireRole roles={["staff", "admin"]}><Bills /></RequireRole>} />
            <Route path="/cancellations" element={<RequireRole roles={["staff", "admin"]}><Cancellations /></RequireRole>} />
            <Route path="/split-bill" element={<RequireRole roles={["staff", "admin"]}><SplitBill /></RequireRole>} />
            <Route path="/admin/menu" element={<RequireRole roles={["admin"]}><AdminMenu /></RequireRole>} />
            <Route path="/admin/tables" element={<RequireRole roles={["admin"]}><AdminTables /></RequireRole>} />
            <Route path="/admin/users" element={<RequireRole roles={["admin"]}><AdminUsers /></RequireRole>} />
            <Route path="/admin/reports" element={<RequireRole roles={["admin"]}><AdminReports /></RequireRole>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}