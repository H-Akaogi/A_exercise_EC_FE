import {
    inject,
    injectable,
} from "inversify";

import { TYPES } from "@/di/types";

import type {
    IOrderRepository,
} from "@/interfaces/IOrderRepository";

import type {
    IOrderService,
} from "@/interfaces/IOrderService";

import type {
    Orders,
} from "@/models/Orders";

import type {
    SearchOrdersResponse,
} from "@/models/SearchOrdersResponse";

/**
 * 注文Service
 */
@injectable()
export class OrderService
    implements IOrderService {
    constructor(
        @inject(TYPES.IOrderRepository,)
        private readonly orderRepository: IOrderRepository,
    ) { }

    /**
     * ログイン中の顧客の購入履歴を取得する
     */
    public async findPurchaseHistory():
        Promise<SearchOrdersResponse> {
        return await this.orderRepository
            .findPurchaseHistory();
    }

    /**
     * 注文UUIDから購入履歴詳細を取得する
     */
    public async findById(
        orderUuid: string,
    ): Promise<Orders> {
        return await this.orderRepository
            .findById(
                orderUuid,
            );
    }
}