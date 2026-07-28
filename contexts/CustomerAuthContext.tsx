"use client";

import {
    createContext,
    useCallback,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react";

import {
    container,
} from "@/di/container";

import {
    TYPES,
} from "@/di/types";

import type {
    ICustomerAuthService,
} from "@/interfaces/ICustomerAuthService";

import type {
    CustomerLoginRequest,
} from "@/models/CustomerAuth";

export type CustomerAuthContextValue = {
    isAuthenticated: boolean;
    expiresAt: string | null;
    isInitialized: boolean;
    login(
        request: CustomerLoginRequest,
    ): Promise<void>;
    logout(): Promise<void>;
    getAccessToken(): string | null;
    clearAuthentication(): void;
};

export const CustomerAuthContext =
    createContext<
        CustomerAuthContextValue | undefined
    >(
        undefined,
    );

const MAX_TIMEOUT_MILLISECONDS =
    2_147_483_647;

type CustomerAuthProviderProps = {
    children: ReactNode;
    /**
     * 単体テストでServiceを差し替えるための任意指定。
     */
    service?: ICustomerAuthService;
};

/**
 * 顧客認証状態をClient Componentへ共有する。
 */
export const CustomerAuthProvider = ({
    children,
    service: providedService,
}: CustomerAuthProviderProps) => {
    const service =
        useMemo(
            () =>
                providedService
                ?? container.get<
                    ICustomerAuthService
                >(
                    TYPES.ICustomerAuthService,
                ),
            [providedService],
        );

    const [
        isAuthenticated,
        setIsAuthenticated,
    ] = useState<boolean>(false);

    const [
        expiresAt,
        setExpiresAt,
    ] = useState<string | null>(
        null,
    );

    const [
        isInitialized,
        setIsInitialized,
    ] = useState<boolean>(false);

    const clearAuthentication =
        useCallback(
            (): void => {
                service
                    .clearAuthentication();
                setIsAuthenticated(false);
                setExpiresAt(null);
            },
            [service],
        );

    useEffect(() => {
        let isCancelled =
            false;

        const initialize =
            async (): Promise<void> => {
                /*
                 * Clientの初回描画後に保存情報を復元し、
                 * effect内の同期的な連鎖描画を避ける。
                 */
                await Promise.resolve();

                if (isCancelled) {
                    return;
                }

                const authState =
                    service.getAuthState();

                setIsAuthenticated(
                    authState
                        .isAuthenticated,
                );
                setExpiresAt(
                    authState.expiresAt,
                );
                setIsInitialized(true);
            };

        void initialize();

        return () => {
            isCancelled = true;
        };
    }, [service]);

    /*
     * 画面を開いたまま有効期限を迎えた場合も、
     * 期限切れJWTを使い続けない。
     */
    useEffect(() => {
        if (
            !isAuthenticated
            || !expiresAt
        ) {
            return;
        }

        const expiresAtMilliseconds =
            Date.parse(
                expiresAt,
            );
        const remainingMilliseconds =
            expiresAtMilliseconds
            - Date.now();

        const timeoutMilliseconds =
            Number.isFinite(
                expiresAtMilliseconds,
            )
                ? Math.max(
                    0,
                    Math.min(
                        remainingMilliseconds,
                        MAX_TIMEOUT_MILLISECONDS,
                    ),
                )
                : 0;

        const timerId =
            window.setTimeout(
                clearAuthentication,
                timeoutMilliseconds,
            );

        return () => {
            window.clearTimeout(
                timerId,
            );
        };
    }, [
        clearAuthentication,
        expiresAt,
        isAuthenticated,
    ]);

    const login =
        useCallback(
            async (
                request:
                    CustomerLoginRequest,
            ): Promise<void> => {
                const authState =
                    await service.login(
                        request,
                    );

                setIsAuthenticated(
                    authState.isAuthenticated,
                );
                setExpiresAt(
                    authState.expiresAt,
                );
            },
            [service],
        );

    const logout =
        useCallback(
            async (): Promise<void> => {
                try {
                    await service.logout();
                } finally {
                    /*
                     * APIが401/500でもローカル状態は
                     * 必ず未認証へ切り替える。
                     */
                    setIsAuthenticated(false);
                    setExpiresAt(null);
                }
            },
            [service],
        );

    const getAccessToken =
        useCallback(
            (): string | null =>
                service.getAccessToken(),
            [service],
        );

    const value =
        useMemo<
            CustomerAuthContextValue
        >(
            () => ({
                isAuthenticated,
                expiresAt,
                isInitialized,
                login,
                logout,
                getAccessToken,
                clearAuthentication,
            }),
            [
                isAuthenticated,
                expiresAt,
                isInitialized,
                login,
                logout,
                getAccessToken,
                clearAuthentication,
            ],
        );

    return (
        <CustomerAuthContext.Provider
            value={value}
        >
            {children}
        </CustomerAuthContext.Provider>
    );
};
