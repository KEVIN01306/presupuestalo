import type {
    IncomeCategory,
    IncomeCategoryCreateInput,
    IncomeCategoryUpdateInput,
} from "./income-category.entity.js";

export interface IncomeCategoriesRepository {
    listByTeam(teamId: string): Promise<IncomeCategory[]>;
    findById(id: string, teamId: string): Promise<IncomeCategory | null>;
    findByName(name: string, teamId: string): Promise<IncomeCategory | null>;
    create(teamId: string, data: IncomeCategoryCreateInput): Promise<IncomeCategory>;
    update(id: string, teamId: string, data: IncomeCategoryUpdateInput): Promise<IncomeCategory>;
    delete(id: string, teamId: string): Promise<void>;
}
