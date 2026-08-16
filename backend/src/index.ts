import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.routes";
import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/session.routes";
import meRoutes from "./routes/me.routes";
import chefRoutes from "./routes/chef.routes";
import staffRoutes from "./routes/staff.routes";

dotenv.config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());

app.get("/health", (_req,res) => {
    res.json({ success: true, data: { status: "ok" } });
})

app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/sessions", sessionRoutes);
app.use("/api/v1/me", meRoutes);
app.use("/api/v1/chef", chefRoutes);
app.use("/api/v1/staff", staffRoutes);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});