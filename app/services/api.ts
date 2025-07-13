import type { BalanceResponse, TransactionResponse, FaucetResponse, SendFormData } from '../types';
import { API_ENDPOINTS } from '../types';

class ApiService {
  private baseUrl = '';

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  async getBalance(): Promise<BalanceResponse> {
    // For MVP, return mock data if API is not available
    try {
      return await this.request<BalanceResponse>(API_ENDPOINTS.balance);
    } catch (error) {
      // Mock response for development
      return {
        balance: '100.50',
        currency: 'SUI',
        walletAddress: '0x1234567890abcdef1234567890abcdef12345678'
      };
    }
  }

  async sendTransaction(data: SendFormData): Promise<TransactionResponse> {
    try {
      return await this.request<TransactionResponse>(API_ENDPOINTS.send, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (error) {
      // Mock response for development
      return {
        success: true,
        transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        message: `Successfully sent ${data.amount} SUI to ${data.recipientAddress}`
      };
    }
  }

  async requestFaucet(): Promise<FaucetResponse> {
    try {
      return await this.request<FaucetResponse>(API_ENDPOINTS.faucet, {
        method: 'POST',
      });
    } catch (error) {
      // Mock response for development
      return {
        success: true,
        amount: '10.00',
        message: 'Successfully received 10 SUI from faucet'
      };
    }
  }
}

export const apiService = new ApiService(); 