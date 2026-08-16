import { Router } from "express";
import { requireSession } from "../middlewares/session.middleware";
import { createOrderItemsController } from "../controllers/order.controller";
import { requestBillController } from "../controllers/bill.controller";

const router = Router();

router.use(requireSession);

router.post("/order-items", createOrderItemsController);
router.post("/bill-requests", requestBillController);

export default router;