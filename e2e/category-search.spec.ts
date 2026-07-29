import { expect, test } from "@playwright/test";

/**
 * UC003 カテゴリ別商品検索 結合テスト
 *
 * 前提:
 * ・auth.setup.tsで顧客ログイン済み状態を保存している
 * ・テスト対象の商品カテゴリ、商品がDBに登録されている
 * ・playwright.config.tsでstorageStateが設定されている
 */

import type { Page } from "@playwright/test";

/**
 * ページネーションを順番に移動しながら、
 * 指定した商品が存在するか確認する。
 *
 * @param page PlaywrightのPage
 * @param productName 検索する商品名
 * @returns 商品が見つかった場合true
 */
const findProductAcrossPages = async (
  page: Page,
  productName: string,
): Promise<boolean> => {
  /**
   * 無限ループ防止用。
   *
   * 商品数が増えて100ページを超える可能性がある場合は
   * 数値を変更してください。
   */
  const maxPages = 100;

  for (let currentPage = 1; currentPage <= maxPages; currentPage++) {
    const product = page.getByText(productName, {
      exact: true,
    });

    /**
     * 現在のページに商品が存在するか確認する。
     *
     * isVisible()は要素が存在しない場合も
     * falseを返す。
     */
    if (
      await product
        .first()
        .isVisible()
        .catch(() => false)
    ) {
      return true;
    }

    /**
     * 次へボタンを取得する。
     *
     * 実際のボタン名が
     * 「次のページ」などの場合は変更してください。
     */
    const nextButton = page.getByRole("button", {
      name: "次へ",
    });

    /**
     * 次へボタンが存在しない場合は、
     * 現在のページが最終ページと判断する。
     */
    if ((await nextButton.count()) === 0) {
      return false;
    }

    /**
     * disabled属性とaria-disabledの
     * どちらにも対応する。
     */
    const isDisabled =
      (await nextButton.isDisabled()) ||
      (await nextButton.getAttribute("aria-disabled")) === "true";

    if (isDisabled) {
      return false;
    }

    /**
     * ページを移動する前の商品一覧を取得する。
     *
     * 画面に商品カード用のdata-testidがある場合は、
     * そちらを利用する方が安定する。
     */
    const productCards = page.locator('[data-testid="product-card"]');

    const beforeText = await productCards.allTextContents();

    await nextButton.click();

    /**
     * ページ番号の切り替え後、
     * 商品一覧の内容が更新されるまで待つ。
     */
    await expect
      .poll(async () => productCards.allTextContents())
      .not.toEqual(beforeText);
  }

  throw new Error(`ページ数が${maxPages}ページを超えました。`);
};

test.describe("UC003 カテゴリ別商品検索", () => {
  /**
   * テストで使用するデータ
   *
   * 実際にDBへ登録されているカテゴリ名・商品名へ
   * 変更してください。
   */
  const targetCategoryName = process.env.E2E_PRODUCT_CATEGORY_NAME ?? "食品";

  const targetProductName =
    process.env.E2E_CATEGORY_PRODUCT_NAME ?? "カリン　のど飴";

  const otherCategoryProductName =
    process.env.E2E_OTHER_CATEGORY_PRODUCT_NAME ?? "製図用シャープペンシル";

  test.beforeEach(async ({ page }) => {
    /**
     * 商品一覧画面へ遷移する。
     *
     * 実際の商品一覧画面が
     * /purchase以外の場合は変更してください。
     */
    await page.goto("/purchase");

    await expect(page).toHaveURL(/\/purchase/);
  });

  test("商品カテゴリを選択すると、そのカテゴリに属する商品のみ表示される", async ({
    page,
  }) => {
    /**
     * 商品カテゴリの選択欄を取得する。
     *
     * 画面側のlabelが
     * 「商品カテゴリ」ではなく
     * 「カテゴリ」の場合は変更してください。
     */
    const categorySelect = page.getByLabel("商品カテゴリ");

    await expect(categorySelect).toBeVisible();

    /**
     * 指定したカテゴリが選択肢に
     * 存在することを確認する。
     */
    await expect(
      categorySelect.locator("option", {
        hasText: targetCategoryName,
      }),
    ).toHaveCount(1);

    /**
     * カテゴリ検索APIのレスポンスを待ちながら
     * カテゴリを選択する。
     *
     * APIのURLが異なる場合は
     * response.url()の条件を変更してください。
     */
    const [searchResponse] = await Promise.all([
      page.waitForResponse(
        (response) =>
          response.url().includes("/api/products") &&
          response.request().method() === "GET",
      ),

      categorySelect.selectOption({
        label: targetCategoryName,
      }),
    ]);

    /**
     * バックエンドAPIが正常終了していることを確認する。
     */
    expect(searchResponse.ok()).toBeTruthy();

    expect(searchResponse.status()).toBe(200);

    /**
     * 選択したカテゴリの商品が表示されることを確認する。
     */
    const targetProductExists = await findProductAcrossPages(
      page,
      targetProductName,
    );

    expect(targetProductExists).toBeTruthy();

    /**
     * 別カテゴリの商品が表示されていないことを確認する。
     */
    await expect(
      page.getByText(otherCategoryProductName, {
        exact: true,
      }),
    ).toHaveCount(0);
  });

  test("カテゴリ未選択の場合は全商品が表示される", async ({ page }) => {
    const categorySelect = page.getByLabel("商品カテゴリ");

    await expect(categorySelect).toBeVisible();

    /**
     * 初期状態ではカテゴリが
     * 未選択であることを確認する。
     */
    await expect(categorySelect).toHaveValue("すべてのカテゴリ");

    /**
     * 異なるカテゴリの商品が
     * どちらも表示されることを確認する。
     */
    const targetProductExists = await findProductAcrossPages(
      page,
      targetProductName,
    );

    expect(targetProductExists).toBeTruthy();

    await expect(
      page.getByText(otherCategoryProductName, {
        exact: true,
      }),
    ).toBeVisible();
  });

  test("カテゴリを変更すると、変更後のカテゴリの商品一覧へ更新される", async ({
    page,
  }) => {
    const categorySelect = page.getByLabel("商品カテゴリ");

    await categorySelect.selectOption({
      label: targetCategoryName,
    });

    const targetProductExists = await findProductAcrossPages(
      page,
      targetProductName,
    );

    expect(targetProductExists).toBeTruthy();

    /**
     * 未選択へ戻す。
     *
     * 未選択optionのvalueが空文字でない場合は、
     * 実際のvalueへ変更してください。
     */
    await categorySelect.selectOption("");

    /**
     * 全件表示へ戻ったことを確認する。
     */
    const targetProductExists2 = await findProductAcrossPages(
      page,
      targetProductName,
    );

    expect(targetProductExists2).toBeTruthy();

    await expect(
      page.getByText(otherCategoryProductName, {
        exact: true,
      }),
    ).toBeVisible();
  });
});
