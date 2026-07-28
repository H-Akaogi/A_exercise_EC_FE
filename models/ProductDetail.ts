/**
 * 商品詳細APIのレスポンス
 */
export type ProductDetail = {
    productUuid: string;
    productName: string;
    price: number;
    productImage: string;
    stockQuantity: number;
};