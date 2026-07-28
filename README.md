# フロントエンド API一覧（顧客側）

フロントエンドからバックエンドAPIを呼び出すRepositoryおよびメソッドの一覧を記載します。

確認・完了処理は画面遷移を行わず、モーダルで表示します。  
そのため、確認画面表示のみを目的とするAPIは原則として使用しません。

---

## UC001 顧客アカウント登録

### Repository

~~~text
CustomerRepository
~~~

### 1. 顧客登録フォーム初期情報取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/account/form` |
| HTTPメソッド | GET |
| Repository | CustomerRepository |
| メソッド | `getForm()` |

#### 概要

顧客アカウント登録画面の初期表示に必要な情報を取得します。

取得したレスポンスを、フロントエンドの`CustomerFormResponse`へ変換します。

---

### 2. アカウント名重複確認

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/account/validate/username?username={username}` |
| HTTPメソッド | GET |
| Repository | CustomerRepository |
| メソッド | `existsByAccountName(accountName)` |

#### 概要

入力されたアカウント名が、すでに登録されているか確認します。

アカウント名入力欄からフォーカスが外れたとき、または確認ボタン押下前に呼び出します。

#### レスポンス判定

| ステータス | 処理 |
| --- | --- |
| `200 OK` | レスポンスの`exists`を使用する |
| `409 Conflict` | 登録済みとして`true`を返す |
| その他 | APIから返されたエラーメッセージを表示する |

---

### 3. メールアドレス重複確認

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/account/validate/mail-address?mailAddress={mailAddress}` |
| HTTPメソッド | GET |
| Repository | CustomerRepository |
| メソッド | `existsByMail(mailAddress)` |

#### 概要

入力されたメールアドレスが、すでに登録されているか確認します。

メールアドレス入力欄からフォーカスが外れたとき、または確認ボタン押下前に呼び出します。

#### レスポンス判定

| ステータス | 処理 |
| --- | --- |
| `200 OK` | レスポンスの`exists`を使用する |
| `409 Conflict` | 登録済みとして`true`を返す |
| その他 | APIから返されたエラーメッセージを表示する |

---

### 4. 顧客アカウント登録

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `POST /proxy-api/account/complete` |
| HTTPメソッド | POST |
| Repository | CustomerRepository |
| メソッド | `create(customer)` |

#### 概要

入力された顧客情報を使用して、顧客アカウントを登録します。

確認モーダルの「登録」ボタン押下時に呼び出します。

#### リクエスト項目

~~~text
name
kana
address1
address2
phoneNumber
mailAddress
username
password
~~~

#### 備考

確認画面へ遷移せず、入力内容はフロントエンドで保持して確認モーダルへ表示します。

---

## UC002 顧客ログイン

### Repository

~~~text
CustomerAuthRepository
SessionStorageCustomerAuthStore
~~~

現時点で確認できているコードだけでは、ログインAPIのエンドポイントを確定できません。

`CustomerAuthRepository`の実装を確認後、エンドポイントおよびメソッド名を確定します。

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `CustomerAuthRepositoryの実装確認後に確定` |
| HTTPメソッド | POST想定 |
| Repository | CustomerAuthRepository |
| メソッド | `login(...)`想定 |

### 概要

顧客のアカウント名とパスワードを使用して、ログイン認証を行います。

認証成功後は、取得したアクセストークンを顧客認証用ストアで保持します。

---

## UC003 カテゴリ別商品検索

### Repository

~~~text
ProductRepository
ProductCategoryRepository
~~~

### 1. 商品カテゴリ一覧取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/product-category/options` |
| HTTPメソッド | GET |
| Repository | ProductCategoryRepository |
| メソッド | `findAll()` |

#### 概要

商品一覧画面の初期表示時に、検索条件として使用する商品カテゴリ一覧を取得します。

APIレスポンスを次の形式へ変換します。

~~~text
value → categoryUuid
label → name
~~~

---

### 2. 全商品取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/product/search` |
| HTTPメソッド | GET |
| Repository | ProductRepository |
| メソッド | `findByCategory()` |

#### 概要

商品カテゴリを指定せず、購入可能な商品一覧を取得します。

商品一覧画面の初期表示時などに呼び出します。

---

