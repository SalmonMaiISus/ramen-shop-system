import { Router } from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware";
import { upload } from "../middlewares/upload.middleware";
import { uploadImageController } from "../controllers/upload.controller";
import {
    createMenuItemController,
    getCategoriesController,
    toggleAvailabilityController,
    updateMenuItemController,
    deleteMenuItemController,
    createOptionGroupController,
    deleteOptionGroupController,
    createOptionController,
    deleteOptionController,
    createCategoryController,
    updateCategoryController,
    deleteCategoryController,
    updateOptionController,
    updateOptionGroupController, 
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
    updateTableController,
    regenerateQrController,
} from "../controllers/table.controller";
import {
    createUserController,
    getAllUsersController,
    toggleUserActiveController,
    updateUserController,
} from "../controllers/user.controller";

const router = Router();

router.use(requireAuth, requireRole("admin"));

// Menu
router.get("/categories", getCategoriesController);
router.post("/categories", createCategoryController);
router.patch("/categories/:id", updateCategoryController);
router.delete("/categories/:id", deleteCategoryController);
router.post("/menu-items", createMenuItemController);
router.patch("/menu-items/:id/availability", toggleAvailabilityController);
router.patch("/menu-items/:id", updateMenuItemController);
router.delete("/menu-items/:id", deleteMenuItemController);
router.post("/option-groups", createOptionGroupController);
router.patch("/option-groups/:id", updateOptionGroupController);
router.delete("/option-groups/:id", deleteOptionGroupController);
router.post("/options", createOptionController);
router.patch("/options/:id", updateOptionController);
router.delete("/options/:id", deleteOptionController);
router.post("/upload", upload.single("image"), uploadImageController);

// Reports
router.get("/reports/sales", getDailySalesController);
router.get("/reports/top-sellers", getTopSellersController);
router.get("/reports/cancellation-rate", getCancellationRateController);

// Tables
router.get("/tables", getAllTablesController);
router.post("/tables", createTableController);
router.patch("/tables/:id", updateTableController);
router.post("/tables/:id/regenerate-qr", regenerateQrController);
router.delete("/tables/:id", deleteTableController);

// Users
router.get("/users", getAllUsersController);
router.post("/users", createUserController);
router.patch("/users/:id", updateUserController);
router.patch("/users/:id/active", toggleUserActiveController);

export default router;