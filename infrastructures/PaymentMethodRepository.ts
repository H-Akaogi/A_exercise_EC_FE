import { injectable } from "inversify";

import type { IPaymentMethodRepository } from "@/interfaces/IPaymentMethodRepository";
import type { PaymentMethod } from "@/models/PaymentMethod";

@injectable()
export class PaymentMethodRepository implements IPaymentMethodRepository {
  public async findAll(): Promise<PaymentMethod[]> {
    const url = "/proxy-api/payment-method/options";

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      credentials: "include",
      cache: "no-store",
    });

    if (!response.ok) {
      const errorData = (await response.json().catch(() => ({}))) as {
        message?: string;
        detail?: string;
        title?: string;
      };

      throw new Error(
        errorData.message ??
          errorData.detail ??
          errorData.title ??
          `カテゴリ一覧の取得に失敗しました (Status: ${response.status})`,
      );
    }

    const responseData = (await response.json()) as {
      value: string;
      label: string;
    }[];

    return responseData.map((paymentMethod) => ({
      id: Number(paymentMethod.value),

      name: paymentMethod.label,
    }));
  }
}
