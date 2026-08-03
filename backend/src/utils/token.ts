import crypto from "crypto";

export function generateSessionToken(): string {
    return crypto.randomBytes(32).toString("hex");
}