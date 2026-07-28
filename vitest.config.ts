import path from "node:path";
import { defineConfig, configDefaults } from "vitest/config";

export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "."),
        },
    },
    test: {
        environment: "node",
        setupFiles: ["./test/setup.ts"],

        fileParallelism: false,

        testTimeout: 10_000,

        hookTimeout: 10_000,

        exclude: [...configDefaults.exclude, "e2e/**"],
        coverage: {
            provider: "v8",
            reporter: ["text", "html"],

            include: [
                "services/CustomerService.ts",
                "services/OrderService.ts",
                "services/PaymentMethodService.ts",
                "services/ProductCategoryService.ts",
                "services/PurchaseProductService.ts",

                "infrastructures/CustomerRepository.ts",
                "infrastructures/ProductCategoryRepository.ts",
                "infrastructures/OrdersRepository.ts",
                "infrastructures/ProductRepository.ts",
                "infrastructures/PaymentMethodRepository.ts",


                "di/container.ts",
            ],

            exclude: [...configDefaults.exclude, "e2e/**"],

            thresholds: {
                lines: 100,
                branches: 100,
                functions: 100,
                statements: 100,
            },
        },
    },
});
