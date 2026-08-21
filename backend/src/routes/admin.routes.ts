import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import {
    createMenuItemController,
    getCategoriesController,
    toggleAvailabilityController,
} from "../controllers/admin.controller";
import {
    getDailySalesController,
    getTopSellersController,
    getCancellationRateController,
} from "../controllers/report.controller";
import {
    createTableController,
    getAllTablesController,
    deleteTableController,
} from "../controllers/table.controller";
import {
    createUserController,
    getAllUsersController,
    toggleUserActiveController,
} from "../controllers/user.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

// Menu
router.get("/categories", getCategoriesController);
router.post("/menu-items", createMenuItemController);
router.patch("/menu-items/:id/availability", toggleAvailabilityController);

// Reports
router.get("/reports/sales", getDailySalesController);
router.get("/reports/top-sellers", getTopSellersController);
router.get("/reports/cancellation-rate", getCancellationRateController);

// Tables
router.get("/tables", getAllTablesController);
router.post("/tables", createTableController);
router.delete("/tables/:id", deleteTableController);

// Users
router.get("/users", getAllUsersController);
router.post("/users", createUserController);
router.patch("/users/:id/active", toggleUserActiveController);

export default router;