import { SHEETS_API_KEY, SHEETS_BASE_URL } from './config';
import { DashboardSummary, Product, Sale } from '@types';

type ApiResponse<T> = { ok: true; data: T } | { ok: false; error: string };

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const res = await fetch(`${SHEETS_BASE_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': SHEETS_API_KEY,
        ...(init?.headers ?? {})
      }
    });
    if (!res.ok) {
      const text = await res.text();
      return { ok: false, error: text || `HTTP ${res.status}` };
    }
    const json = (await res.json()) as T;
    return { ok: true, data: json };
  } catch (e: any) {
    return { ok: false, error: e?.message ?? 'Network error' };
  }
}

export const SheetsApi = {
  async listProducts(): Promise<Product[]> {
    const res = await request<Product[]>(`/?path=products`);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async recordSale(input: { product: string; quantity: number }): Promise<{ newQuantity: number; sale: Sale }> {
    const res = await request<{ newQuantity: number; sale: Sale }>(`/?path=sales`, {
      method: 'POST',
      body: JSON.stringify(input)
    });
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async salesHistory(): Promise<Sale[]> {
    const res = await request<Sale[]>(`/?path=sales`);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  },

  async summary(period: 'weekly' | 'monthly' = 'weekly'): Promise<DashboardSummary> {
    const res = await request<DashboardSummary>(`/?path=summary&period=${period}`);
    if (!res.ok) throw new Error(res.error);
    return res.data;
  }
};


