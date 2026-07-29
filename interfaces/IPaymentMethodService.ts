import type { PaymentMethod } from "@/models/PaymentMethod";

export interface IPaymentMethodService {
  findAll(): Promise<PaymentMethod[]>;
}
