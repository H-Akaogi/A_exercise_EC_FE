import {
    inject,
    injectable,
} from "inversify";

import { TYPES } from "@/di/types";

import type { IPaymentMethodRepository } from "@/interfaces/IPaymentMethodRepository";
import type { IPaymentMethodService } from "@/interfaces/IPaymentMethodService";
import type { PaymentMethod } from "@/models/PaymentMethod";

@injectable()
export class PaymentMethodService
    implements IPaymentMethodService {

    constructor(
        @inject(
            TYPES.IPaymentMethodRepository,
        )
        private readonly repository: IPaymentMethodRepository,
    ) { }

    public async findAll():
        Promise<PaymentMethod[]> {

        return await this.repository.findAll();
    }
}