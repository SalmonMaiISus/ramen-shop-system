import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { createServer } from "http";
import { Server } from "socket.io";
import menuRoutes from "./routes/menu.routes";
import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/session.routes";
import meRoutes from "./routes/me.routes";
import chefRoutes from "./routes/chef.routes";
import staffRoutes from "./routes/staff.routes";
import adminRoutes from "./routes/admin.routes";
import { initSocket } from "./sockets";
import { verifyAccessToken } from "./utils/jwt";

dotenv.config();

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
    cors: { origin: "http://localhost:5173", credentials: true },
});
initSocket(io);

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_req,res) => {
    res.json({ success: true, data: { status: "ok" } });
});

app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/chef", chefRoutes);
app.use("/api/v1/staff", staffRoutes);
app.use("/api/v1/admin", adminRoutes);

io.on("connection", (socket) => {
    console.log(`[socket] connected: ${socket.id}`);

    // Customer เข้าร่วม room ของ session ตัวเอง
    socket.on("join_session", (sessionToken: string) => {
        socket.join(`session:${sessionToken}`);
    });

    // Chef เข้าร่วม dashboard room (ต้องมี valid JWT + role chef/admin)
    socket.on("join_chef_dashboard", (token: string) => {
        try {
            const payload = verifyAccessToken(token);
            if (payload.role === "chef" || payload.role === "admin") {
                socket.join("chef-dashboard");
            }
        } catch {
            // token ไม่ถูกต้อง ไม่ join
        }
    });

    // Staff เข้าร่วม dashboard room
    socket.on("join_staff_dashboard", (token: string) => {
        try {
            const payload = verifyAccessToken(token);
            if (payload.role === "staff" || payload.role === "admin") {
                socket.join("staff-dashboard");
            }
        } catch {
        // token ไม่ถูกต้อง ไม่ join
        }
    });

    socket.on("disconnect", () => {
        console.log(`[socket] disconnected: ${socket.id}`);
    });
});

const PORT = process.env.PORT ?? 4000;
httpServer.listen(Number(PORT), () => {
    console.log(`Server running at http://localhost:${PORT}`);
});