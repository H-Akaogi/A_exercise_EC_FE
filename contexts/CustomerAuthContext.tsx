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
    useRouter,
} from "next/navigation";

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
    sessionMessage: string | null;
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

const SESSION_EXPIRED_MESSAGE =
    "セッションが切れました。再度ログインしてください";

type CustomerAuthProviderProps = {
    children?: ReactNode;
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
    const router =
        useRouter();

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

    const [
        sessionMessage,
        setSessionMessage,
    ] = useState<string | null>(null);

    const clearAuthentication =
        useCallback(
            (): void => {
                service
                    .clearAuthentication();
            },
            [service],
        );

    useEffect(() => {
        const unsubscribe =
            service
                .subscribeToAuthenticationCleared(
                    () => {
                        setIsAuthenticated(false);
                        setExpiresAt(null);
                        setSessionMessage(
                            SESSION_EXPIRED_MESSAGE,
                        );
                        router.replace(
                            "/login",
                        );
                    },
                );

        return unsubscribe;
    }, [
        router,
        service,
    ]);

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

                if (
                    authState
                        .sessionExpired
                ) {
                    setSessionMessage(
                        SESSION_EXPIRED_MESSAGE,
                    );
                    router.replace(
                        "/login",
                    );
                } else {
                    setSessionMessage(null);
                }

                setIsInitialized(true);
            };

        void initialize();

        return () => {
            isCancelled = true;
        };
    }, [
        router,
        service,
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

                setSessionMessage(null);
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
                    setSessionMessage(null);
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
                sessionMessage,
                login,
                logout,
                getAccessToken,
                clearAuthentication,
            }),
            [
                isAuthenticated,
                expiresAt,
                isInitialized,
                sessionMessage,
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
