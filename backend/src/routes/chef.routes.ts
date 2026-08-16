import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { getKitchenQueueController, updateOrderItemStatusController } from "../controllers/order.controller";

const router = Router();

router.use(requireAuth, requireRole("chef", "admin"));

router.get("/order-items", getKitchenQueueController);
router.patch("/order-items/:id/status", updateOrderItemStatusController);

export default router;