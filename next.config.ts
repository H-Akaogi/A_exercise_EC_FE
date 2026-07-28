import type {
  NextConfig,
} from "next";

const apiBaseUrl = (
  process.env.API_BASE_URL ??
  "https://fullness-stationery.japaneast.cloudapp.azure.com/ec-api"
).replace(/\/+$/, "");

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
        source:
          "/proxy-api/login",
        destination:
          `${apiBaseUrl}/login`,
      },
      {
        source:
          "/proxy-api/logout",
        destination:
          `${apiBaseUrl}/logout`,
      },
      {
        source:
          "/proxy-api/account/:path*",
        destination:
          `${apiBaseUrl}/account/:path*`,
      },
      {
        source:
          "/proxy-api/product/:path*",
        destination:
          `${apiBaseUrl}/product/:path*`,
      },
      {
        source:
          "/proxy-api/products/:path*",
        destination:
          `${apiBaseUrl}/products/:path*`,
      },
      {
        source:
          "/proxy-api/purchase/complete/:path*",
        destination:
          `${apiBaseUrl}/purchase/complete/:path*`,
      },
      {
        source:
          "/proxy-api/purchase/history/:path*",
        destination:
          `${apiBaseUrl}/purchase/history/:path*`,
      },
      {
        source:
          "/proxy-api/product-category/options",
        destination:
          `${apiBaseUrl}/product-category/options`,
      },
      {
        source:
          "/proxy-api/payment-method/options",
        destination:
          `${apiBaseUrl}/payment-method/options`,
      },
    ];
  },
};

export default nextConfig;