export interface Operation {
    id: number;
    type: string;
    amount: number;
    date: Date;
    description: string;
    value: number;
    status: string;
    currency: string;
    market: string;
    fee: number;
    traderName: string;
    quantity: number;
    price: number;
    category: string;
    isActive: boolean;
    priority: number;
}

export interface ChangeValueOperation {
    id: number;
    value: number;
}
