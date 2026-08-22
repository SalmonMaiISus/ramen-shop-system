import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
    getPendingBillsController,
    markBillComingController,
    markBillPaidController,
    getServingItemsController,
    markServedController,
    getUnnotifiedCancellationsController,
    markCancellationNotifiedController,
    getUnassignedItemsController,
    createSplitBillController,
    forceCloseSessionController,
} from "../controllers/bill.controller";
import { getActiveSessionsController } from "../controllers/table.controller";

const router = Router();

router.use(requireAuth, requireRole("staff", "admin"));

router.get("/bills", getPendingBillsController);
router.patch("/bills/:id/coming", markBillComingController);
router.post("/bills/:id/pay", markBillPaidController);

router.get("/serving-items", getServingItemsController);
router.post("/serving-items/:id/served", markServedController);

router.get("/cancellations", getUnnotifiedCancellationsController);
router.post("/cancellations/:id/notify", markCancellationNotifiedController);

router.get("/sessions", getActiveSessionsController);
router.get("/sessions/:sessionId/unassigned-items", getUnassignedItemsController);
router.post("/sessions/:sessionId/split-bill", createSplitBillController);
router.post("/sessions/:sessionId/force-close", forceCloseSessionController);

export default router;