import type { PaymentMethod } from "@/models/PaymentMethod";

export interface IPaymentMethodRepository {
    findAll(): Promise<PaymentMethod[]>;
}