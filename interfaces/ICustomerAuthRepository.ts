import type {
  CustomerLoginRequest,
  CustomerLoginResponse,
  CustomerLogoutResponse,
} from "@/models/CustomerAuth";

/**
 * 顧客認証APIとの通信を担うRepository。
 */
export interface ICustomerAuthRepository {
  login(request: CustomerLoginRequest): Promise<CustomerLoginResponse>;

  logout(accessToken: string): Promise<CustomerLogoutResponse>;
}
