/**
 * 顧客登録完了レスポンス
 */
export interface CustomerCompleteResponse {
    /**
     * 画面タイトル
     */
    title: string;

    /**
     * 完了メッセージ
     */
    message: string;

    /**
     * 顧客UUID
     */
    customerUuid: string;

    /**
     * 顧客名
     */
    name: string;

    /**
     * ユーザー名
     */
    username: string;

    /**
     * 登録日時
     */
    createdAt: string;
}