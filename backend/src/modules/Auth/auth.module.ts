import prisma from "@infrastructure/config/prisma/prisma.config.js";
import { PrismaAuthRespository } from "./infrastructure/prisma-auth.repository.js";
import { BcryptHashProvider } from "@shared/infrastructure/bcrypt-hash.provider.js";
import JwtProvider from "./domain/jwt.provider.js";
import { HttpOtpProvider } from "./infrastructure/http-otp.provider.js";
import { LoginUseCase } from "./application/login.usecase.js";
import { RegisterUseCase } from "./application/register.usecase.js";
import { GoogleLoginUseCase } from "./application/google-login.usecase.js";
import { LogoutUseCase } from "./application/logout.usecase.js";
import { AuthController } from "./presentation/auth.controller.js";
import { RefreshTokenUseCase } from "./application/refresh-token.usecase.js";
import { GetProfileUseCase } from "./application/get-profile.usecase.js";
import { SendOtpUseCase } from "./application/send-otp.usecase.js";
import { VerifyOtpUseCase } from "./application/verify-otp.usecase.js";
import { ResetPasswordWithOtpUseCase } from "./application/reset-password-with-otp.usecase.js";
import { auditLogService } from "../Audit/audit.module.js";
import { usersRepository } from "../Users/users.module.js";

const authRepository = new PrismaAuthRespository(prisma);
const hashProvider = new BcryptHashProvider();
const jwtProvider = new JwtProvider();
const otpProvider = new HttpOtpProvider();

const loginUseCase = new LoginUseCase(authRepository, jwtProvider, hashProvider, auditLogService);
const registerUseCase = new RegisterUseCase(authRepository, jwtProvider, hashProvider, auditLogService);
const googleLoginUseCase = new GoogleLoginUseCase(authRepository, jwtProvider, auditLogService);
const logoutUseCase = new LogoutUseCase(authRepository, auditLogService);
const refreshTokenUseCase = new RefreshTokenUseCase(authRepository, jwtProvider);
const getProfileUseCase = new GetProfileUseCase(authRepository);
const sendOtpUseCase = new SendOtpUseCase(otpProvider, usersRepository, auditLogService);
const verifyOtpUseCase = new VerifyOtpUseCase(otpProvider, jwtProvider, usersRepository, auditLogService);
const resetPasswordWithOtpUseCase = new ResetPasswordWithOtpUseCase(
    jwtProvider,
    usersRepository,
    authRepository,
    hashProvider,
    auditLogService
);

export const authController = new AuthController(
    loginUseCase,
    refreshTokenUseCase,
    getProfileUseCase,
    logoutUseCase,
    registerUseCase,
    googleLoginUseCase,
    sendOtpUseCase,
    verifyOtpUseCase,
    resetPasswordWithOtpUseCase
);
