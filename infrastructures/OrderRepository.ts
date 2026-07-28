import {
    inject,
    injectable,
} from "inversify";

import { TYPES } from "@/di/types";

import type {
    ICustomerAuthService,
} from "@/interfaces/ICustomerAuthService";

import type {
    IOrderRepository,
} from "@/interfaces/IOrderRepository";

import type {
    Orders,
} from "@/models/Orders";

import type {
    SearchOrdersResponse,
} from "@/models/SearchOrdersResponse";

/**
 * 注文Repository
 */
@injectable()
export class OrderRepository
    implements IOrderRepository {
    constructor(
        @inject(
            TYPES.ICustomerAuthService,
        )
        private readonly customerAuthService:
            ICustomerAuthService,
    ) { }

    /**
     * ログイン中の顧客の購入履歴を取得する
     *
     * @returns 購入履歴一覧
     */
    public async findPurchaseHistory():
        Promise<SearchOrdersResponse> {
        const url =
            "/proxy-api/purchase/history";

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers:
                        this.createHeaders(),
                    credentials:
                        "include",
                    cache:
                        "no-store",
                },
            );

        /*
         * 未ログインまたは認証期限切れ。
         */
        if (response.status === 401) {
            this.customerAuthService
                .clearAuthentication();

            throw new Error(
                "購入履歴を確認するにはログインが必要です",
            );
        }

        if (!response.ok) {
            const errorData =
                await response.json()
                    .catch(
                        () => ({}),
                    ) as {
                        message?: string;
                        detail?: string;
                        title?: string;
                        errors?: Record<
                            string,
                            string[] | string
                        >;
                    };

            console.error(
                "========== PURCHASE HISTORY API ERROR ==========",
            );
            console.error(
                "url:",
                url,
            );
            console.error(
                "status:",
                response.status,
            );
            console.error(
                "error body:",
                errorData,
            );
            console.error(
                "================================================",
            );

            if (errorData.errors) {
                const messages =
                    Object.values(
                        errorData.errors,
                    )
                        .flat()
                        .join("\n");

                throw new Error(
                    messages,
                );
            }

            throw new Error(
                errorData.message
                ?? errorData.detail
                ?? errorData.title
                ?? `購入履歴の取得に失敗しました (Status: ${response.status})`,
            );
        }

        const responseData =
            (await response.json()) as {
                orderList: {
                    orderUuid: string;
                    orderDate: string;
                    orderStatus: string;
                    totalPrice: number;
                    detailUrl: string;
                }[];
                message: string | null;
            };

        return {
            title:
                "購入履歴",
            orderList:
                responseData.orderList.map(
                    (order) => ({
                        orderUuid:
                            order.orderUuid,
                        orderDate:
                            order.orderDate,
                        orderStatus:
                            order.orderStatus,
                        totalPrice:
                            order.totalPrice,
                        detailUrl:
                            order.detailUrl,
                    }),
                ),
            message:
                responseData.message,
        };
    }

    /**
   * 注文UUIDから購入履歴詳細を取得する
   *
   * @param orderUuid 注文UUID
   * @returns 注文詳細
   */
    public async findById(
        orderUuid: string,
    ): Promise<Orders> {
        const url =
            `/proxy-api/purchase/history/${encodeURIComponent(orderUuid)}`;

        const response =
            await fetch(
                url,
                {
                    method: "GET",
                    headers:
                        this.createHeaders(),
                    credentials: "include",
                    cache: "no-store",
                },
            );

        /*
         * 未ログインまたは認証期限切れ。
         */
        if (response.status === 401) {
            this.customerAuthService
                .clearAuthentication();

            throw new Error(
                "購入履歴の詳細を確認するにはログインが必要です",
            );
        }

        /*
         * 指定した注文が存在しない。
         */
        if (response.status === 404) {
            throw new Error(
                "指定された購入履歴が見つかりませんでした",
            );
        }

        if (!response.ok) {
            const errorData =
                await response
                    .json()
                    .catch(
                        () => ({}),
                    ) as {
                        message?: string;
                        detail?: string;
                        title?: string;
                        errors?: Record<
                            string,
                            string[] | string
                        >;
                    };

            console.error(
                "========== PURCHASE HISTORY DETAIL API ERROR ==========",
            );
            console.error(
                "url:",
                url,
            );
            console.error(
                "status:",
                response.status,
            );
            console.error(
                "error body:",
                errorData,
            );
            console.error(
                "=======================================================",
            );

            if (errorData.errors) {
                const messages =
                    Object.values(
                        errorData.errors,
                    )
                        .flat()
                        .join("\n");

                throw new Error(
                    messages,
                );
            }

            throw new Error(
                errorData.message
                ?? errorData.detail
                ?? errorData.title
                ?? `購入履歴詳細の取得に失敗しました (Status: ${response.status})`,
            );
        }

        /*
         * バックエンドAPIから返されるレスポンス。
         */
        const responseData =
            (await response.json()) as {
                orderUuid: string;
                orderDate: string;
                orderStatusId: number;
                orderStatusName: string;
                orderItems: {
                    productUuid: string;
                    productName: string;
                    price: number;
                    quantity: number;
                    subtotal: number;
                }[];
                totalPrice: number;
            };

        /*
         * APIレスポンスをフロントのOrdersモデルへ変換する。
         */
        return {
            orderUuid:
                responseData.orderUuid,

            orderDate:
                responseData.orderDate,

            amountTotal:
                responseData.totalPrice,

            orderStatus: {
                id: responseData.orderStatusId,

                name:
                    responseData.orderStatusName,
            },

            ordersDetails:
                responseData.orderItems.map(
                    (
                        item,
                        index,
                    ) => ({
                        /*
                         * APIから注文明細IDは返らないため、
                         * 画面表示用の連番を設定する。
                         */
                        id:
                            index + 1,

                        product: {
                            productUuid:
                                item.productUuid,

                            name:
                                item.productName,

                            /*
                             * APIのpriceは購入時の商品単価。
                             */
                            price:
                                item.price,

                            /*
                             * 詳細APIから返らない項目は、
                             * Productモデルの型に合わせて補う。
                             */
                            imageUrl:
                                null,

                            productCategory:
                                null,

                            productStock:
                                null,

                            deleteFlg:
                                0,
                        },

                        /*
                         * 購入数量。
                         */
                        count:
                            item.quantity,

                        /*
                         * 購入時の商品単価。
                         */
                        price:
                            item.price,

                        /*
                         * 商品ごとの小計。
                         */
                        subtotal:
                            item.subtotal,
                    }),
                ),
        };
    }

    /**
     * 有効な顧客JWTがある場合のみBearerヘッダーを付与する。
     */
    private createHeaders():
        Record<string, string> {
        const accessToken =
            this.customerAuthService
                .getAccessToken();

        const headers:
            Record<string, string> = {
                Accept:
                    "application/json",
            };

        if (accessToken) {
            headers.Authorization =
                `Bearer ${accessToken}`;
        }

        return headers;
    }
}
