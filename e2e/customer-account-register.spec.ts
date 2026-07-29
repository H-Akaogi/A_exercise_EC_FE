import { expect, test, type Locator, type Page } from "@playwright/test";

/*
 * 顧客アカウント登録は未ログインで利用するため、
 * 認証済みstorageStateを使用しない。
 */
test.use({
  storageState: {
    cookies: [],
    origins: [],
  },
});

const ACCOUNT_FORM_URL = "/account/form";
const CUSTOMER_UUID = "30000000-0000-0000-0000-000000000001";
const FORM_TITLE = "顧客アカウント登録(入力)";

const validCustomer = {
  name: "山田 太郎",
  kana: "ヤマダ タロウ",
  address1: "東京都千代田区永田町1-2-3",
  address2: "メゾン永田町101",
  phoneNumber: "090-1234-5678",
  mailAddress: "e2e.customer@example.com",
  username: "e2ecustomer",
  password: "passE2E01",
};

type CustomerRequestBody = typeof validCustomer;

type CustomerApiMockOptions = {
  duplicateUsername?: string;
  duplicateMailAddress?: string;
  formStatus?: number;
  createStatus?: number;
  createValidationErrors?: Record<string, string[] | string>;
};

/**
 * UC001で使用する顧客アカウントAPIをモックする。
 *
 * 共有DBへ顧客データを登録せず、画面遷移・入力検証・
 * 重複確認・JSON送信をブラウザから確認する。
 */
const installCustomerApiMocks = async (
  page: Page,
  options: CustomerApiMockOptions = {},
) => {
  let createRequestCount = 0;
  let createRequestBody: CustomerRequestBody | null = null;

  await page.route("**/proxy-api/account/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());

    if (
      request.method() === "GET" &&
      url.pathname === "/proxy-api/account/form"
    ) {
      const status = options.formStatus ?? 200;

      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(
          status === 200
            ? {
                title: FORM_TITLE,
                model: {
                  name: "",
                  kana: "",
                  address1: "",
                  address2: null,
                  phoneNumber: "",
                  mailAddress: "",
                  username: "",
                  password: "",
                },
              }
            : {
                message: "顧客登録画面の初期情報を取得できませんでした。",
              },
        ),
      });
      return;
    }

    if (
      request.method() === "GET" &&
      url.pathname === "/proxy-api/account/validate/username"
    ) {
      const username = url.searchParams.get("username");
      const isDuplicate =
        options.duplicateUsername !== undefined &&
        username === options.duplicateUsername;

      await route.fulfill({
        status: isDuplicate ? 409 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          isDuplicate
            ? {
                exists: true,
                message: "このアカウント名は既に使用されています",
              }
            : {
                exists: false,
                message: "使用できるアカウント名です",
              },
        ),
      });
      return;
    }

    if (
      request.method() === "GET" &&
      url.pathname === "/proxy-api/account/validate/mail-address"
    ) {
      const mailAddress = url.searchParams.get("mailAddress");
      const isDuplicate =
        options.duplicateMailAddress !== undefined &&
        mailAddress === options.duplicateMailAddress;

      await route.fulfill({
        status: isDuplicate ? 409 : 200,
        contentType: "application/json",
        body: JSON.stringify(
          isDuplicate
            ? {
                exists: true,
                message: "このメールアドレスは既に登録されています",
              }
            : {
                exists: false,
                message: "使用できるメールアドレスです",
              },
        ),
      });
      return;
    }

    if (
      request.method() === "POST" &&
      url.pathname === "/proxy-api/account/complete"
    ) {
      createRequestCount++;
      createRequestBody = request.postDataJSON() as CustomerRequestBody;

      if (options.createValidationErrors) {
        await route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            title: "入力内容に誤りがあります。",
            errors: options.createValidationErrors,
          }),
        });
        return;
      }

      const status = options.createStatus ?? 201;

      await route.fulfill({
        status,
        contentType: "application/json",
        body: JSON.stringify(
          status === 201
            ? {
                title: "顧客アカウント登録完了",
                message: "顧客アカウントを登録しました。",
                customerUuid: CUSTOMER_UUID,
                name: createRequestBody.name,
                username: createRequestBody.username,
                createdAt: "2026-07-28T14:00:00+09:00",
              }
            : {
                message: "顧客アカウントの登録に失敗しました。",
              },
        ),
      });
      return;
    }

    await route.fulfill({
      status: 404,
      contentType: "application/json",
      body: JSON.stringify({
        message: `未定義のE2Eモックです: ${request.method()} ${url.pathname}`,
      }),
    });
  });

  return {
    getCreateRequestCount: () => createRequestCount,
    getCreateRequestBody: () => createRequestBody,
  };
};

