import { PurchaseSummary } from "@/models/PurchaseSummary";

export const formatPurchaseSummary = (
    summary: PurchaseSummary
): string => {

    return [
        `【${summary.title}】`,
        "",
        ...summary.details,
        "",
        `合計：${summary.totalPrice.toLocaleString()}円`
    ].join("\n");
};