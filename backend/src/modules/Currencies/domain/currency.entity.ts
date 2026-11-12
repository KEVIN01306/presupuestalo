export interface Currency {
    id: string;
    code: string;
    name: string;
    symbol: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}

export interface CurrencySummary {
    id: string;
    code: string;
    name: string;
    symbol: string;
}
