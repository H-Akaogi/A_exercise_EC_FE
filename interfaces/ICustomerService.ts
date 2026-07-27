import type {
    Customer,
} from "@/models/Customer";

import type {
    CustomerFormResponse,
} from "@/models/CustomerFormResponse";

import type {
    CustomerCompleteResponse,
} from "@/models/CustomerCompleteResponse";

/**
 * 顧客アカウント登録Service
 */
export interface ICustomerService {
    /**
     * 登録フォームの初期情報を取得する
     */
    getForm():
        Promise<CustomerFormResponse>;

    /**
     * アカウント名が既に存在するか確認する
     */
    existsByAccountName(
        accountName: string,
    ): Promise<boolean>;

    /**
     * メールアドレスが既に存在するか確認する
     */
    existsByMail(
        mailAddress: string,
    ): Promise<boolean>;

    /**
     * 顧客アカウントを登録する
     */
    create(
        customer: Customer,
    ): Promise<CustomerCompleteResponse>;
}