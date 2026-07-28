"use client";

import Link from "next/link";
import {
    useRef,
    useState,
    type FormEvent,
} from "react";
import {
    useRouter,
} from "next/navigation";

import {
    useCustomerAuth,
} from "@/components/hooks/useCustomerAuth";

import {
    Button,
} from "@/components/ui/button";

import {
    Input,
} from "@/components/ui/input";

import {
    CustomerLoginValidationError,
    type CustomerLoginFieldErrors,
} from "@/models/CustomerAuth";

/**
 * FP002 顧客ログインフォーム。
 */
export const CustomerLoginForm = () => {
    const router =
        useRouter();
    const {
        login,
    } = useCustomerAuth();

    const [
        mailAddress,
        setMailAddress,
    ] = useState<string>("");

    const [
        password,
        setPassword,
    ] = useState<string>("");

    const [
        fieldErrors,
        setFieldErrors,
    ] =
        useState<
            CustomerLoginFieldErrors
        >(
            {},
        );

    const [
        errorMessage,
        setErrorMessage,
    ] = useState<string>("");

    const [
        isSubmitting,
        setIsSubmitting,
    ] = useState<boolean>(false);

    const submissionInProgress =
        useRef<boolean>(false);

    const handleSubmit =
        async (
            event:
                FormEvent<HTMLFormElement>,
        ): Promise<void> => {
            event.preventDefault();

            if (
                submissionInProgress
                    .current
            ) {
                return;
            }

            submissionInProgress.current =
                true;
            setIsSubmitting(true);
            setFieldErrors({});
            setErrorMessage("");

            try {
                await login({
                    mailAddress,
                    password,
                });

                router.replace("/");
            } catch (error) {
                if (
                    error
                    instanceof
                    CustomerLoginValidationError
                ) {
                    setFieldErrors(
                        error.fieldErrors,
                    );
                } else {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : "ログイン処理に失敗しました。",
                    );
                }
            } finally {
                submissionInProgress.current =
                    false;
                setIsSubmitting(false);
            }
        };

    return (
        <section
            className="
                mx-auto
                max-w-md
                px-6
                py-12
            "
        >
            <div
                className="
                    rounded-lg
                    border
                    border-green-200
                    bg-white
                    p-8
                    shadow-sm
                "
            >
                <h1
                    className="
                        mb-8
                        text-2xl
                        font-bold
                        text-green-900
                    "
                >
                    ログイン
                </h1>

                {errorMessage && (
                    <p
                        role="alert"
                        className="
                            mb-6
                            rounded
                            border
                            border-red-300
                            bg-red-50
                            p-3
                            text-sm
                            text-red-700
                        "
                    >
                        {errorMessage}
                    </p>
                )}

                <form
                    method="post"
                    noValidate
                    onSubmit={
                        handleSubmit
                    }
                >
                    <div className="mb-5">
                        <label
                            htmlFor="mailAddress"
                            className="
                                mb-2
                                block
                                text-sm
                                font-bold
                            "
                        >
                            メールアドレス
                        </label>

                        <Input
                            id="mailAddress"
                            name="mailAddress"
                            type="email"
                            autoComplete="email"
                            value={mailAddress}
                            disabled={
                                isSubmitting
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors
                                        .mailAddress,
                                )
                            }
                            aria-describedby={
                                fieldErrors
                                    .mailAddress
                                    ? "mailAddress-error"
                                    : undefined
                            }
                            onChange={(
                                event,
                            ) => {
                                setMailAddress(
                                    event
                                        .target
                                        .value,
                                );
                                setFieldErrors(
                                    (
                                        current,
                                    ) => ({
                                        ...current,
                                        mailAddress:
                                            undefined,
                                    }),
                                );
                            }}
                        />

                        {fieldErrors
                            .mailAddress && (
                            <p
                                id="mailAddress-error"
                                className="
                                    mt-1
                                    text-sm
                                    text-red-700
                                "
                            >
                                {
                                    fieldErrors
                                        .mailAddress
                                }
                            </p>
                        )}
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="password"
                            className="
                                mb-2
                                block
                                text-sm
                                font-bold
                            "
                        >
                            パスワード
                        </label>

                        <Input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete=
                                "current-password"
                            minLength={5}
                            maxLength={20}
                            value={password}
                            disabled={
                                isSubmitting
                            }
                            aria-invalid={
                                Boolean(
                                    fieldErrors
                                        .password,
                                )
                            }
                            aria-describedby={
                                fieldErrors
                                    .password
                                    ? "password-error"
                                    : undefined
                            }
                            onChange={(
                                event,
                            ) => {
                                setPassword(
                                    event
                                        .target
                                        .value,
                                );
                                setFieldErrors(
                                    (
                                        current,
                                    ) => ({
                                        ...current,
                                        password:
                                            undefined,
                                    }),
                                );
                            }}
                        />

                        {fieldErrors
                            .password && (
                            <p
                                id="password-error"
                                className="
                                    mt-1
                                    text-sm
                                    text-red-700
                                "
                            >
                                {
                                    fieldErrors
                                        .password
                                }
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="
                            w-full
                            bg-green-900
                        "
                        disabled={
                            isSubmitting
                        }
                    >
                        {isSubmitting
                            ? "ログイン中"
                            : "ログイン"}
                    </Button>
                </form>

                <p
                    className="
                        mt-6
                        text-center
                        text-sm
                        text-gray-600
                    "
                >
                    アカウントをお持ちでない方は
                    {" "}
                    <Link
                        href="/account"
                        className="
                            text-green-700
                            underline
                        "
                    >
                        アカウント登録
                    </Link>
                </p>
            </div>
        </section>
    );
};
