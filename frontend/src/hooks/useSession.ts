import { useState, useEffect } from "react";

export function useSession() {
    const [sessionToken, setSessionToken] = useState<string | null>(localStorage.getItem("sessionToken"));
    const [tableNumber, setTableNumber] = useState<string | null>(localStorage.getItem("tableNumber"));

    function saveSession(token: string, table: string) {
        localStorage.setItem("sessionToken", token);
        localStorage.setItem("tableNumber", table);
        setSessionToken(token);
        setTableNumber(table);
    }

    function clearSession() {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("tableNumber");
        setSessionToken(null);
        setTableNumber(null);
    }

    return { sessionToken, tableNumber, saveSession, clearSession };
}