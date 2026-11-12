import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { incomesController } from "../incomes.module.js";
import { incomeIdParamSchema, updateIncomeSchema } from "./validators/income.schema.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.put(
    "/:incomeId",
    validatedMiddleware.validateParams(incomeIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(updateIncomeSchema),
    incomesController.update
);

router.delete(
    "/:incomeId",
    validatedMiddleware.validateParams(incomeIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    incomesController.delete
);

export default router;
