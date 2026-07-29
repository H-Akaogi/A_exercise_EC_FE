import type { NextConfig } from "next";

const apiBaseUrl = (
  process.env.API_BASE_URL ??
  "https://fullness-stationery.japaneast.cloudapp.azure.com/ec-api"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  output: "standalone",

  /**
 * 管理フロントの /_next と競合しないようにする。
 *
 * 顧客フロントのJavaScript・CSSは
 * /ec-static/_next/static/... から配信される。
 */
  assetPrefix: "/ec-static",

  images: {
    path: "/ec-static/_next/image",

    remotePatterns: [
      {
        protocol: "https",
        hostname: "trainingstorage20260713.blob.core.windows.net",
        port: "",
        pathname: "/product-images/products/**",
      },
    ],
  },

  async rewrites() {
    return [
      {
        source: "/ec-proxy-api/login",
        destination: `${apiBaseUrl}/login`,
      },
      {
        source: "/ec-proxy-api/logout",
        destination: `${apiBaseUrl}/logout`,
      },
      {
        source: "/ec-proxy-api/account/:path*",
        destination: `${apiBaseUrl}/account/:path*`,
      },
      {
        source: "/ec-proxy-api/product/:path*",
        destination: `${apiBaseUrl}/product/:path*`,
      },
      {
        source: "/ec-proxy-api/products/:path*",
        destination: `${apiBaseUrl}/products/:path*`,
      },
      {
        source: "/ec-proxy-api/purchase/complete/:path*",
        destination: `${apiBaseUrl}/purchase/complete/:path*`,
      },
      {
        source: "/ec-proxy-api/purchase/history/:path*",
        destination: `${apiBaseUrl}/purchase/history/:path*`,
      },
      {
        source: "/ec-proxy-api/product-category/options",
        destination: `${apiBaseUrl}/product-category/options`,
      },
      {
        source: "/ec-proxy-api/payment-method/options",
        destination: `${apiBaseUrl}/payment-method/options`,
      },
    ];
  },
};

export default nextConfig;
