import { z } from "zod";

export const GoogleLoginSchema = z.object({
    idToken: z
        .string({ message: "El token de Google es obligatorio" })
        .trim()
        .min(1, "El token de Google es obligatorio"),
});

export type GoogleLoginInput = z.infer<typeof GoogleLoginSchema>;
