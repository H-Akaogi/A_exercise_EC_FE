import { inject, injectable } from "inversify";

import { TYPES } from "@/di/types";

import type { ICustomerRepository } from "@/interfaces/ICustomerRepository";

import type { ICustomerService } from "@/interfaces/ICustomerService";

import type { Customer } from "@/models/Customer";

import type { CustomerFormResponse } from "@/models/CustomerFormResponse";

import type { CustomerCompleteResponse } from "@/models/CustomerCompleteResponse";

/**
 * 顧客アカウント登録Service
 */
@injectable()
export class CustomerService implements ICustomerService {
  constructor(
    @inject(TYPES.ICustomerRepository)
    private readonly customerRepository: ICustomerRepository,
  ) {}

  public async getForm(): Promise<CustomerFormResponse> {
    return await this.customerRepository.getForm();
  }

  public async existsByAccountName(accountName: string): Promise<boolean> {
    return await this.customerRepository.existsByAccountName(accountName);
  }

  public async existsByMail(mailAddress: string): Promise<boolean> {
    return await this.customerRepository.existsByMail(mailAddress);
  }

  public async create(customer: Customer): Promise<CustomerCompleteResponse> {
    return await this.customerRepository.create(customer);
  }
}
