import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { getKitchenQueueController, updateOrderItemStatusController, cancelOrderItemController } from "../controllers/order.controller";

const router = Router();

router.use(requireAuth, requireRole("chef", "admin"));

router.get("/order-items", getKitchenQueueController);
router.patch("/order-items/:id/status", updateOrderItemStatusController);
router.post("/order-items/:id/cancel", cancelOrderItemController);

export default router;