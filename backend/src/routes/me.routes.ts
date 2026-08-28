import { Router } from "express";
import { requireSession } from "../middlewares/session.middleware";
import { createOrderItemsController, getMyOrderItemsController } from "../controllers/order.controller";
import { requestBillController, getMyBillController } from "../controllers/bill.controller";

const router = Router();

router.use(requireSession);

router.get("/order-items", getMyOrderItemsController);
router.post("/order-items", createOrderItemsController);
router.post("/bill-requests", requestBillController);
router.get("/bill", getMyBillController);

export default router;