import AppError from "@shared/errors/AppError.js";
import type { UsersRepository } from "../domain/users.repository.js";
import type { GetSimpleUser } from "../domain/user.entity.js";

export class LookupUserByEmailUseCase {
    constructor(private readonly usersRepository: UsersRepository) {}

    async execute(email: string): Promise<GetSimpleUser> {
        const user = await this.usersRepository.findByEmail(email);

        if (!user || !user.isActive) {
            throw new AppError("Usuario no encontrado", "USER_NOT_FOUND", 404);
        }

        return {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            avatarUrl: user.avatarUrl ?? null,
            isActive: user.isActive,
            isVerify: user.isVerify,
        };
    }
}
