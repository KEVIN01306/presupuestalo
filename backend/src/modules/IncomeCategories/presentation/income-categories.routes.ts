import { Router } from "express";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { incomeCategoriesController } from "../income-categories.module.js";
import {
    categoryIdParamSchema,
    createIncomeCategorySchema,
    teamCategoryParamSchema,
    updateIncomeCategorySchema,
} from "./validators/income-category.schema.js";

const router = Router({ mergeParams: true });
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

router.use(authMiddleware.protegerRuta);

router.get(
    "/",
    validatedMiddleware.validateParams(teamCategoryParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR", "VIEWER"]),
    incomeCategoriesController.list
);

router.post(
    "/",
    validatedMiddleware.validateParams(teamCategoryParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(createIncomeCategorySchema),
    incomeCategoriesController.create
);

router.put(
    "/:categoryId",
    validatedMiddleware.validateParams(categoryIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    validatedMiddleware.validateBody(updateIncomeCategorySchema),
    incomeCategoriesController.update
);

router.delete(
    "/:categoryId",
    validatedMiddleware.validateParams(categoryIdParamSchema),
    authMiddleware.verifyTeamRole(["OWNER", "EDITOR"]),
    incomeCategoriesController.delete
);

export default router;
