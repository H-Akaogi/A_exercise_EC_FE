// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { cleanup, render, screen } from "@testing-library/react";

import userEvent from "@testing-library/user-event";

import { createElement } from "react";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  isAuthenticated: false,
  logout: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mocks.push,
    replace: mocks.replace,
  }),
}));

vi.mock("@/contexts/CartContext", () => ({
  useCart: () => ({
    totalQuantity: 2,
  }),
}));

vi.mock("@/components/hooks/useCustomerAuth", () => ({
  useCustomerAuth: () => ({
    isAuthenticated: mocks.isAuthenticated,
    expiresAt: null,
    isInitialized: true,
    sessionMessage: null,
    login: vi.fn(),
    logout: mocks.logout,
    getAccessToken: vi.fn(),
    clearAuthentication: vi.fn(),
  }),
}));

import { Header } from "@/components/layout/Header";

describe("Header", () => {
  beforeEach(() => {
    mocks.isAuthenticated = false;
    mocks.logout.mockReset().mockResolvedValue(undefined);
    mocks.push.mockReset();
    mocks.replace.mockReset();
  });

  afterEach(() => {
    cleanup();
  });

  it("未ログイン時はアカウント登録とログインを表示する", () => {
    render(createElement(Header));

    expect(
      screen.getByRole("button", {
        name: "アカウント登録",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "ログイン",
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", {
        name: "ログアウト",
      }),
    ).toBeNull();
  });

  it("ログイン時は購入履歴とログアウトを表示する", () => {
    mocks.isAuthenticated = true;

    render(createElement(Header));

    expect(
      screen.getByRole("button", {
        name: "購入履歴",
      }),
    ).toBeVisible();
    expect(
      screen.getByRole("button", {
        name: "ログアウト",
      }),
    ).toBeVisible();
    expect(
      screen.queryByRole("button", {
        name: "ログイン",
      }),
    ).toBeNull();
    expect(
      screen.queryByRole("button", {
        name: "アカウント登録",
      }),
    ).toBeNull();
  });

  it("ログアウト後はログイン画面へ遷移する", async () => {
    mocks.isAuthenticated = true;
    const user = userEvent.setup();

    render(createElement(Header));

    await user.click(
      screen.getByRole("button", {
        name: "ログアウト",
      }),
    );

    expect(mocks.logout).toHaveBeenCalledOnce();
    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });

  it("ログアウトAPIが失敗してもログイン画面へ遷移する", async () => {
    mocks.isAuthenticated = true;
    mocks.logout.mockRejectedValue(new Error("システムエラー"));
    const user = userEvent.setup();

    render(createElement(Header));

    await user.click(
      screen.getByRole("button", {
        name: "ログアウト",
      }),
    );

    expect(mocks.replace).toHaveBeenCalledWith("/login");
  });
});
