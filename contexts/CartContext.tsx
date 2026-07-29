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

import { useCustomerAuth } from "@/components/hooks/useCustomerAuth";
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
  updateCartProduct: (
    product: ProductDetail,
  ) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

type CartProviderProps = {
  children: ReactNode;
};

const STORAGE_KEY = "product-cart";

const OWNER_STORAGE_KEY = "product-cart-owner";

const CUSTOMER_STORAGE_KEY_PREFIX = "product-cart:customer:";

export const CartProvider = ({ children }: CartProviderProps) => {
  const { username } = useCustomerAuth();

  const authenticatedUsername = normalizeUsername(username);

  const providerKey = authenticatedUsername
    ? `customer:${authenticatedUsername}`
    : "anonymous";

  return (
    <CartStateProvider
      key={providerKey}
      authenticatedUsername={authenticatedUsername}
    >
      {children}
    </CartStateProvider>
  );
};

type CartStateProviderProps = CartProviderProps & {
  authenticatedUsername: string | null;
};

type CartState = {
  cartOwner: string | null;
  cartItems: CartItem[];
};

type CartItemsUpdater = (
  currentItems: CartItem[],
) => CartItem[];

const CartStateProvider = ({
  authenticatedUsername,
  children,
}: CartStateProviderProps) => {
  const [cartState, setCartState] = useState<CartState>(
    () => createInitialCartState(authenticatedUsername),
  );

  const { cartOwner, cartItems } = cartState;

  const setCartItems = useCallback(
    (updater: CartItemsUpdater): void => {
      setCartState((currentState) => ({
        ...currentState,
        cartItems: updater(currentState.cartItems),
      }));
    },
    [],
  );

  /*
   * 現在表示中のかごと、顧客別のかごをlocalStorageへ保存する。
   */
  useEffect(() => {
    const storage = getLocalStorage();

    if (!storage) {
      return;
    }

    try {
      const serializedCart = JSON.stringify(cartItems);

      storage.setItem(STORAGE_KEY, serializedCart);

      if (cartOwner) {
        storage.setItem(OWNER_STORAGE_KEY, cartOwner);
        storage.setItem(
          getCustomerStorageKey(cartOwner),
          serializedCart,
        );
      }
    } catch (error) {
      console.error(
        "かご情報の読み込みに失敗しました",
        error,
      );
    }
  }, [cartItems, cartOwner]);

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
    [setCartItems],
  );

  /**
   * かごから商品を削除する
   */
  const removeCart = useCallback((productUuid: string): void => {
    setCartItems((currentItems) =>
      currentItems.filter((item) => item.product.productUuid !== productUuid),
    );
  }, [setCartItems]);

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
    [setCartItems],
  );

  /**
   * かごを空にする
   */
  const clearCart = useCallback((): void => {
    setCartItems(() => []);
  }, [setCartItems]);

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

  /**
 * かご内の商品情報を最新情報へ更新する
 */
  const updateCartProduct = useCallback(
    (product: ProductDetail): void => {
      setCartItems((currentItems) => {
        let hasChanged = false;

        const updatedItems =
          currentItems.map((item) => {
            if (
              item.product.productUuid !==
              product.productUuid
            ) {
              return item;
            }

            const isSameProduct =
              item.product.price === product.price
              && item.product.stockQuantity
              === product.stockQuantity
              && item.product.productName
              === product.productName
              && item.product.productImage
              === product.productImage;

            if (isSameProduct) {
              return item;
            }

            hasChanged = true;

            return {
              ...item,
              product,
            };
          });

        return hasChanged
          ? updatedItems
          : currentItems;
      });
    },
    [setCartItems],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      cartItems,
      totalQuantity,
      totalPrice,
      addCart,
      removeCart,
      updateCartQuantity,
      updateCartProduct,
      clearCart,
    }),
    [
      cartItems,
      totalQuantity,
      totalPrice,
      addCart,
      removeCart,
      updateCartQuantity,
      updateCartProduct,
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

const getLocalStorage = (): Storage | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    return null;
  }
};

const normalizeUsername = (
  value: string | null | undefined,
): string | null => {
  if (typeof value !== "string") {
    return null;
  }

  const normalizedUsername = value.trim();

  return normalizedUsername.length > 0
    ? normalizedUsername
    : null;
};

const getCustomerStorageKey = (username: string): string =>
  `${CUSTOMER_STORAGE_KEY_PREFIX}${encodeURIComponent(username)}`;

const createInitialCartState = (
  authenticatedUsername: string | null,
): CartState => {
  /*
   * Next.jsのサーバー側では、
   * windowとlocalStorageが存在しない。
   */
  const storage = getLocalStorage();

  if (!storage) {
    return {
      cartOwner: authenticatedUsername,
      cartItems: [],
    };
  }

  const storedOwner = readStoredOwner(storage);
  const activeCart = readStoredCart(storage, STORAGE_KEY);

  if (
    !authenticatedUsername ||
    authenticatedUsername === storedOwner
  ) {
    return {
      cartOwner: storedOwner,
      cartItems: activeCart,
    };
  }

  /*
   * 所有者情報がない従来形式または未ログイン時のかごは、
   * 最初にログインした顧客へ引き継ぐ。
   */
  if (!storedOwner) {
    return {
      cartOwner: authenticatedUsername,
      cartItems: activeCart,
    };
  }

  return {
    cartOwner: authenticatedUsername,
    cartItems: readStoredCart(
      storage,
      getCustomerStorageKey(authenticatedUsername),
    ),
  };
};

const readStoredOwner = (storage: Storage): string | null => {
  try {
    return normalizeUsername(storage.getItem(OWNER_STORAGE_KEY));
  } catch {
    return null;
  }
};

const readStoredCart = (
  storage: Storage,
  storageKey: string,
): CartItem[] => {
  try {
    const savedCart = storage.getItem(storageKey);

    if (!savedCart) {
      return [];
    }

    const parsedCart = JSON.parse(savedCart) as unknown;

    if (!Array.isArray(parsedCart)) {
      storage.removeItem(storageKey);

      return [];
    }

    return parsedCart as CartItem[];
  } catch (error) {
    console.error(
      "かご情報の読み込みに失敗しました",
      error,
    );

    try {
      storage.removeItem(storageKey);
    } catch {
      // localStorageを利用できない場合は空のかごとして扱う。
    }

    return [];
  }
};
