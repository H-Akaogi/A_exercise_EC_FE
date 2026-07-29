"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { useCustomerAccount } from "@/components/hooks/useCustomerAccount";

export const CustomerAccountRegister = () => {
  const router = useRouter();

  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  const [isCompleteOpen, setIsCompleteOpen] = useState<boolean>(false);

  const {
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
  } = useCustomerAccount();

  useEffect(() => {
    void loadForm();
  }, [loadForm]);

  /**
   * 確認モーダルから顧客登録を実行する
   */
  /**
   * 確認モーダルから顧客登録を実行する
   */
  const confirmRegister = async (): Promise<void> => {
    const isSuccess = await submit();

    /*
     * バリデーションエラーやAPIエラーの場合は、
     * 確認モーダルを閉じて入力画面へ戻す。
     */
    if (!isSuccess) {
      setIsConfirmOpen(false);

      return;
    }

    /*
     * 登録確認モーダルを閉じ、
     * 登録完了モーダルを表示する。
     */
    setIsConfirmOpen(false);
    setIsCompleteOpen(true);
  };

  return (
    <div
      className="
      mx-auto
      max-w-2xl
      rounded-lg
      border
      bg-white
      p-8
      shadow-sm
    "
    >
      <h1
        className="
        mb-6
        border-b
        pb-4
        text-center
        text-2xl
        font-bold
      "
      >
        {title}
      </h1>

      {errorMessage && (
        <p
          className="
          mb-5
          text-center
          font-semibold
          text-red-700
        "
        >
          {errorMessage}
        </p>
      )}

      <form
        className="space-y-5"
        onSubmit={(event) => {
          event.preventDefault();

          setIsConfirmOpen(true);
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
            updateField("name", value);
          }}
          onBlur={() => {
            void validateField("name");
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
            updateField("kana", value);
          }}
          onBlur={() => {
            void validateField("kana");
          }}
        />

        <FormField
          id="address1"
          label="住所1"
          placeholder="東京都千代田区永田町1-2-3"
          value={customer.address1}
          error={fieldErrors.address1}
          maxLength={100}
          required
          onChange={(value) => {
            updateField("address1", value);
          }}
          onBlur={() => {
            void validateField("address1");
          }}
        />

        <FormField
          id="address2"
          label="住所2"
          placeholder="メゾン永田町101"
          value={customer.address2 ?? ""}
          error={fieldErrors.address2}
          maxLength={100}
          onChange={(value) => {
            updateField("address2", value);
          }}
          onBlur={() => {
            void validateField("address2");
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
            updateField("phoneNumber", value);
          }}
          onBlur={() => {
            void validateField("phoneNumber");
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
            updateField("mailAddress", value);
          }}
          onBlur={() => {
            void validateField("mailAddress");
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
            updateField("username", value);
          }}
          onBlur={() => {
            void validateField("username");
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
            updateField("password", value);
          }}
          onBlur={() => {
            void validateField("password");
          }}
        />

        <div
          className="
          flex
          gap-4
          pt-4
        "
        >
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
            {isLoading ? "確認処理中" : "確認する"}
          </Button>
        </div>
      </form>
      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>顧客アカウントを登録しますか？</AlertDialogTitle>

            <AlertDialogDescription className="space-y-2 text-left">
              入力した内容で顧客アカウントを登録します。
              <br />
              氏名：
              {customer.name || "未入力"}
              <br />
              氏名カナ：
              {customer.kana || "未入力"}
              <br />
              メールアドレス：
              {customer.mailAddress || "未入力"}
              <br />
              アカウント名：
              {customer.username || "未入力"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>
              入力画面へ戻る
            </AlertDialogCancel>

            <AlertDialogAction
              type="button"
              className="
                    bg-green-900
                    hover:bg-green-800
                "
              disabled={isLoading}
              onClick={(event) => {
                /*
                 * AlertDialogが先に自動で閉じるのを防ぐ。
                 */
                event.preventDefault();

                void confirmRegister();
              }}
            >
              {isLoading ? "登録処理中" : "登録する"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <AlertDialog
        open={isCompleteOpen}
        onOpenChange={() => {
          /*
           * 背景クリックやEscapeでは閉じない。
           * 必ず遷移先を選択してもらう。
           */
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              顧客アカウントの登録が完了しました
            </AlertDialogTitle>

            <AlertDialogDescription
              className="
                    space-y-2
                    text-left
                "
            >
              {completeResult?.message ?? "顧客アカウントを登録しました。"}
              <br />
              氏名：
              {completeResult?.name ?? customer.name}
              <br />
              アカウント名：
              {completeResult?.username ?? customer.username}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                router.push("/");
              }}
            >
              トップへ戻る
            </Button>

            <Button
              type="button"
              className="
                    bg-green-900
                    hover:bg-green-800
                "
              onClick={() => {
                router.push("/login");
              }}
            >
              ログインする
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
  onChange: (value: string) => void;
  onBlur?: () => void;
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
  onBlur,
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
          <span
            className="
            ml-1
            text-red-600
          "
          >
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
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={error ? "border-red-600" : ""}
        onChange={(event) => {
          onChange(event.target.value);
        }}
        onBlur={onBlur}
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