### 3. カテゴリ別商品検索

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/product/search?productCategoryUuid={productCategoryUuid}` |
| HTTPメソッド | GET |
| Repository | ProductRepository |
| メソッド | `findByCategory(productCategoryUuid)` |

#### 概要

選択された商品カテゴリに属する商品一覧を取得します。

カテゴリが未指定、空文字、または空白のみの場合は、クエリパラメータを付けずに全件取得します。

---

## UC004 商品購入

商品購入機能では、商品詳細の表示とカートへの追加を行います。

### Repository

~~~text
ProductRepository
~~~

### 1. 商品詳細取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/products/detail/{productUuid}` |
| HTTPメソッド | GET |
| Repository | ProductRepository |
| メソッド | `findById(productUuid)` |

#### 概要

商品一覧で選択された商品の詳細情報を取得します。

商品UUIDはURLへ埋め込む前に、`encodeURIComponent()`でエンコードします。

#### レスポンス判定

| ステータス | 処理 |
| --- | --- |
| `200 OK` | 商品詳細を返す |
| `404 Not Found` | `null`を返す |

#### 注意

現在の実装では、404以外のAPIエラーを判定せず、レスポンスJSONをそのまま返しています。

将来的には、次のような`response.ok`の判定を追加する方が安全です。

~~~ts
if (!response.ok) {
    throw new Error(
        `商品詳細の取得に失敗しました (Status: ${response.status})`,
    );
}
~~~

---

### 2. 商品をカートへ追加

| 項目 | 内容 |
| --- | --- |
| エンドポイント | 使用しない |
| HTTPメソッド | なし |
| Repository | 使用しない |
| 処理 | フロントエンドのカート状態へ商品と数量を追加する |

#### 概要

商品詳細画面で選択された数量を、フロントエンドのカートへ追加します。

この時点では注文登録や在庫減少は行いません。

#### 備考

カート情報は、`CartContext`などのフロントエンド状態で管理します。

---

## UC005 購入確定

### Repository

~~~text
ProductRepository
PaymentMethodRepository
~~~

### 1. 支払い方法一覧取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/payment-method/options` |
| HTTPメソッド | GET |
| Repository | PaymentMethodRepository |
| メソッド | `findAll()` |

#### 概要

購入確認時に、選択可能な支払い方法一覧を取得します。

APIレスポンスを次の形式へ変換します。

~~~text
value → id
label → name
~~~

---

### 2. 購入確定

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `POST /proxy-api/purchase/complete` |
| HTTPメソッド | POST |
| Repository | ProductRepository |
| メソッド | `purchase(paymentMethodId, items)` |

#### 概要

選択された支払い方法と、カート内の商品一覧をまとめて送信し、購入を確定します。

確認モーダルの「購入する」ボタン押下時に呼び出します。

#### リクエスト例

~~~json
{
    "paymentMethodId": 1,
    "items": [
        {
            "productUuid": "product-uuid-001",
            "quantity": 2
        },
        {
            "productUuid": "product-uuid-002",
            "quantity": 1
        }
    ]
}
~~~

#### 認証

アクセストークンが存在する場合、次のヘッダーを付与します。

~~~text
Authorization: Bearer {accessToken}
~~~

アクセストークンがない場合はAPIを呼び出さず、認証情報を削除してログインが必要であることを通知します。

#### バックエンド側の処理

購入確定API内で、主に次の処理を行います。

~~~text
注文情報登録
注文明細登録
在庫数減少
~~~

#### ステータス別処理

| ステータス | 処理 |
| --- | --- |
| 200番台 | 購入完了として処理する |
| `401 Unauthorized` | 認証情報を削除し、再ログインを促す |
| `404 Not Found` | 商品または支払い方法が存在しない旨を表示する |
| その他 | APIから返されたエラー内容を表示する |

---

## UC006 購入キャンセル

購入キャンセルは、注文確定前のカート操作を指します。

### Repository

~~~text
使用しない
~~~

### 1. カート内商品の一部を削除

| 項目 | 内容 |
| --- | --- |
| エンドポイント | 使用しない |
| HTTPメソッド | なし |
| Repository | 使用しない |
| 処理 | フロントエンドのカート状態から対象商品を削除する |

#### 概要

指定した商品のみをカートから削除します。

購入確定前のため、バックエンドAPIは呼び出しません。

---

### 2. カート内商品をすべて削除

| 項目 | 内容 |
| --- | --- |
| エンドポイント | 使用しない |
| HTTPメソッド | なし |
| Repository | 使用しない |
| 処理 | フロントエンドのカート状態を空にする |

#### 概要

カート内の商品をすべて削除します。

