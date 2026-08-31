import { useState } from "react";
import { api } from "../api/client";
import { loginCard, labelClass, inputClass, errorClass, btnAccent, mutedClass } from "../ui";

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
        <div className={loginCard}>
            <h2 className="m-0 text-lg font-semibold">จำลองการสแกน QR</h2>
            <p className={`${mutedClass} text-xs`}>(ในระบบจริง ค่านี้จะมาจากกล้องสแกน QR อัตโนมัติ)</p>
            <label className={labelClass}>
                QR Code Token
                <input className={inputClass} value={qrToken} onChange={(e) => setQrToken(e.target.value)} />
            </label>
            { error && <p className={errorClass}>{error}</p> }
            <button className={btnAccent} onClick={handleScan}>เข้าสู่โต๊ะ</button>
        </div>
    );
}