import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { getKitchenQueueController, updateOrderItemStatusController, cancelOrderItemController, updateQueuePositionController } from "../controllers/order.controller";

const router = Router();

router.use(requireAuth, requireRole("chef", "admin"));

router.get("/order-items", getKitchenQueueController);
router.patch("/order-items/:id/status", updateOrderItemStatusController);
router.post("/order-items/:id/cancel", cancelOrderItemController);
router.patch("/order-items/:id/queue-position", updateQueuePositionController);

export default router;

// Account: Chef
// Password: Abcd1234