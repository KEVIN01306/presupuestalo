import { Router } from "express";
import { auditController } from "../audit.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";

const router = Router();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/",
    auditController.list
);

router.get(
    "/:id",
    auditController.getById
);

export default router;
