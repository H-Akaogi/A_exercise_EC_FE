import { expect, test } from "@playwright/test";

const BASE_URL = "http://localhost:3000";

const AUTH_STORAGE_KEY = "customer-auth-session";

const CART_STORAGE_KEY = "product-cart";

const ACCESS_TOKEN = "e2e-customer-access-token";

const EXPIRES_AT = "2099-07-27T12:30:00.000Z";

const USERNAME = "customerE2E";

const LOGIN_REQUEST = {
  mailAddress: "customer.e2e@example.com",
  password: "e2ePass5",
};

const CART_ITEMS = [
  {
    product: {
      productUuid: "10000000-0000-0000-0000-000000000001",
      productName: "E2Eテスト商品",
      price: 100,
      productImage: "",
      stockQuantity: 10,
    },
    quantity: 2,
  },
];

test.describe("UC002 顧客ログイン・UC008 顧客ログアウト", () => {
  test("ログイン後にJWTを保持し、ログアウト後もカートを保持する", async ({
    page,
  }) => {
    let loginRequest: unknown;
    let logoutAuthorization: string | undefined;

    await page.addInitScript(
      ({ cartStorageKey, cartItems }) => {
        window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
      },
      {
        cartStorageKey: CART_STORAGE_KEY,
        cartItems: CART_ITEMS,
      },
    );

    await page.route("**/ec-proxy-api/login", async (route) => {
      loginRequest = route.request().postDataJSON();

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          accessToken: ACCESS_TOKEN,
          expiresAt: EXPIRES_AT,
        }),
      });
    });

    await page.route("**/ec-proxy-api/logout", async (route) => {
      logoutAuthorization = route.request().headers().authorization;

      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          loggedOut: true,
        }),
      });
    });

    await page.route("**/ec-proxy-api/product/search", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: "[]",
      });
    });

    await page.goto(`${BASE_URL}/login`);

    await page.getByLabel("メールアドレス").fill(LOGIN_REQUEST.mailAddress);
    await page.getByLabel("パスワード").fill(LOGIN_REQUEST.password);
    await page
      .getByRole("main")
      .getByRole("button", {
        name: "ログイン",
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(`${BASE_URL}/`);
    expect(loginRequest).toEqual(LOGIN_REQUEST);
    await expect(
      page.getByRole("button", {
        name: "ログアウト",
        exact: true,
      }),
    ).toBeVisible();

    const savedSession = await page.evaluate(
      (authStorageKey) => window.sessionStorage.getItem(authStorageKey),
      AUTH_STORAGE_KEY,
    );

    expect(JSON.parse(savedSession ?? "null")).toEqual({
      accessToken: ACCESS_TOKEN,
      expiresAt: EXPIRES_AT,
    });

    await page
      .getByRole("button", {
        name: "ログアウト",
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    expect(logoutAuthorization).toBe(`Bearer ${ACCESS_TOKEN}`);

    const storageAfterLogout = await page.evaluate(
      ({ authStorageKey, cartStorageKey }) => ({
        authSession: window.sessionStorage.getItem(authStorageKey),
        cart: window.localStorage.getItem(cartStorageKey),
      }),
      {
        authStorageKey: AUTH_STORAGE_KEY,
        cartStorageKey: CART_STORAGE_KEY,
      },
    );

    expect(storageAfterLogout.authSession).toBeNull();
    expect(JSON.parse(storageAfterLogout.cart ?? "null")).toEqual(CART_ITEMS);
  });

  test("保護APIの401で認証情報を削除してログイン画面へ遷移する", async ({
    page,
  }) => {
    await page.addInitScript(
      ({ authStorageKey, accessToken, expiresAt }) => {
        window.sessionStorage.setItem(
          authStorageKey,
          JSON.stringify({
            accessToken,
            expiresAt,
          }),
        );
      },
      {
        authStorageKey: AUTH_STORAGE_KEY,
        accessToken: ACCESS_TOKEN,
        expiresAt: EXPIRES_AT,
      },
    );

    await page.route("**/ec-proxy-api/purchase/history", async (route) => {
      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: "{}",
      });
    });

    await page.goto(`${BASE_URL}/purchase/history`);

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    await expect(page.getByRole("main").getByRole("alert")).toHaveText(
      "セッションが切れました。再度ログインしてください",
    );

    const savedSession = await page.evaluate(
      (authStorageKey) => window.sessionStorage.getItem(authStorageKey),
      AUTH_STORAGE_KEY,
    );

    expect(savedSession).toBeNull();
  });

  test("購入確定へJWTを付け、401後もカートを保持する", async ({ page }) => {
    let purchaseAuthorization: string | undefined;

    await page.addInitScript(
      ({
        authStorageKey,
        accessToken,
        expiresAt,
        username,
        cartStorageKey,
        cartItems,
      }) => {
        window.sessionStorage.setItem(
          authStorageKey,
          JSON.stringify({
            accessToken,
            expiresAt,
            username,
          }),
        );
        window.localStorage.setItem(cartStorageKey, JSON.stringify(cartItems));
      },
      {
        authStorageKey: AUTH_STORAGE_KEY,
        accessToken: ACCESS_TOKEN,
        expiresAt: EXPIRES_AT,
        username: USERNAME,
        cartStorageKey: CART_STORAGE_KEY,
        cartItems: CART_ITEMS,
      },
    );

    await page.route("**/ec-proxy-api/payment-method/options", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            value: "1",
            label: "銀行振込",
          },
        ]),
      });
    });

    await page.route("**/ec-proxy-api/purchase/complete", async (route) => {
      purchaseAuthorization = route.request().headers().authorization;

      await route.fulfill({
        status: 401,
        contentType: "application/json",
        body: "{}",
      });
    });

    await page.goto(`${BASE_URL}/purchase`);

    await page.getByLabel("支払い方法").selectOption("1");
    await page
      .getByRole("button", {
        name: "購入を確定する",
      })
      .click();
    await page
      .getByRole("button", {
        name: "購入する",
        exact: true,
      })
      .click();

    await expect(page).toHaveURL(`${BASE_URL}/login`);
    expect(purchaseAuthorization).toBe(`Bearer ${ACCESS_TOKEN}`);

    const storageAfterUnauthorized = await page.evaluate(
      ({ authStorageKey, cartStorageKey }) => ({
        authSession: window.sessionStorage.getItem(authStorageKey),
        cart: window.localStorage.getItem(cartStorageKey),
      }),
      {
        authStorageKey: AUTH_STORAGE_KEY,
        cartStorageKey: CART_STORAGE_KEY,
      },
    );

    expect(storageAfterUnauthorized.authSession).toBeNull();
    expect(JSON.parse(storageAfterUnauthorized.cart ?? "null")).toEqual(
      CART_ITEMS,
    );
  });
});
