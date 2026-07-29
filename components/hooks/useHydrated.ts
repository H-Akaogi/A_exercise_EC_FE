"use client";

import { useSyncExternalStore } from "react";

const subscribe = (): (() => void) => {
    return () => { };
};

/**
 * クライアント側のハイドレーションが完了したか判定する
 */
export const useHydrated = (): boolean => {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false,
    );
};