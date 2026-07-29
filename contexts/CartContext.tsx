"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { ProductDetail } from "@/models/ProductDetail";

export type CartItem = {
  product: ProductDetail;
  quantity: number;
};

type CartContextValue = {
  cartItems: CartItem[];
  totalQuantity: number;
  totalPrice: number;
  addCart: (product: ProductDetail, quantity: number) => void;
  removeCart: (productUuid: string) => void;
  updateCartQuantity: (productUuid: string, quantity: number) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "product-cart";

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    /*
     * Next.jsのサーバー側では、
     * windowとlocalStorageが存在しない。
     */
    if (typeof window === "undefined") {
      return [];
    }

    const savedCart =
      window.localStorage.getItem(STORAGE_KEY);

    if (!savedCart) {
      return [];
    }

    try {
      return JSON.parse(savedCart) as CartItem[];
    } catch (error) {
      console.error(
        "かご情報の読み込みに失敗しました",
        error,
      );

      window.localStorage.removeItem(STORAGE_KEY);

      return [];
    }
  });

  /*
   * かごの変更をlocalStorageへ保存する。
   */
  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  /**
   * かごへ商品を追加する
   */
  const addCart = useCallback(
    (product: ProductDetail, quantity: number): void => {
      const stockQuantity = product.stockQuantity ?? 0;

      if (!Number.isInteger(quantity) || quantity <= 0) {
        throw new Error("購入個数は1以上の整数で指定してください");
      }

      if (stockQuantity <= 0) {
        throw new Error("在庫がないため追加できません");
      }

      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.product.productUuid === product.productUuid,
        );

        const currentQuantity = existingItem?.quantity ?? 0;

        const newQuantity = currentQuantity + quantity;

        if (newQuantity > stockQuantity) {
          throw new Error("在庫数を超えて追加できません");
        }

        if (existingItem) {
          return currentItems.map((item) =>
            item.product.productUuid === product.productUuid
              ? {
                ...item,
                product,
                quantity: newQuantity,
              }
              : item,
          );
        }

        return [
          ...currentItems,
          {
            product,
            quantity,
          },
        ];
      });
    },
    [],
  );

  /**
   * かごから商品を削除する
   */
  const removeCart = useCallback((productUuid: string): void => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.productUuid !== productUuid),
    );
  }, []);

  /**
   * かご内の商品数を変更する
   */
  const updateCartQuantity = useCallback(
    (productUuid: string, quantity: number): void => {
      if (!Number.isInteger(quantity) || quantity <= 0) {
        return;
      }

      setCartItems((currentItems) =>
        currentItems.map((item) => {
          if (item.product.productUuid !== productUuid) {
            return item;
          }

          const stockQuantity = item.product.stockQuantity;

          if (quantity > stockQuantity) {
            return item;
          }

          return {
            ...item,
            quantity,
          };
        }),
      );
    },
    [],
  );

  /**
   * かごを空にする
   */
  const clearCart = useCallback((): void => {
    setCartItems([]);
  }, []);

  /**
   * かご内の合計個数
   */
  const totalQuantity = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems],
  );

  /**
   * 合計金額
   */
  const totalPrice = useMemo(
    () =>
      cartItems.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0,
      ),
    [cartItems],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      totalQuantity,
      totalPrice,
      addCart,
      removeCart,
      updateCartQuantity,
      clearCart,
    }),
    [
      cartItems,
      totalQuantity,
      totalPrice,
      addCart,
      removeCart,
      updateCartQuantity,
      clearCart,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = (): CartContextValue => {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCartはCartProvider内で使用してください");
  }

  return context;
};