type RegisterFormElements = {
  nameInput: Locator;
  kanaInput: Locator;
  address1Input: Locator;
  address2Input: Locator;
  phoneNumberInput: Locator;
  mailAddressInput: Locator;
  usernameInput: Locator;
  passwordInput: Locator;
  backButton: Locator;
  confirmButton: Locator;
};

const getRegisterFormElements = (page: Page): RegisterFormElements => ({
  /*
   * label内に「必須」の文字も含まれるため、
   * 入力欄は画面実装で定義されたidを使用する。
   */
  nameInput: page.locator("#name"),
  kanaInput: page.locator("#kana"),
  address1Input: page.locator("#address1"),
  address2Input: page.locator("#address2"),
  phoneNumberInput: page.locator("#phoneNumber"),
  mailAddressInput: page.locator("#mailAddress"),
  usernameInput: page.locator("#username"),
  passwordInput: page.locator("#password"),
  backButton: page.getByRole("button", {
    name: "戻る",
    exact: true,
  }),
  confirmButton: page.getByRole("button", {
    name: "確認する",
    exact: true,
  }),
});

const openRegisterPage = async (page: Page): Promise<void> => {
  await page.goto(ACCOUNT_FORM_URL);

  await expect(page).toHaveURL(ACCOUNT_FORM_URL);
  await expect(
    page.getByRole("heading", {
      name: FORM_TITLE,
      exact: true,
    }),
  ).toBeVisible();
};

const fillValidCustomer = async (page: Page): Promise<void> => {
  const {
    nameInput,
    kanaInput,
    address1Input,
    address2Input,
    phoneNumberInput,
    mailAddressInput,
    usernameInput,
    passwordInput,
  } = getRegisterFormElements(page);

  await nameInput.fill(validCustomer.name);
  await kanaInput.fill(validCustomer.kana);
  await address1Input.fill(validCustomer.address1);
  await address2Input.fill(validCustomer.address2);
  await phoneNumberInput.fill(validCustomer.phoneNumber);
  await mailAddressInput.fill(validCustomer.mailAddress);
  await usernameInput.fill(validCustomer.username);
  await passwordInput.fill(validCustomer.password);
};

const openConfirmModal = async (page: Page): Promise<Locator> => {
  await getRegisterFormElements(page).confirmButton.click();

  const dialog = page.getByRole("alertdialog");

  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("heading", {
      name: "顧客アカウントを登録しますか？",
      exact: true,
    }),
  ).toBeVisible();

  return dialog;
};

const registerFromConfirmModal = async (dialog: Locator): Promise<void> => {
  await dialog
    .getByRole("button", {
      name: "登録する",
      exact: true,
    })
    .click();
};

