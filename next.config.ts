import type { NextConfig } from "next";

const apiBaseUrl =
  process.env.API_BASE_URL ??
  "http://74.176.217.130";

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
          "/proxy-api/products/:path*",
        destination:
          `${apiBaseUrl}/products/:path*`,
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
    ];
  },
};

export default nextConfig;