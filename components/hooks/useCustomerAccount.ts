"use client";

import {
    useCallback,
    useMemo,
    useState,
} from "react";

import { container } from "@/di/container";
import { TYPES } from "@/di/types";

import type {
    ICustomerService,
} from "@/interfaces/ICustomerService";

import type {
    Customer,
} from "@/models/Customer";

import type {
    CustomerCompleteResponse,
} from "@/models/CustomerCompleteResponse";

/**
 * 入力項目ごとのエラー
 */
export type CustomerFieldErrors =
    Partial<
        Record<
            | "name"
            | "kana"
            | "address1"
            | "address2"
            | "phoneNumber"
            | "mailAddress"
            | "username"
            | "password",
            string
        >
    >;

const initialCustomer: Customer = {
    customerUuid: "",
    name: "",
    kana: "",
    address1: "",
    address2: "",
    phoneNumber: "",
    mailAddress: "",
    username: "",
    password: "",
    createdAt: "",
};



/**
 * 顧客アカウント登録画面のStateと操作を提供するフック
 */
export const useCustomerAccount = () => {
    const service =
        useMemo(
            () =>
                container.get<ICustomerService>(
                    TYPES.ICustomerService,
                ),
            [],
        );

    const [
        title,
        setTitle,
    ] = useState<string>(
        "顧客アカウント登録",
    );

    const [
        customer,
        setCustomer,
    ] = useState<Customer>(
        initialCustomer,
    );

    const [
        fieldErrors,
        setFieldErrors,
    ] = useState<CustomerFieldErrors>({});

    const [
        isLoading,
        setIsLoading,
    ] = useState<boolean>(false);

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string>("");

    const [
        completeResult,
        setCompleteResult,
    ] =
        useState<CustomerCompleteResponse | null>(
            null,
        );

    /**
     * 初期フォームを取得する
     */
    const loadForm =
        useCallback(
            async (): Promise<void> => {
                setIsLoading(true);
                setErrorMessage("");

                try {
                    const result =
                        await service.getForm();

                    setTitle(result.title);

                    setCustomer({
                        ...result.model,
                        address2:
                            result.model.address2
                            ?? "",
                    });
                } catch (error) {
                    console.error(
                        "顧客登録フォーム取得中にエラーが発生しました",
                        error,
                    );

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "登録画面の読み込みに失敗しました",
                    );
                } finally {
                    setIsLoading(false);
                }
            },
            [service],
        );

    /**
     * 入力値を変更する
     */
    const updateField =
        useCallback(
            (
                field:
                    keyof Customer,
                value: string,
            ): void => {
                setCustomer(
                    (current) => ({
                        ...current,
                        [field]: value,
                    }),
                );

                setFieldErrors(
                    (current) => ({
                        ...current,
                        [field]: undefined,
                    }),
                );

                setErrorMessage("");
            },
            [],
        );

    /**
     * 画面側バリデーション
     */
    const validate =
        useCallback(
            (): CustomerFieldErrors => {
                const errors:
                    CustomerFieldErrors = {};

                const namePattern =
                    /^[A-Za-z0-9Ａ-Ｚａ-ｚ０-９ぁ-んァ-ヶ一-龠々ー\s]+$/;

                const kanaPattern =
                    /^[ァ-ヶー\s]+$/;

                const addressPattern =
                    /^[A-Za-z0-9Ａ-Ｚａ-ｚ０-９ぁ-んァ-ヶ一-龠々ー\s\-ー－〒（）()]+$/;

                const phonePattern =
                    /^\d{2,4}-\d{2,4}-\d{4}$/;

                const mailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                const accountPattern =
                    /^[A-Za-z0-9]+$/;

                if (!customer.name.trim()) {
                    errors.name =
                        "氏名を入力してください";
                } else if (
                    customer.name.length < 2
                    || customer.name.length > 20
                ) {
                    errors.name =
                        "氏名は2〜20文字で入力してください";
                } else if (
                    !namePattern.test(
                        customer.name,
                    )
                ) {
                    errors.name =
                        "氏名は全角・半角英数字で入力してください";
                }

                if (!customer.kana.trim()) {
                    errors.kana =
                        "氏名カナを入力してください";
                } else if (
                    customer.kana.length < 2
                    || customer.kana.length > 20
                ) {
                    errors.kana =
                        "氏名カナは2〜20文字で入力してください";
                } else if (
                    !kanaPattern.test(
                        customer.kana,
                    )
                ) {
                    errors.kana =
                        "氏名カナは全角カナで入力してください";
                }

                if (!customer.address1.trim()) {
                    errors.address1 =
                        "住所1を入力してください";
                } else if (
                    customer.address1.length > 100
                ) {
                    errors.address1 =
                        "住所1は100文字以内で入力してください";
                } else if (
                    !addressPattern.test(
                        customer.address1,
                    )
                ) {
                    errors.address1 =
                        "住所1に使用できない文字が含まれています";
                }

                if (
                    customer.address2
                    && customer.address2.length > 100
                ) {
                    errors.address2 =
                        "住所2は100文字以内で入力してください";
                } else if (
                    customer.address2
                    && !addressPattern.test(
                        customer.address2,
                    )
                ) {
                    errors.address2 =
                        "住所2に使用できない文字が含まれています";
                }

                if (!customer.phoneNumber.trim()) {
                    errors.phoneNumber =
                        "電話番号を入力してください";
                } else if (
                    customer.phoneNumber.length > 14
                    || !phonePattern.test(
                        customer.phoneNumber,
                    )
                ) {
                    errors.phoneNumber =
                        "電話番号は「XX-XXXX-XXXX」形式で入力してください";
                }

                if (!customer.mailAddress.trim()) {
                    errors.mailAddress =
                        "メールアドレスを入力してください";
                } else if (
                    customer.mailAddress.length < 4
                    || customer.mailAddress.length > 100
                ) {
                    errors.mailAddress =
                        "メールアドレスは4〜100文字で入力してください";
                } else if (
                    !mailPattern.test(
                        customer.mailAddress,
                    )
                ) {
                    errors.mailAddress =
                        "正しいメールアドレス形式で入力してください";
                }

                if (!customer.username.trim()) {
                    errors.username =
                        "アカウント名を入力してください";
                } else if (
                    customer.username.length < 5
                    || customer.username.length > 20
                ) {
                    errors.username =
                        "アカウント名は5〜20文字で入力してください";
                } else if (
                    !accountPattern.test(
                        customer.username,
                    )
                ) {
                    errors.username =
                        "アカウント名は半角英数字で入力してください";
                }

                if (!customer.password) {
                    errors.password =
                        "パスワードを入力してください";
                } else if (
                    customer.password.length < 5
                    || customer.password.length > 20
                ) {
                    errors.password =
                        "パスワードは5〜20文字で入力してください";
                } else if (
                    !accountPattern.test(
                        customer.password,
                    )
                ) {
                    errors.password =
                        "パスワードは半角英数字で入力してください";
                }

                return errors;
            },
            [customer],
        );

    type CustomerFieldName =
        | "name"
        | "kana"
        | "address1"
        | "address2"
        | "phoneNumber"
        | "mailAddress"
        | "username"
        | "password";

    /**
 * 指定した項目だけバリデーションする
 */
    const validateField =
        useCallback(
            async (
                field: CustomerFieldName,
            ): Promise<void> => {
                let message:
                    string | undefined;

                const accountPattern =
                    /^[A-Za-z0-9]+$/;

                const kanaPattern =
                    /^[ァ-ヶー\s]+$/;

                const phonePattern =
                    /^\d{2,4}-\d{2,4}-\d{4}$/;

                const mailPattern =
                    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

                switch (field) {
                    case "name":
                        if (!customer.name.trim()) {
                            message =
                                "氏名を入力してください";
                        } else if (
                            customer.name.length < 2
                            || customer.name.length > 20
                        ) {
                            message =
                                "氏名は2〜20文字で入力してください";
                        }

                        break;

                    case "kana":
                        if (!customer.kana.trim()) {
                            message =
                                "氏名カナを入力してください";
                        } else if (
                            customer.kana.length < 2
                            || customer.kana.length > 20
                        ) {
                            message =
                                "氏名カナは2〜20文字で入力してください";
                        } else if (
                            !kanaPattern.test(
                                customer.kana,
                            )
                        ) {
                            message =
                                "氏名カナは全角カナで入力してください";
                        }

                        break;

                    case "address1":
                        if (!customer.address1.trim()) {
                            message =
                                "住所1を入力してください";
                        } else if (
                            customer.address1.length > 100
                        ) {
                            message =
                                "住所1は100文字以内で入力してください";
                        }

                        break;

                    case "address2":
                        if (
                            customer.address2
                            && customer.address2.length > 100
                        ) {
                            message =
                                "住所2は100文字以内で入力してください";
                        }

                        break;

                    case "phoneNumber":
                        if (!customer.phoneNumber.trim()) {
                            message =
                                "電話番号を入力してください";
                        } else if (
                            customer.phoneNumber.length > 14
                            || !phonePattern.test(
                                customer.phoneNumber,
                            )
                        ) {
                            message =
                                "電話番号は「XX-XXXX-XXXX」形式で入力してください";
                        }

                        break;

                    case "mailAddress":
                        if (!customer.mailAddress.trim()) {
                            message =
                                "メールアドレスを入力してください";
                        } else if (
                            customer.mailAddress.length < 4
                            || customer.mailAddress.length > 100
                        ) {
                            message =
                                "メールアドレスは4〜100文字で入力してください";
                        } else if (
                            !mailPattern.test(
                                customer.mailAddress,
                            )
                        ) {
                            message =
                                "正しいメールアドレス形式で入力してください";
                        } else {
                            const exists =
                                await service.existsByMail(
                                    customer.mailAddress,
                                );

                            if (exists) {
                                message =
                                    "このメールアドレスは既に登録されています";
                            }
                        }

                        break;

                    case "username":
                        if (!customer.username.trim()) {
                            message =
                                "アカウント名を入力してください";
                        } else if (
                            customer.username.length < 5
                            || customer.username.length > 20
                        ) {
                            message =
                                "アカウント名は5〜20文字で入力してください";
                        } else if (
                            !accountPattern.test(
                                customer.username,
                            )
                        ) {
                            message =
                                "アカウント名は半角英数字で入力してください";
                        } else {
                            const exists =
                                await service
                                    .existsByAccountName(
                                        customer.username,
                                    );

                            if (exists) {
                                message =
                                    "このアカウント名は既に使用されています";
                            }
                        }

                        break;

                    case "password":
                        if (!customer.password) {
                            message =
                                "パスワードを入力してください";
                        } else if (
                            customer.password.length < 5
                            || customer.password.length > 20
                        ) {
                            message =
                                "パスワードは5〜20文字で入力してください";
                        } else if (
                            !accountPattern.test(
                                customer.password,
                            )
                        ) {
                            message =
                                "パスワードは半角英数字で入力してください";
                        }

                        break;
                }

                setFieldErrors(
                    (current) => ({
                        ...current,
                        [field]:
                            message,
                    }),
                );
            },
            [
                customer,
                service,
            ],
        );

    /**
     * 顧客アカウントを登録する
     */
    const submit =
        useCallback(
            async (): Promise<boolean> => {
                setErrorMessage("");
                setCompleteResult(null);

                const validationErrors =
                    validate();

                if (
                    Object.keys(
                        validationErrors,
                    ).length > 0
                ) {
                    setFieldErrors(
                        validationErrors,
                    );

                    return false;
                }

                setIsLoading(true);

                try {
                    const [
                        accountNameExists,
                        mailExists,
                    ] = await Promise.all([
                        service
                            .existsByAccountName(
                                customer.username,
                            ),

                        service
                            .existsByMail(
                                customer.mailAddress,
                            ),
                    ]);

                    const duplicateErrors:
                        CustomerFieldErrors = {};

                    if (accountNameExists) {
                        duplicateErrors.username =
                            "このアカウント名は既に使用されています";
                    }

                    if (mailExists) {
                        duplicateErrors.mailAddress =
                            "このメールアドレスは既に登録されています";
                    }

                    if (
                        Object.keys(
                            duplicateErrors,
                        ).length > 0
                    ) {
                        setFieldErrors(
                            duplicateErrors,
                        );

                        return false;
                    }

                    const result =
                        await service.create(
                            customer,
                        );

                    setCompleteResult(
                        result,
                    );

                    return true;
                } catch (error) {
                    console.error(
                        "顧客アカウント登録中にエラーが発生しました",
                        error,
                    );

                    if (error instanceof Error) {
                        try {
                            const parsed =
                                JSON.parse(
                                    error.message,
                                ) as {
                                    type?: string;
                                    errors?: CustomerFieldErrors;
                                };

                            if (
                                parsed.type
                                === "validation"
                                && parsed.errors
                            ) {
                                setFieldErrors(
                                    parsed.errors,
                                );

                                return false;
                            }
                        } catch {
                            // JSON形式でない通常エラー
                        }
                    }

                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "顧客アカウントの登録に失敗しました",
                    );

                    return false;
                } finally {
                    setIsLoading(false);
                }
            },
            [
                customer,
                service,
                validate,
            ],
        );

    const reset =
        useCallback(
            (): void => {
                setCustomer(
                    initialCustomer,
                );
                setFieldErrors({});
                setErrorMessage("");
                setCompleteResult(null);
            },
            [],
        );

    return {
        title,
        customer,
        fieldErrors,
        isLoading,
        errorMessage,
        completeResult,

        loadForm,
        updateField,
        validateField,
        submit,
        reset,
    };
};