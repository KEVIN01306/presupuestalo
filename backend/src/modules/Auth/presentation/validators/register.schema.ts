import { z } from "zod";

export const RegisterSchema = z.object({
    email: z
        .string({ message: "El correo electrónico es obligatorio" })
        .trim()
        .toLowerCase()
        .email("El formato del correo electrónico no es válido"),
    password: z
        .string({ message: "La contraseña es obligatoria" })
        .min(8, "La contraseña debe tener al menos 8 caracteres")
        .max(100, "La contraseña no puede exceder 100 caracteres"),
    firstName: z
        .string({ message: "El nombre es obligatorio" })
        .trim()
        .min(1, "El nombre es obligatorio")
        .max(80, "El nombre no puede exceder 80 caracteres"),
    lastName: z
        .string({ message: "El apellido es obligatorio" })
        .trim()
        .min(1, "El apellido es obligatorio")
        .max(80, "El apellido no puede exceder 80 caracteres"),
});

export type RegisterInput = z.infer<typeof RegisterSchema>;
