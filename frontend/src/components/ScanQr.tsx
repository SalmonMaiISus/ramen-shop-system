import { useState } from "react";
import { api } from "../api/client";

interface ScanQrProps {
    onScanned: (sessionToken: string, tableNumber: string) => void;
}

export function ScanQr({ onScanned }: ScanQrProps) {
    const [qrToken, setQrToken] = useState("qr-token-a1-sample");
    const [error, setError] = useState("");

    async function handleScan() {
        setError("");
        try {
            const res = await api.post("/sessions/scan", { qrCodeToken: qrToken });
            const { sessionToken, tableNumber } = res.data.data;
            onScanned(sessionToken, tableNumber);
        } catch (err: any) {
            setError(err.response?.data?.error?.message ?? "Scan failed");
        }
    }

    return (
        <div className="login-card">
            <h2>จำลองการสแกน QR</h2>
            <p className="muted" style={{ fontSize: 13 }}>
                (ในระบบจริง ค่านี้จะมาจากกล้องสแกน QR อัตโนมัติ)
            </p>
            <label>
                QR Code Token
                <input value={qrToken} onChange={(e) => setQrToken(e.target.value)} />
            </label>
            {error && <p className="error-text">{error}</p>}
            <button onClick={handleScan}>เข้าสู่โต๊ะ</button>
        </div>
    );
}