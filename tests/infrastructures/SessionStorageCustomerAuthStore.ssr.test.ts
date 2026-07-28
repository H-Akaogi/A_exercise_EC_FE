import {
    describe,
    expect,
    it,
} from "vitest";

import {
    SessionStorageCustomerAuthStore,
} from "@/infrastructures/SessionStorageCustomerAuthStore";

describe(
    "SessionStorageCustomerAuthStore SSR",
    () => {
        it(
            "windowがない環境では未認証として扱う",
            () => {
                const store =
                    new SessionStorageCustomerAuthStore();

                expect(
                    store.getValidSession(),
                ).toBeNull();
                expect(
                    () => {
                        store.clear();
                    },
                ).not.toThrow();
            },
        );
    },
);
