import {
    describe,
    expect,
    it,
} from "vitest";

import {
    container,
} from "@/di/container";

import {
    TYPES,
} from "@/di/types";

import {
    CustomerAuthRepository,
} from "@/infrastructures/CustomerAuthRepository";

import {
    SessionStorageCustomerAuthStore,
} from "@/infrastructures/SessionStorageCustomerAuthStore";

import type {
    ICustomerAuthRepository,
} from "@/interfaces/ICustomerAuthRepository";

import type {
    ICustomerAuthService,
} from "@/interfaces/ICustomerAuthService";

import type {
    ICustomerAuthSessionStore,
} from "@/interfaces/ICustomerAuthSessionStore";

import {
    CustomerAuthService,
} from "@/services/CustomerAuthService";

describe(
    "顧客認証DIコンテナ",
    () => {
        it(
            "CustomerAuthRepositoryを解決できる",
            () => {
                expect(
                    container.get<
                        ICustomerAuthRepository
                    >(
                        TYPES
                            .ICustomerAuthRepository,
                    ),
                ).toBeInstanceOf(
                    CustomerAuthRepository,
                );
            },
        );

        it(
            "SessionStorageCustomerAuthStoreを解決できる",
            () => {
                expect(
                    container.get<
                        ICustomerAuthSessionStore
                    >(
                        TYPES
                            .ICustomerAuthSessionStore,
                    ),
                ).toBeInstanceOf(
                    SessionStorageCustomerAuthStore,
                );
            },
        );

        it(
            "依存注入済みCustomerAuthServiceを解決できる",
            () => {
                expect(
                    container.get<
                        ICustomerAuthService
                    >(
                        TYPES
                            .ICustomerAuthService,
                    ),
                ).toBeInstanceOf(
                    CustomerAuthService,
                );
            },
        );
    },
);
