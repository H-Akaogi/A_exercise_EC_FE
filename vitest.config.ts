import { defineConfig, configDefaults } from "vitest/config";
import { resolve } from "node:path";
export default defineConfig({
    test: {
        // テストを実行する環境。
        // Repository や Service は DOM を使わないため node でよい。
        // コンポーネントのテストを書く場合は "jsdom" にする。
        environment: "node",
        // describe / it / expect を import なしで使えるようにする。
        // ただし本演習では明示的に import しており、
        // どこから来た関数かがコードから読み取れるようにしている。
        globals: true,
        // Vitest の対象を tests ディレクトリに限定する。
        // 既定では **/*.spec.ts も拾うため、e2e ディレクトリの
        // Playwright のテストまで実行しようとして失敗する。
        include: ["tests/**/*.test.ts"],
        exclude: [...configDefaults.exclude, "e2e/**"],
    },
    resolve: {
        alias: {
            // アプリのコードと同じ「@/」でimportできるようにする。
            // tsconfig.json の paths とは別に、Vitest 側にも教える必要がある。
            "@": resolve(__dirname, "."),
        },
    },
});