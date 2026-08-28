import { Request, Response} from "express";
import { login, InvalidCredentialsError, refreshAccessToken, InvalidRefreshTokenError } from "../services/auth.service";
import { loginSchema } from "../utils/validators";

export async function loginController(req: Request, res: Response) {
    const parsed = loginSchema.safeParse(req.body);

    if(!parsed.success) {
        return res.status(422).json({
            success: false,
            error: {
                code: "VALIDATION_ERROR",
                message: "Invalid request body",
                details: parsed.error.flatten(),
            }
        })
    }

    try {
        const result = await login(parsed.data.username, parsed.data.password);
        res.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof InvalidCredentialsError) {
            return res.status(401).json({
                success: false,
                error: { code: "INVALID_CREDENTIALS", message: "Invalid username or password" },
            })
        }
        console.error(error);
        res.status(500).json({
            success: false,
            error: { code: "INTERNAL_ERROR", message: "Something went wrong"},
        });
    }
}

export async function refreshController(req: Request, res: Response) {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        return res.status(400).json({
            success: false,
            error: { code: "MISSING_REFRESH_TOKEN", message: "Refresh token is required" },
        });
    }

    try {
        const result = await refreshAccessToken(refreshToken);
        res.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof InvalidRefreshTokenError) {
            return res.status(401).json({
                success: false,
                error: { code: "INVALID_REFRESH_TOKEN", message: "Refresh token invalid or expired" },
            });
        }
        res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Error" } });
    }
}

export async function logoutController(_req: Request, res: Response) {
    res.json({ success: true, data: null });
}