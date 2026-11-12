import { Router } from "express";
import { authController } from "../auth.module.js";
import { ValidatedMiddleware } from "@app/middleware/Validated.middleware.js";
import { loginSchema } from "./validators/login.schema.js";
import { RegisterSchema } from "./validators/register.schema.js";
import { GoogleLoginSchema } from "./validators/google-login.schema.js";
import { SendOtpSchema, VerifyOtpSchema, ResetPasswordSchema } from "./validators/otp.schemas.js";
import { AuthMiddleware } from "@app/middleware/Auth.middleware.js";

const validatedMiddleware = new ValidatedMiddleware();
const authMiddleware = new AuthMiddleware();

const router = Router();

router.post(
    "/register",
    validatedMiddleware.validateBody(RegisterSchema),
    authController.register
);

router.post(
    "/google",
    validatedMiddleware.validateBody(GoogleLoginSchema),
    authController.googleLogin
);

router.post(
    "/login",
    validatedMiddleware.validateBody(loginSchema),
    authController.login
);

router.post(
    "/refresh",
    authController.refresh
);

router.post(
    "/logout",
    authMiddleware.protegerRuta,
    authController.logout
);

router.get(
    "/me",
    authMiddleware.protegerRuta,
    authController.getProfile
);

// ── Password Reset via OTP routes ───────────────────────────────────────────
router.post(
    "/otp/send",
    validatedMiddleware.validateBody(SendOtpSchema),
    authController.sendOtp
);

router.post(
    "/otp/verify",
    validatedMiddleware.validateBody(VerifyOtpSchema),
    authController.verifyOtp
);

router.post(
    "/reset-password",
    validatedMiddleware.validateBody(ResetPasswordSchema),
    authController.resetPassword
);

export default router;
