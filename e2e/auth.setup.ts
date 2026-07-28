import {
    expect,
    test as setup,
} from "@playwright/test";
import path from "node:path";

const authFile = path.join(
    __dirname,
    ".auth/customer.json",
);

setup(
    "登録済み顧客としてログインする",
    async ({ page }) => {
        const mailAddress =
            process.env
                .E2E_CUSTOMER_MAIL_ADDRESS;

        const password =
            process.env
                .E2E_CUSTOMER_PASSWORD;

        if (!mailAddress) {
            throw new Error(
                "E2E_CUSTOMER_MAIL_ADDRESSが設定されていません。",
            );
        }

        if (!password) {
            throw new Error(
                "E2E_CUSTOMER_PASSWORDが設定されていません。",
            );
        }

        await page.goto(
            "/login",
        );

        await page
            .getByLabel(
                "メールアドレス",
            )
            .fill(
                mailAddress,
            );

        await page
            .getByLabel(
                "パスワード",
            )
            .fill(
                password,
            );

        await page
            .getByRole(
                "button",
                {
                    name:
                        "ログイン",
                },
            )
            .click();

        /**
         * 実際のログイン後URLに合わせる。
         * トップ画面が "/" ならこのままでよい。
         */
        await expect(
            page,
        ).toHaveURL(
            "/",
        );

        await page
            .context()
            .storageState({
                path: authFile,
            });
    },
);