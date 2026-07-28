import type { NextConfig } from "next";

// const apiBaseUrl =
//   process.env.API_BASE_URL ??
//   "http://74.176.217.130";

const apiBaseUrl =
  process.env.API_BASE_URL ??
  "http://localhost:5100";

const nextConfig: NextConfig = {
  output: "standalone",

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname:
          "trainingstorage20260713.blob.core.windows.net",
        port: "",
        pathname:
          "/product-images/products/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        /**
         * UC002 顧客ログインAPI
         */
        source:
          "/proxy-api/login",
        destination:
          `${apiBaseUrl}/login`,
      },
      {
        /**
         * UC008 顧客ログアウトAPI
         */
        source:
          "/proxy-api/logout",
        destination:
          `${apiBaseUrl}/logout`,
      },
      {
        /**
         * 顧客アカウント登録API
         */
        source:
          "/proxy-api/account/:path*",
        destination:
          `${apiBaseUrl}/account/:path*`,
      },
      {
        /**
         * 商品一覧API
         */
        source:
          "/proxy-api/product/:path*",
        destination:
          `${apiBaseUrl}/product/:path*`,
      },
      {
        /**
         * 商品一覧API
         */
        source:
          "/proxy-api/products/:path*",
        destination:
          `${apiBaseUrl}/products/:path*`,
      },
      {
        /**
         * 購入API
         */
        source:
          "/proxy-api/purchase/complete/:path*",
        destination:
          `${apiBaseUrl}/purchase/complete/:path*`,
      },
      {
        /**
         * 商品一覧API
         */
        source:
          "/proxy-api/purchase/history/:path*",
        destination:
          `${apiBaseUrl}/purchase/history/:path*`,
      },
      {
        /**
         * カテゴリ一覧API
         */
        source:
          "/proxy-api/product-category/options",
        destination:
          `${apiBaseUrl}/product-category/options`,
      },
      {
        /**
         * 支払方法一覧API
         */
        source:
          "/proxy-api/payment-method/options",
        destination:
          `${apiBaseUrl}/payment-method/options`,
      },
    ];
  },
};

export default nextConfig;