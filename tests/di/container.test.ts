import { describe, expect, it } from "vitest";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import { ProductRepository } from "@/infrastructures/ProductRepository";
import { ProductCategoryRepository } from "@/infrastructures/ProductCategoryRepository";
import { PaymentMethodRepository } from "@/infrastructures/PaymentMethodRepository";
import { OrderRepository } from "@/infrastructures/OrderRepository";
import { CustomerRepository } from "@/infrastructures/CustomerRepository";
import { CustomerAuthRepository } from "@/infrastructures/CustomerAuthRepository";
import { SessionStorageCustomerAuthStore } from "@/infrastructures/SessionStorageCustomerAuthStore";

import { PurchaseProductService } from "@/services/PurchaseProductService";
import { ProductCategoryService } from "@/services/ProductCategoryService";
import { PaymentMethodService } from "@/services/PaymentMethodService";
import { OrderService } from "@/services/OrderService";
import { CustomerService } from "@/services/CustomerService";
import { CustomerAuthService } from "@/services/CustomerAuthService";

describe("DIコンテナの検証", () => {
    describe("リポジトリの登録", () => {
        it("商品リポジトリを取得できる", () => {
            const repository = container.get(
                TYPES.IProductRepository,
            );

            expect(repository).toBeInstanceOf(
                ProductRepository,
            );
        });

        it("商品カテゴリリポジトリを取得できる", () => {
            const repository = container.get(
                TYPES.IProductCategoryRepository,
            );

            expect(repository).toBeInstanceOf(
                ProductCategoryRepository,
            );
        });

        it("支払方法リポジトリを取得できる", () => {
            const repository = container.get(
                TYPES.IPaymentMethodRepository,
            );

            expect(repository).toBeInstanceOf(
                PaymentMethodRepository,
            );
        });

        it("注文リポジトリを取得できる", () => {
            const repository = container.get(
                TYPES.IOrderRepository,
            );

            expect(repository).toBeInstanceOf(
                OrderRepository,
            );
        });

        it("顧客リポジトリを取得できる", () => {
            const repository = container.get(
                TYPES.ICustomerRepository,
            );

            expect(repository).toBeInstanceOf(
                CustomerRepository,
            );
        });

        it("顧客認証リポジトリを取得できる", () => {
            const repository = container.get(
                TYPES.ICustomerAuthRepository,
            );

            expect(repository).toBeInstanceOf(
                CustomerAuthRepository,
            );
        });

        it("顧客認証セッションストアを取得できる", () => {
            const store = container.get(
                TYPES.ICustomerAuthSessionStore,
            );

            expect(store).toBeInstanceOf(
                SessionStorageCustomerAuthStore,
            );
        });
    });

    describe("サービスの登録", () => {
        it("商品購入サービスを取得できる", () => {
            const service = container.get(
                TYPES.IPurchaseProductService,
            );

            expect(service).toBeInstanceOf(
                PurchaseProductService,
            );
        });

        it("商品カテゴリサービスを取得できる", () => {
            const service = container.get(
                TYPES.IProductCategoryService,
            );

            expect(service).toBeInstanceOf(
                ProductCategoryService,
            );
        });

        it("支払方法サービスを取得できる", () => {
            const service = container.get(
                TYPES.IPaymentMethodService,
            );

            expect(service).toBeInstanceOf(
                PaymentMethodService,
            );
        });

        it("注文サービスを取得できる", () => {
            const service = container.get(
                TYPES.IOrderService,
            );

            expect(service).toBeInstanceOf(
                OrderService,
            );
        });

        it("顧客サービスを取得できる", () => {
            const service = container.get(
                TYPES.ICustomerService,
            );

            expect(service).toBeInstanceOf(
                CustomerService,
            );
        });

        it("顧客認証サービスを取得できる", () => {
            const service = container.get(
                TYPES.ICustomerAuthService,
            );

            expect(service).toBeInstanceOf(
                CustomerAuthService,
            );
        });
    });

    describe("ライフサイクルの設定", () => {
        it("リポジトリはSingletonとして登録されている", () => {
            const productRepository1 = container.get(
                TYPES.IProductRepository,
            );
            const productRepository2 = container.get(
                TYPES.IProductRepository,
            );

            const categoryRepository1 = container.get(
                TYPES.IProductCategoryRepository,
            );
            const categoryRepository2 = container.get(
                TYPES.IProductCategoryRepository,
            );

            const paymentMethodRepository1 = container.get(
                TYPES.IPaymentMethodRepository,
            );
            const paymentMethodRepository2 = container.get(
                TYPES.IPaymentMethodRepository,
            );

            const orderRepository1 = container.get(
                TYPES.IOrderRepository,
            );
            const orderRepository2 = container.get(
                TYPES.IOrderRepository,
            );

            const customerRepository1 = container.get(
                TYPES.ICustomerRepository,
            );
            const customerRepository2 = container.get(
                TYPES.ICustomerRepository,
            );

            const customerAuthRepository1 = container.get(
                TYPES.ICustomerAuthRepository,
            );
            const customerAuthRepository2 = container.get(
                TYPES.ICustomerAuthRepository,
            );

            const customerAuthSessionStore1 = container.get(
                TYPES.ICustomerAuthSessionStore,
            );
            const customerAuthSessionStore2 = container.get(
                TYPES.ICustomerAuthSessionStore,
            );

            expect(productRepository1).toBe(
                productRepository2,
            );
            expect(categoryRepository1).toBe(
                categoryRepository2,
            );
            expect(paymentMethodRepository1).toBe(
                paymentMethodRepository2,
            );
            expect(orderRepository1).toBe(
                orderRepository2,
            );
            expect(customerRepository1).toBe(
                customerRepository2,
            );
            expect(customerAuthRepository1).toBe(
                customerAuthRepository2,
            );
            expect(customerAuthSessionStore1).toBe(
                customerAuthSessionStore2,
            );
        });

        it("顧客認証サービスはSingletonとして登録されている", () => {
            const service1 = container.get(
                TYPES.ICustomerAuthService,
            );
            const service2 = container.get(
                TYPES.ICustomerAuthService,
            );

            expect(service1).toBe(service2);
        });

        it("Singleton指定のないサービスは取得ごとに生成される", () => {
            const purchaseService1 = container.get(
                TYPES.IPurchaseProductService,
            );
            const purchaseService2 = container.get(
                TYPES.IPurchaseProductService,
            );

            const categoryService1 = container.get(
                TYPES.IProductCategoryService,
            );
            const categoryService2 = container.get(
                TYPES.IProductCategoryService,
            );

            const paymentMethodService1 = container.get(
                TYPES.IPaymentMethodService,
            );
            const paymentMethodService2 = container.get(
                TYPES.IPaymentMethodService,
            );

            const orderService1 = container.get(
                TYPES.IOrderService,
            );
            const orderService2 = container.get(
                TYPES.IOrderService,
            );

            const customerService1 = container.get(
                TYPES.ICustomerService,
            );
            const customerService2 = container.get(
                TYPES.ICustomerService,
            );

            expect(purchaseService1).not.toBe(
                purchaseService2,
            );
            expect(categoryService1).not.toBe(
                categoryService2,
            );
            expect(paymentMethodService1).not.toBe(
                paymentMethodService2,
            );
            expect(orderService1).not.toBe(
                orderService2,
            );
            expect(customerService1).not.toBe(
                customerService2,
            );
        });
    });
});