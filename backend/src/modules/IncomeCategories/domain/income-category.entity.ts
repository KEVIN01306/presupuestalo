export interface IncomeCategory {
    id: string;
    teamId: string;
    name: string;
    isSystem: boolean;
    createdAt: Date;
}

export interface IncomeCategoryCreateInput {
    name: string;
}

export interface IncomeCategoryUpdateInput {
    name: string;
}
