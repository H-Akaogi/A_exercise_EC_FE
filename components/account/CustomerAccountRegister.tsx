"use client";

import {
    useEffect,
} from "react";
import {
    useRouter,
} from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
    useCustomerAccount,
} from "@/components/hooks/useCustomerAccount";

export const CustomerAccountRegister = () => {
    const router =
        useRouter();

    const {
        title,
        customer,
        fieldErrors,
        isLoading,
        errorMessage,
        completeResult,
        loadForm,
        updateField,
        submit,
        reset,
    } = useCustomerAccount();

    useEffect(() => {
        void loadForm();
    }, [
        loadForm,
    ]);

    if (completeResult) {
        return (
            <div className="
        mx-auto
        max-w-2xl
        rounded-lg
        border
        bg-white
        p-8
        shadow-sm
      ">
                <h1 className="
          mb-6
          text-center
          text-2xl
          font-bold
        ">
                    {completeResult.title
                        || "顧客アカウント登録完了"}
                </h1>

                <p className="
          mb-6
          text-center
          font-semibold
          text-green-700
        ">
                    {completeResult.message
                        || "顧客アカウントを登録しました"}
                </p>

                <div className="
          mb-8
          space-y-3
          rounded-md
          bg-gray-50
          p-5
        ">
                    <p>
                        <span className="font-bold">
                            氏名：
                        </span>

                        {completeResult.name}
                    </p>

                    <p>
                        <span className="font-bold">
                            アカウント名：
                        </span>

                        {completeResult.username}
                    </p>

                    <p>
                        <span className="font-bold">
                            登録日時：
                        </span>

                        {completeResult.createdAt
                            ? new Date(
                                completeResult.createdAt,
                            ).toLocaleString(
                                "ja-JP",
                            )
                            : "-"}
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        onClick={reset}
                    >
                        続けて登録する
                    </Button>

                    <Button
                        type="button"
                        className="
              flex-1
              bg-green-900
            "
                        onClick={() => {
                            router.push("/");
                        }}
                    >
                        トップへ戻る
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="
      mx-auto
      max-w-2xl
      rounded-lg
      border
      bg-white
      p-8
      shadow-sm
    ">
            <h1 className="
        mb-6
        border-b
        pb-4
        text-center
        text-2xl
        font-bold
      ">
                {title}
            </h1>

            {errorMessage && (
                <p className="
          mb-5
          text-center
          font-semibold
          text-red-700
        ">
                    {errorMessage}
                </p>
            )}

            <form
                className="space-y-5"
                onSubmit={(event) => {
                    event.preventDefault();
                    void submit();
                }}
                noValidate
            >
                <FormField
                    id="name"
                    label="氏名"
                    value={customer.name}
                    error={fieldErrors.name}
                    maxLength={20}
                    required
                    onChange={(value) => {
                        updateField(
                            "name",
                            value,
                        );
                    }}
                />

                <FormField
                    id="kana"
                    label="氏名カナ"
                    value={customer.kana}
                    error={fieldErrors.kana}
                    maxLength={20}
                    required
                    onChange={(value) => {
                        updateField(
                            "kana",
                            value,
                        );
                    }}
                />

                <FormField
                    id="address1"
                    label="住所1"
                    placeholder="東京都千代田区永田町"
                    value={customer.address1}
                    error={fieldErrors.address1}
                    maxLength={100}
                    required
                    onChange={(value) => {
                        updateField(
                            "address1",
                            value,
                        );
                    }}
                />

                <FormField
                    id="address2"
                    label="住所2"
                    placeholder="1-2-3 メゾン永田町101"
                    value={
                        customer.address2
                        ?? ""
                    }
                    error={fieldErrors.address2}
                    maxLength={100}
                    onChange={(value) => {
                        updateField(
                            "address2",
                            value,
                        );
                    }}
                />

                <FormField
                    id="phoneNumber"
                    label="電話番号"
                    type="tel"
                    placeholder="090-1234-5678"
                    value={customer.phoneNumber}
                    error={fieldErrors.phoneNumber}
                    maxLength={14}
                    required
                    onChange={(value) => {
                        updateField(
                            "phoneNumber",
                            value,
                        );
                    }}
                />

                <FormField
                    id="mailAddress"
                    label="メールアドレス"
                    type="email"
                    value={customer.mailAddress}
                    error={fieldErrors.mailAddress}
                    maxLength={100}
                    required
                    onChange={(value) => {
                        updateField(
                            "mailAddress",
                            value,
                        );
                    }}
                />

                <FormField
                    id="username"
                    label="アカウント名"
                    value={customer.username}
                    error={fieldErrors.username}
                    maxLength={20}
                    required
                    autoComplete="username"
                    onChange={(value) => {
                        updateField(
                            "username",
                            value,
                        );
                    }}
                />

                <FormField
                    id="password"
                    label="パスワード"
                    type="password"
                    value={customer.password}
                    error={fieldErrors.password}
                    maxLength={20}
                    required
                    autoComplete="new-password"
                    onChange={(value) => {
                        updateField(
                            "password",
                            value,
                        );
                    }}
                />

                <div className="
          flex
          gap-4
          pt-4
        ">
                    <Button
                        type="button"
                        variant="outline"
                        className="flex-1"
                        disabled={isLoading}
                        onClick={() => {
                            router.push("/");
                        }}
                    >
                        戻る
                    </Button>

                    <Button
                        type="submit"
                        className="
              flex-1
              bg-green-900
            "
                        disabled={isLoading}
                    >
                        {isLoading
                            ? "登録処理中"
                            : "登録する"}
                    </Button>
                </div>
            </form>
        </div>
    );
};

type FormFieldProps = {
    id: string;
    label: string;
    value: string;
    error?: string;
    type?: string;
    placeholder?: string;
    maxLength?: number;
    required?: boolean;
    autoComplete?: string;
    onChange:
    (value: string) => void;
};

const FormField = ({
    id,
    label,
    value,
    error,
    type = "text",
    placeholder,
    maxLength,
    required = false,
    autoComplete,
    onChange,
}: FormFieldProps) => {
    return (
        <div>
            <label
                htmlFor={id}
                className="
          mb-2
          block
          text-sm
          font-bold
        "
            >
                {label}

                {required && (
                    <span className="
            ml-1
            text-red-600
          ">
                        必須
                    </span>
                )}
            </label>

            <Input
                id={id}
                type={type}
                value={value}
                placeholder={placeholder}
                maxLength={maxLength}
                autoComplete={autoComplete}
                aria-invalid={
                    Boolean(error)
                }
                aria-describedby={
                    error
                        ? `${id}-error`
                        : undefined
                }
                className={
                    error
                        ? "border-red-600"
                        : ""
                }
                onChange={(event) => {
                    onChange(
                        event.target.value,
                    );
                }}
            />

            {error && (
                <p
                    id={`${id}-error`}
                    className="
            mt-1
            text-sm
            text-red-700
          "
                >
                    {error}
                </p>
            )}
        </div>
    );
};