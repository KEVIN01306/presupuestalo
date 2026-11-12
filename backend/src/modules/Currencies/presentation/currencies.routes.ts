import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { currenciesController } from "../currencies.module.js";

const router = Router();
const authMiddleware = new AuthMiddleware();

router.use(authMiddleware.protegerRuta);

router.get("/", currenciesController.list);

export default router;
