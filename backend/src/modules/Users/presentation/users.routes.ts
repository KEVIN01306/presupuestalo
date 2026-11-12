import { Router } from "express";
import { usersController } from "../users.module.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import {
    CreateUserSchema,
    UpdateUserSchema,
    UpdateProfileSchema,
    LookupByEmailQuerySchema,
    UserIdSchema,
    ChangePasswordSchema,
} from "./users.schemas.js";

const router = Router();
const authMiddleware = new AuthMiddleware();
const validatedMiddleware = new ValidatedMiddleware();

// Protect all routes - requires valid JWT and active UserSession
router.use(authMiddleware.protegerRuta);

router.get("/me", usersController.getProfile);

router.put(
    "/me",
    validatedMiddleware.validateBody(UpdateProfileSchema),
    usersController.updateProfile
);

router.patch(
    "/me/password",
    validatedMiddleware.validateBody(ChangePasswordSchema),
    usersController.changePassword
);

router.get(
    "/lookup",
    validatedMiddleware.validateQuery(LookupByEmailQuerySchema),
    usersController.lookupByEmail
);

router.get("/", usersController.list);

router.post(
    "/",
    validatedMiddleware.validateBody(CreateUserSchema),
    usersController.create
);

router.put(
    "/:id",
    validatedMiddleware.validateParams(UserIdSchema),
    validatedMiddleware.validateBody(UpdateUserSchema),
    usersController.update
);

router.patch(
    "/:id/activate",
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.activate
);

router.patch(
    "/:id/disable",
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.disable
);

router.delete(
    "/:id",
    validatedMiddleware.validateParams(UserIdSchema),
    usersController.delete
);

export default router;
