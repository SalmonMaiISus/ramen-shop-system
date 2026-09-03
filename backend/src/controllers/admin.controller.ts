import { Request, Response } from "express";
import {
    createMenuItem,
    getAllCategories,
    toggleMenuItemAvailability,
    updateMenuItem,
    hideMenuItem,
    MenuItemNotFoundErrorAdmin,
    createOptionGroup,
    deleteOptionGroup,
    createOption,
    deleteOption,
    createCategory,
    updateCategory,
    deleteCategory,
    CategoryNotFoundError,
    updateOptionGroup,
    updateOption, 
} from "../services/menu.service";
import { 
    createMenuItemSchema, 
    toggleAvailabilitySchema, 
    updateMenuItemSchema, 
    createOptionGroupSchema, 
    createOptionSchema,
    createCategorySchema,
    updateCategorySchema, 
    updateOptionGroupSchema,
    updateOptionSchema, 
} from "../utils/validators";

export async function createMenuItemController(req: Request, res: Response) {
    const parsed = createMenuItemSchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request body",
                details: parsed.error.flatten(),
            },
        });
    }

    try {
        const menuItem = await createMenuItem(parsed.data);
        res.status(201).json({ success: true, data: menuItem });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Failed to create menu item" },
        });
    }
}

export async function getCategoriesController(_req: Request, res: Response) {
    const categories = await getAllCategories();
    res.json({ success: true, data: categories });
}

export async function toggleAvailabilityController(req: Request, res: Response) {
    const parsed = toggleAvailabilitySchema.safeParse(req.body);

    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "isAvailable must be boolean" },
        });
    }

    const menuItemId = Number(req.params.id);
    const menuItem = await toggleMenuItemAvailability(menuItemId, parsed.data.isAvailable);
    res.json({ success: true, data: menuItem });
}

export async function updateMenuItemController(req: Request, res: Response) {
    const parsed = updateMenuItemSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid update data" },
        });
    }

    const menuItemId = Number(req.params.id);
    try {
        const updated = await updateMenuItem(menuItemId, parsed.data);
        res.json({ success: true, data: updated });
    } catch (error) {
        if (error instanceof MenuItemNotFoundErrorAdmin) {
            return res.status(404).json({
                success: false,
                error: { code: "MENU_ITEM_NOT_FOUND", message: "Menu item not found" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function deleteMenuItemController(req: Request, res: Response) {
    const menuItemId = Number(req.params.id);
    try {
        await hideMenuItem(menuItemId);
        res.json({ success: true, data: null });
    } catch (error) {
        if (error instanceof MenuItemNotFoundErrorAdmin) {
            return res.status(404).json({
                success: false,
                error: { code: "MENU_ITEM_NOT_FOUND", message: "Menu item not found" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function createOptionGroupController(req: Request, res: Response) {
    const parsed = createOptionGroupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid option group data" },
        });
    }
    const group = await createOptionGroup(parsed.data);
    res.status(201).json({ success: true, data: group });
}

export async function deleteOptionGroupController(req: Request, res: Response) {
    const id = Number(req.params.id);
    await deleteOptionGroup(id);
    res.json({ success: true, data: null });
}

export async function createOptionController(req: Request, res: Response) {
    const parsed = createOptionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid option data" },
        });
    }
    const option = await createOption(parsed.data);
    res.status(201).json({ success: true, data: option });
}

export async function deleteOptionController(req: Request, res: Response) {
    const id = Number(req.params.id);
    await deleteOption(id);
    res.json({ success: true, data: null });
}

export async function createCategoryController(req: Request, res: Response) {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Category name is required" },
        });
    }
    const category = await createCategory(parsed.data.name, parsed.data.displayOrder ?? 0);
    res.status(201).json({ success: true, data: category });
}

export async function updateCategoryController(req: Request, res: Response) {
    const parsed = updateCategorySchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid category data" },
        });
    }

    const categoryId = Number(req.params.id);
    try {
        const category = await updateCategory(categoryId, parsed.data.name, parsed.data.displayOrder);
        res.json({ success: true, data: category });
    } catch (error) {
        if (error instanceof CategoryNotFoundError) {
            return res.status(404).json({
                success: false,
                error: { code: "CATEGORY_NOT_FOUND", message: "Category not found" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function deleteCategoryController(req: Request, res: Response) {
    const categoryId = Number(req.params.id);
    try {
        await deleteCategory(categoryId);
        res.json({ success: true, data: null });
    } catch (error: any) {
        res.status(400).json({
            success: false,
            error: { code: "CATEGORY_IN_USE", message: error.message ?? "Cannot delete this category" },
        });
    }
}

export async function updateOptionGroupController(req: Request, res: Response) {
    const parsed = updateOptionGroupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid option group data" },
        });
    }
    const group = await updateOptionGroup(Number(req.params.id), parsed.data);
    res.json({ success: true, data: group });
}

export async function updateOptionController(req: Request, res: Response) {
    const parsed = updateOptionSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(422).json({
            success: false,
            error: { code: "VALIDATION_ERROR", message: "Invalid option data" },
        });
    }
    const option = await updateOption(Number(req.params.id), parsed.data);
    res.json({ success: true, data: option });
}