test.describe("UC001 顧客アカウント登録", () => {
  let apiMock: Awaited<ReturnType<typeof installCustomerApiMocks>>;

  test.beforeEach(async ({ page }) => {
    apiMock = await installCustomerApiMocks(page);
  });

  test("登録画面を初期表示する", async ({ page }) => {
    await openRegisterPage(page);

    const {
      nameInput,
      kanaInput,
      address1Input,
      address2Input,
      phoneNumberInput,
      mailAddressInput,
      usernameInput,
      passwordInput,
      backButton,
      confirmButton,
    } = getRegisterFormElements(page);

    await expect(nameInput).toHaveValue("");
    await expect(kanaInput).toHaveValue("");
    await expect(address1Input).toHaveValue("");
    await expect(address2Input).toHaveValue("");
    await expect(phoneNumberInput).toHaveValue("");
    await expect(mailAddressInput).toHaveValue("");
    await expect(usernameInput).toHaveValue("");
    await expect(passwordInput).toHaveValue("");
    await expect(backButton).toBeVisible();
    await expect(confirmButton).toBeVisible();
    await expect(page.getByRole("alertdialog")).toHaveCount(0);
  });

  test("必須項目を空のままフォーカスを外すとエラーを表示する", async ({
    page,
  }) => {
    await openRegisterPage(page);

    const {
      nameInput,
      kanaInput,
      address1Input,
      address2Input,
      phoneNumberInput,
      mailAddressInput,
      usernameInput,
      passwordInput,
    } = getRegisterFormElements(page);

    for (const input of [
      nameInput,
      kanaInput,
      address1Input,
      phoneNumberInput,
      mailAddressInput,
      usernameInput,
      passwordInput,
    ]) {
      await input.focus();
      await input.blur();
    }

    await expect(
      page.getByText("氏名を入力してください", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("氏名カナを入力してください", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("住所1を入力してください", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("電話番号を入力してください", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("メールアドレスを入力してください", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("アカウント名を入力してください", { exact: true }),
    ).toBeVisible();
    await expect(
      page.getByText("パスワードを入力してください", { exact: true }),
    ).toBeVisible();
    await expect(address2Input).toHaveAttribute("aria-invalid", "false");
  });

  test("文字数と文字種が不正な場合は登録せずエラーを表示する", async ({
    page,
  }) => {
    await openRegisterPage(page);

    const {
      nameInput,
      kanaInput,
      address1Input,
      address2Input,
      phoneNumberInput,
      mailAddressInput,
      usernameInput,
      passwordInput,
    } = getRegisterFormElements(page);

    await nameInput.fill("山田@");
    await kanaInput.fill("やまだ");
    await address1Input.fill("東京都千代田区@");
    await address2Input.fill("建物@");
    await phoneNumberInput.fill("09012345678");
    await mailAddressInput.fill("invalid-mail");
    await usernameInput.fill("user_01");
    await passwordInput.fill("pass-01");

    const dialog = await openConfirmModal(page);
    await registerFromConfirmModal(dialog);

    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText("氏名は全角・半角英数字で入力してください", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("氏名カナは全角カナで入力してください", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("住所1に使用できない文字が含まれています", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("住所2に使用できない文字が含まれています", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("電話番号は「XX-XXXX-XXXX」形式で入力してください", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("正しいメールアドレス形式で入力してください", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("アカウント名は半角英数字で入力してください", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByText("パスワードは半角英数字で入力してください", {
        exact: true,
      }),
    ).toBeVisible();
    expect(apiMock.getCreateRequestCount()).toBe(0);
  });

  test("メールアドレスとアカウント名の重複をフォーカス離脱時に表示する", async ({
    page,
  }) => {
    await page.unroute("**/proxy-api/account/**");
    await installCustomerApiMocks(page, {
      duplicateUsername: validCustomer.username,
      duplicateMailAddress: validCustomer.mailAddress,
    });
    await openRegisterPage(page);

    const { mailAddressInput, usernameInput } = getRegisterFormElements(page);

    await mailAddressInput.fill(validCustomer.mailAddress);
    await mailAddressInput.blur();
    await expect(
      page.getByText("このメールアドレスは既に登録されています", {
        exact: true,
      }),
    ).toBeVisible();

    await usernameInput.fill(validCustomer.username);
    await usernameInput.blur();
    await expect(
      page.getByText("このアカウント名は既に使用されています", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("正常値では入力画面のURLを保ったまま確認モーダルを表示する", async ({
    page,
  }) => {
    await openRegisterPage(page);
    await fillValidCustomer(page);

    const dialog = await openConfirmModal(page);

    await expect(page).toHaveURL(ACCOUNT_FORM_URL);
    await expect(dialog).toContainText(validCustomer.name);
    await expect(dialog).toContainText(validCustomer.kana);
    await expect(dialog).toContainText(validCustomer.mailAddress);
    await expect(dialog).toContainText(validCustomer.username);
  });

  test("確認モーダルから入力画面へ戻ると入力値を保持する", async ({ page }) => {
    await openRegisterPage(page);
    await fillValidCustomer(page);

    const dialog = await openConfirmModal(page);

    await dialog
      .getByRole("button", {
        name: "入力画面へ戻る",
        exact: true,
      })
      .click();

    await expect(dialog).not.toBeVisible();

    const {
      nameInput,
      kanaInput,
      address1Input,
      address2Input,
      phoneNumberInput,
      mailAddressInput,
      usernameInput,
      passwordInput,
    } = getRegisterFormElements(page);

    await expect(nameInput).toHaveValue(validCustomer.name);
    await expect(kanaInput).toHaveValue(validCustomer.kana);
    await expect(address1Input).toHaveValue(validCustomer.address1);
    await expect(address2Input).toHaveValue(validCustomer.address2);
    await expect(phoneNumberInput).toHaveValue(validCustomer.phoneNumber);
    await expect(mailAddressInput).toHaveValue(validCustomer.mailAddress);
    await expect(usernameInput).toHaveValue(validCustomer.username);
    await expect(passwordInput).toHaveValue(validCustomer.password);
  });

  test("登録成功後に完了モーダルを表示し送信内容を確認する", async ({
    page,
  }) => {
    await openRegisterPage(page);
    await fillValidCustomer(page);

    const confirmDialog = await openConfirmModal(page);
    await registerFromConfirmModal(confirmDialog);

    const completeDialog = page.getByRole("alertdialog");

    await expect(completeDialog).toBeVisible();
    await expect(
      completeDialog.getByRole("heading", {
        name: "顧客アカウントの登録が完了しました",
        exact: true,
      }),
    ).toBeVisible();
    await expect(completeDialog).toContainText(
      "顧客アカウントを登録しました。",
    );
    await expect(completeDialog).toContainText(validCustomer.name);
    await expect(completeDialog).toContainText(validCustomer.username);
    await expect(page).toHaveURL(ACCOUNT_FORM_URL);

    expect(apiMock.getCreateRequestCount()).toBe(1);
    expect(apiMock.getCreateRequestBody()).toEqual(validCustomer);
  });

  test("登録完了モーダルからログイン画面へ遷移する", async ({ page }) => {
    await openRegisterPage(page);
    await fillValidCustomer(page);

    const confirmDialog = await openConfirmModal(page);
    await registerFromConfirmModal(confirmDialog);

    const completeDialog = page.getByRole("alertdialog");
    await completeDialog
      .getByRole("button", {
        name: "ログインする",
        exact: true,
      })
      .click();

    await expect(page).toHaveURL("/login");
  });

  test("登録APIの入力エラーを該当項目に表示する", async ({ page }) => {
    await page.unroute("**/proxy-api/account/**");
    await installCustomerApiMocks(page, {
      createValidationErrors: {
        MailAddress: ["このメールアドレスは登録できません。"],
      },
    });
    await openRegisterPage(page);
    await fillValidCustomer(page);

    const dialog = await openConfirmModal(page);
    await registerFromConfirmModal(dialog);

    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText("このメールアドレスは登録できません。", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("登録API失敗時は入力画面にエラーメッセージを表示する", async ({
    page,
  }) => {
    await page.unroute("**/proxy-api/account/**");
    await installCustomerApiMocks(page, {
      createStatus: 500,
    });
    await openRegisterPage(page);
    await fillValidCustomer(page);

    const dialog = await openConfirmModal(page);
    await registerFromConfirmModal(dialog);

    await expect(dialog).not.toBeVisible();
    await expect(
      page.getByText("顧客アカウントの登録に失敗しました。", {
        exact: true,
      }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", {
        name: "顧客アカウントの登録が完了しました",
        exact: true,
      }),
    ).toHaveCount(0);
  });

  test("初期情報取得API失敗時はエラーメッセージを表示する", async ({
    page,
  }) => {
    await page.unroute("**/proxy-api/account/**");
    await installCustomerApiMocks(page, {
      formStatus: 500,
    });

    await page.goto(ACCOUNT_FORM_URL);

    await expect(
      page.getByText("顧客登録画面の初期情報を取得できませんでした。", {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("戻るボタンでトップ画面へ遷移する", async ({ page }) => {
    await openRegisterPage(page);

    await getRegisterFormElements(page).backButton.click();

    await expect(page).toHaveURL("/");
  });
});
