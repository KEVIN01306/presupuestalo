import bcrypt from "bcryptjs";
import argon2 from "argon2";
import type { HashProvider } from "../domain/hash.provider.js";

export class BcryptHashProvider implements HashProvider {
    private readonly saltRounds = 10;

    async hash(payload: string): Promise<string> {
        return bcrypt.hash(payload, this.saltRounds);
    }

    async compare(payload: string, hashed: string): Promise<boolean> {
        const plainValue = payload.trim();
        const storedValue = hashed.trim();

        if (!storedValue) {
            return false;
        }

        // Backward compatibility for any legacy argon2 hashes
        if (storedValue.startsWith("$argon2")) {
            try {
                return await argon2.verify(storedValue, plainValue);
            } catch {
                return false;
            }
        }

        if (!storedValue.startsWith("$2")) {
            return storedValue === plainValue;
        }

        try {
            return await bcrypt.compare(plainValue, storedValue);
        } catch {
            return false;
        }
    }
}
