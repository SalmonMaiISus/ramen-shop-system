import { Server } from "socket.io";

let io: Server | null = null;

export function initSocket(server: Server) {
    io = server;
}

export function getIO(): Server {
    if (!io) throw new Error("Socket.io not initialized");
    return io;
}

export function emitOrderItemStatusChanged(sessionToken: string, orderItemId: number, status: string) {
    getIO().to(`session:${sessionToken}`).emit("order_item.status_changed", { orderItemId, status });
    getIO().to("chef-dashboard").emit("order_item.status_changed", { orderItemId, status });
    getIO().to("staff-dashboard").emit("order_item.status_changed", { orderItemId, status });
}

export function emitOrderItemCancelled(sessionToken: string, orderItemId: number, reason: string) {
    getIO().to(`session:${sessionToken}`).emit("order_item.cancelled", { orderItemId, cancelReason: reason });
    getIO().to("staff-dashboard").emit("order_item.cancelled", { orderItemId, cancelReason: reason });
}

export function emitOrderItemNotified(sessionToken: string, orderItemId: number) {
    getIO().to(`session:${sessionToken}`).emit("order_item.notified", { orderItemId });
}

export function emitBillRequested(billId: number, tableNumber: string, amount: number) {
    getIO().to("staff-dashboard").emit("bill.requested", { billId, tableNumber, amount });
}

export function emitBillStatusChanged(sessionToken: string, billId: number, status: string) {
    getIO().to(`session:${sessionToken}`).emit("bill.status_changed", { billId, status });
}

export function emitNewOrderItem() {
    getIO().to("chef-dashboard").emit("order_item.created", {});
}