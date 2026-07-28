import type { ICustomerRepository } from "@/interfaces/ICustomerRepository";
import type { Customer } from "@/models/Customer";
import type { CustomerFormResponse } from "@/models/CustomerFormResponse";
import type { CustomerCompleteResponse } from "@/models/CustomerCompleteResponse";
import { injectable } from "inversify";

/**
 * 担当者アカウントRepository
 */
@injectable()
export class CustomerRepository implements ICustomerRepository {
  /**
 * 顧客登録フォームの初期情報を取得する
 */
  public async getForm():
    Promise<CustomerFormResponse> {
    const url =
      "/proxy-api/account/form";

    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          credentials:
            "include",
          cache:
            "no-store",
        },
      );

    if (!response.ok) {
      const errorData =
        await response.json()
          .catch(
            () => ({}),
          ) as {
            message?: string;
            detail?: string;
            title?: string;
            errors?: Record<
              string,
              string[] | string
            >;
          };

      console.error(
        "========== API ERROR ==========",
      );
      console.error(
        "getForm url:",
        url,
      );
      console.error(
        "getForm status:",
        response.status,
      );
      console.error(
        "getForm error body:",
        errorData,
      );
      console.error(
        "================================",
      );

      if (errorData.errors) {
        const messages =
          Object.values(
            errorData.errors,
          )
            .flat()
            .join("\n");

        throw new Error(
          messages,
        );
      }

      throw new Error(
        errorData.message
        ?? errorData.detail
        ?? errorData.title
        ?? `顧客登録画面の初期情報取得に失敗しました (Status: ${response.status})`,
      );
    }

    const responseData =
      await response.json() as {
        title: string;
        model: {
          name: string;
          kana: string;
          address1: string;
          address2: string | null;
          phoneNumber: string;
          mailAddress: string;
          username: string;
          password: string;
        };
      };

    return {
      title:
        responseData.title,
      model: {
        customerUuid: "",
        name:
          responseData.model.name,
        kana:
          responseData.model.kana,
        address1:
          responseData.model.address1,
        address2:
          responseData.model.address2,
        phoneNumber:
          responseData.model.phoneNumber,
        mailAddress:
          responseData.model.mailAddress,
        username:
          responseData.model.username,
        password:
          responseData.model.password,
        createdAt: "",
      },
    };
  }

  /**
   * アカウント名が既に存在するか確認する
   */
  public async existsByAccountName(accountName: string): Promise<boolean> {
    const params = new URLSearchParams({
      username: accountName,
    });

    const url = `/proxy-api/account/validate/username?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    /*
     * 409 Conflictは、
     * アカウント名が既に存在することを表す。
     */
    if (response.status === 409) {
      return true;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.log("========== API ERROR ==========");
      console.log("validate url:", url);
      console.log("validate status:", response.status);
      console.log("validate error body:", errorData);
      console.log("===============================");

      if (errorData.message) {
        throw new Error(errorData.message);
      }

      if (errorData.errors) {
        const messages = Object.values(errorData.errors).flat().join("\n");

        throw new Error(messages);
      }

      throw new Error(
        `アカウント名の確認に失敗しました (Status: ${response.status})`,
      );
    }

    /*
     * 200 OKの場合はレスポンスのexistsを使用する。
     *
     * バックエンドの正常レスポンス例:
     * {
     *   "exists": false,
     *   "message": "使用できるアカウント名です"
     * }
     */
    const responseData = (await response.json()) as {
      exists?: boolean;
    };

    return responseData.exists ?? false;
  }

  /**
   * メールアドレスが既に存在するか確認する
   */
  public async existsByMail(mail: string): Promise<boolean> {
    const params = new URLSearchParams({
      mailAddress: mail,
    });

    const url = `/proxy-api/account/validate/mail-address?${params.toString()}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    /*
     * 409 Conflictは、
     * アカウント名が既に存在することを表す。
     */
    if (response.status === 409) {
      return true;
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.log("========== API ERROR ==========");
      console.log("validate url:", url);
      console.log("validate status:", response.status);
      console.log("validate error body:", errorData);
      console.log("===============================");

      if (errorData.message) {
        throw new Error(errorData.message);
      }

      if (errorData.errors) {
        const messages = Object.values(errorData.errors).flat().join("\n");

        throw new Error(messages);
      }

      throw new Error(
        `メールアドレスの確認に失敗しました (Status: ${response.status})`,
      );
    }

    /*
     * 200 OKの場合はレスポンスのexistsを使用する。
     *
     * バックエンドの正常レスポンス例:
     * {
     *   "exists": false,
     *   "message": "使用できるアカウント名です"
     * }
     */
    const responseData = (await response.json()) as {
      exists?: boolean;
    };

    return responseData.exists ?? false;
  }

  /**
   * 担当者アカウントを登録する
   */
  public async create(
    Customer: Customer,
  ): Promise<CustomerCompleteResponse> {
    const url = "/proxy-api/account/complete";

    const requestBody = {
      name: Customer.name,
      kana: Customer.kana,
      address1: Customer.address1,
      address2: Customer.address2,
      phoneNumber: Customer.phoneNumber,
      mailAddress: Customer.mailAddress,
      username: Customer.username,
      password: Customer.password,
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));

      console.log("========== REGISTER EMPLOYEE ACCOUNT ==========");
      console.log("register url:", url);
      console.log("request body:", requestBody);
      console.log("status:", response.status);
      console.log("error body:", errorData);
      console.log("===============================================");

      if (errorData.message) {
        throw new Error(errorData.message);
      }

      if (errorData.errors) {
        const fieldErrors: {
          [key: string]: string;
        } = {};

        Object.entries(errorData.errors).forEach(([key, value]) => {
          const normalizedKey = key.charAt(0).toLowerCase() + key.slice(1);

          fieldErrors[normalizedKey] = Array.isArray(value)
            ? String(value[0])
            : String(value);
        });

        throw new Error(
          JSON.stringify({
            type: "validation",
            errors: fieldErrors,
          }),
        );
      }

      throw new Error(
        `担当者アカウントの登録に失敗しました (Status: ${response.status})`,
      );
    }

    const responseData = await response.json();

    return {
      title: responseData.title ?? "",
      message: responseData.message,
      customerUuid: responseData.customerUuid,
      name: responseData.name ?? Customer.name,
      username: responseData.username ?? Customer.username,
      createdAt: responseData.createdAt ?? "",
    };
  }
}