注文がまだ登録されていないため、注文削除APIや在庫復元APIは使用しません。

---

## UC007 購入履歴閲覧

### Repository

~~~text
OrderRepository
~~~

### 1. 購入履歴一覧取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/purchase/history` |
| HTTPメソッド | GET |
| Repository | OrderRepository |
| メソッド | `findPurchaseHistory()` |

#### 概要

ログイン中の顧客に紐づく購入履歴を一覧形式で取得します。

#### 認証

有効なアクセストークンがある場合、次のヘッダーを付与します。

~~~text
Authorization: Bearer {accessToken}
~~~

#### レスポンス項目

~~~text
orderUuid
orderDate
orderStatus
totalPrice
detailUrl
~~~

#### ステータス別処理

| ステータス | 処理 |
| --- | --- |
| `200 OK` | 購入履歴一覧を表示する |
| `401 Unauthorized` | 認証情報を削除し、ログインを促す |
| その他 | APIから返されたエラー内容を表示する |

---

### 2. 購入履歴詳細取得

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `GET /proxy-api/purchase/history/{orderUuid}` |
| HTTPメソッド | GET |
| Repository | OrderRepository |
| メソッド | `findById(orderUuid)` |

#### 概要

指定された注文UUIDに対応する購入履歴詳細を取得します。

#### レスポンス項目

~~~text
orderUuid
orderDate
orderStatusId
orderStatusName
orderItems
totalPrice
~~~

#### 注文明細項目

~~~text
productUuid
productName
price
quantity
subtotal
~~~

#### ステータス別処理

| ステータス | 処理 |
| --- | --- |
| `200 OK` | 購入履歴詳細を表示する |
| `401 Unauthorized` | 認証情報を削除し、ログインを促す |
| `404 Not Found` | 購入履歴が見つからない旨を表示する |
| その他 | APIから返されたエラー内容を表示する |

---

## UC008 顧客ログアウト

### Repository

~~~text
CustomerAuthRepository
SessionStorageCustomerAuthStore
~~~

現時点で確認できているコードだけでは、ログアウトAPIのエンドポイントを確定できません。

`CustomerAuthRepository`の実装を確認後、エンドポイントおよびメソッド名を確定します。

| 項目 | 内容 |
| --- | --- |
| エンドポイント | `CustomerAuthRepositoryの実装確認後に確定` |
| HTTPメソッド | POST想定 |
| Repository | CustomerAuthRepository |
| メソッド | `logout()`想定 |

### 概要

ログイン中の顧客をログアウトします。

ログアウト後は、フロントエンドで保持しているアクセストークンおよび顧客認証情報を削除します。

---

# Repository一覧

| Repository | 役割 |
| --- | --- |
| CustomerRepository | 顧客アカウント登録、アカウント名・メールアドレス重複確認 |
| CustomerAuthRepository | 顧客ログイン、ログアウト、認証処理 |
| SessionStorageCustomerAuthStore | 顧客認証情報およびアクセストークンの保持 |
| ProductRepository | 商品一覧取得、商品詳細取得、購入確定 |
| ProductCategoryRepository | 商品カテゴリ一覧取得 |
| PaymentMethodRepository | 支払い方法一覧取得 |
| OrderRepository | 購入履歴一覧および購入履歴詳細取得 |

---

# APIを使用しない処理

次の処理は、バックエンドAPIを呼び出さず、フロントエンドの状態管理で実施します。

| 機能 | 処理 |
| --- | --- |
| 商品をカートへ追加 | カート状態へ商品と数量を追加する |
| カート商品の数量変更 | カート状態の数量を更新する |
| カート内の一部商品を削除 | 対象商品をカート状態から削除する |
| カートを空にする | カート状態を初期化する |
| 購入確認表示 | カート内容を確認モーダルへ表示する |
| 購入完了表示 | API成功後に完了モーダルを表示する |

---

# モーダル使用方針

顧客側フロントエンドでは、購入確認や購入完了のための画面遷移は行わず、モーダルを使用します。

基本的な処理フローは次のとおりです。

~~~text
商品をカートへ追加
↓
カート内容確認
↓
支払い方法選択
↓
購入確認モーダル表示
↓
購入確定API実行
↓
購入完了モーダル表示
↓
カートを空にする
~~~

購入確認モーダルを表示するだけのAPIは使用しません。

確認対象となる次の情報は、フロントエンドで保持します。

~~~text
購入商品
購入数量
商品単価
小計
合計金額
支払い方法
~~~

---