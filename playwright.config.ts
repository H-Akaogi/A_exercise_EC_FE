import { defineConfig, devices } from "@playwright/test";

/**
 * 顧客システム Playwright E2Eテスト設定
 */
export default defineConfig({
  /**
   * E2Eテストを配置するフォルダ。
   */
  testDir: "./e2e",

  /**
   * Azure上の共通データベースや認証環境を使用するため、
   * テストファイル間も含めて並列実行しない。
   */
  fullyParallel: false,

  /**
   * ローカル・CIともに1ワーカーで順番に実行する。
   */
  workers: 1,

  /**
   * CIにtest.onlyが残っていた場合は失敗させる。
   */
  forbidOnly: Boolean(process.env.CI),

  /**
   * 共通Azure DBを更新するテストでは、
   * 再試行による二重登録を避ける。
   *
   * すべてのテストで後処理が保証されている場合は、
   * process.env.CI ? 1 : 0への変更を検討できる。
   */
  retries: 0,

  /**
   * 外部APIとの通信を考慮し、
   * 1テストのタイムアウトを60秒にする。
   */
  timeout: 60 * 1000,

  expect: {
    /**
     * 要素表示などの待機時間。
     */
    timeout: 10 * 1000,
  },

  /**
   * ローカルではHTMLレポートを開く。
   *
   * CIではコンソールにも結果を表示し、
   * HTMLレポートは自動で開かない。
   */
  reporter: process.env.CI
    ? [
        ["list"],
        [
          "html",
          {
            open: "never",
          },
        ],
      ]
    : [
        [
          "html",
          {
            open: "always",
          },
        ],
      ],

  use: {
    /**
     * page.goto("/login")や
     * page.goto("/purchase/history")のように、
     * パスだけでアクセスできる。
     */
    baseURL: "http://127.0.0.1:3000",

    /**
     * 失敗したテストのトレースを保存する。
     */
    trace: "retain-on-failure",

    /**
     * 失敗時の画面を保存する。
     */
    screenshot: "only-on-failure",

    /**
     * 失敗時の動画を保存する。
     */
    video: "retain-on-failure",
  },

  projects: [
    /**
     * 最初に顧客ログインを実行し、
     * CookieとlocalStorageを保存する。
     */
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },

    /**
     * 実際の顧客システムE2Eテスト。
     *
     * setupで保存した認証状態を、
     * 各テストの新しいBrowserContextへ読み込む。
     */
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/customer.json",
      },
      dependencies: ["setup"],
    },
  ],

  /**
   * E2Eテスト実行前にNext.jsを起動する。
   *
   * CI：
   * CI内でnpm run build済みなので、
   * 本番相当のnpm run startを使用する。
   *
   * ローカル：
   * 事前ビルドを不要にするため、
   * npm run devを使用する。
   */
  webServer: {
    command: process.env.CI ? "npm run start" : "npm run dev",

    url: "http://127.0.0.1:3000",

    reuseExistingServer: !process.env.CI,

    timeout: 120 * 1000,
  },
});
