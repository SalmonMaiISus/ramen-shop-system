import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
    getPendingBillsController,
    markBillComingController,
    markBillPaidController,
    getServingItemsController,
    markServedController,
} from "../controllers/bill.controller";

const router = Router();

router.use(requireAuth, requireRole("staff", "admin"));

router.get("/bills", getPendingBillsController);
router.patch("/bills/:id/coming", markBillComingController);
router.post("/bills/:id/pay", markBillPaidController);

router.get("/serving-items", getServingItemsController);
router.post("/serving-items/:id/served", markServedController);

export default router;