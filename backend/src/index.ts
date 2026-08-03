import express from "express";
import dotenv from "dotenv";
import menuRoutes from "./routes/menu.routes";
import authRoutes from "./routes/auth.routes";
import sessionRoutes from "./routes/session.routes";

dotenv.config();

const app = express();
app.use(express.json());

app.get("/health", (_req,res) => {
    res.json({ success: true, data: { status: "ok" } });
})

app.use("/api/v1/menu", menuRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/sessions", sessionRoutes);

const PORT = process.env.PORT ?? 4000;
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});