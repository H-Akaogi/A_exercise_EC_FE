"use client";

import {
    useContext,
} from "react";

import {
    CustomerAuthContext,
    type CustomerAuthContextValue,
} from "@/contexts/CustomerAuthContext";

/**
 * 顧客認証状態とUC002・UC008操作を取得する。
 */
export const useCustomerAuth =
    (): CustomerAuthContextValue => {
        const context =
            useContext(
                CustomerAuthContext,
            );

        if (!context) {
            throw new Error(
                "useCustomerAuthはCustomerAuthProvider内で使用してください。",
            );
        }

        return context;
    };
