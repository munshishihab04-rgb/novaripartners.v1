const TOKEN_KEY = "admin_jwt_token";

export function getAdminToken(): string {
  return sessionStorage.getItem(TOKEN_KEY) || "";
}

export function setAdminToken(token: string) {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminSession() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isAdminAuthenticated(): boolean {
  const token = getAdminToken();
  if (!token) return false;
  try {
    // Decode payload (no verification — just check expiry client-side)
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

export async function adminFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAdminToken();
  const res = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers as Record<string, string> || {}),
    },
  });

  if (res.status === 401) {
    clearAdminSession();
    window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export type OrderStatus = "pending" | "paid" | "failed" | "cancelled";

export interface AdminOrder {
  id: string;
  sessionId: string;
  customerName: string;
  customerEmail: string;
  amountCents: number;
  currency: string;
  status: string;
  nexiSecurityToken: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  originalPrice: string | null;
  currency: string;
  platform: string;
  categoryId: number;
  categoryName: string | null;
  inStock: boolean;
  isFeatured: boolean;
  publisher: string;
  version: string;
  imageUrl: string | null;
  rating: string;
  reviewCount: number;
}

export interface AdminProductFull extends AdminProduct {
  description: string;
  shortDescription: string;
  features: string[];
  deliveryMethod: string;
}

export interface AdminProductExport extends AdminProductFull {
  categoryName: string | null;
}

export interface AdminCategory {
  id: number;
  name: string;
  slug: string;
}

export interface AdminStats {
  totalRevenueCents: number;
  totalRevenueEur: string;
  orderStats: Record<string, number>;
  totalOrders: number;
  inStockCount: number;
  outOfStockCount: number;
  totalProducts: number;
  recentOrders: AdminOrder[];
}

export interface AdminOrderDetail {
  id: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  currency: string;
  subtotalCents: number;
  couponCode: string | null;
  couponDiscountCents: number;
  shippingAmountCents: number;
  shippingMethodName: string | null;
  shippingMethodType: string | null;
  amountCents: number;
  items: Array<{
    productId: number;
    slug: string;
    name: string;
    price: string;
    quantity: number;
  }>;
  paymentProvider: string;
  nexiPaymentId: string | null;
  nexiTokenPresent: boolean;
  userId: number | null;
  userInfo: { email: string; firstName?: string; lastName?: string } | null;
}

export interface AdminMedia {
  id: number;
  filename: string;
  original_name: string;
  url: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

export interface ImportResult {
  updated: number;
  errors: string[];
  total: number;
}

export interface AdminAnalytics {
  monthlyRevenue: Array<{ month: string; revenue: number; orders: number }>;
  funnel: {
    pageViews: number;
    productViews: number;
    checkoutStarted: number;
    paidOrders: number;
  };
  sessions7d: number;
  sessions30d: number;
  pageViews30d: number;
  topPages: Array<{ page: string; views: number }>;
}

export interface VisitorEvent {
  type: string;
  page: string | null;
  productId: number | null;
  timestamp: string;
  sessionId: string;
}

export interface VisitorSession {
  sessionId: string;
  lastSeen: string;
  currentPage: string | null;
  pageHistory: Array<{ page: string; timestamp: string }>;
  events: Array<{ type: string; page: string | null; productId: number | null; timestamp: string }>;
}

export interface VisitorsData {
  visitors: VisitorSession[];
  events: VisitorEvent[];
  ts: number;
}

export const adminApi = {
  verify: (password: string) =>
    fetch("/api/admin/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    }),

  getStats: () => adminFetch<AdminStats>("/admin/stats"),

  getOrders: (status?: string) =>
    adminFetch<AdminOrder[]>(`/admin/orders${status && status !== "all" ? `?status=${status}` : ""}`),

  updateOrderStatus: (id: string, status: string) =>
    adminFetch<AdminOrder>(`/admin/orders/${id}`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  getProducts: () => adminFetch<AdminProduct[]>("/admin/products"),

  getProduct: (id: number) => adminFetch<AdminProductFull>(`/admin/products/${id}`),

  createProduct: (data: Partial<AdminProductFull> & { features: string[] }) =>
    adminFetch<AdminProductFull>("/admin/products", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  updateProduct: (id: number, data: Partial<AdminProductFull> & { features: string[] }) =>
    adminFetch<AdminProductFull>(`/admin/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  deleteProduct: (id: number) =>
    adminFetch<{ ok: boolean }>(`/admin/products/${id}`, { method: "DELETE" }),

  exportProducts: (ids?: number[], categoryId?: number) => {
    const params = new URLSearchParams();
    if (ids && ids.length > 0) params.set("ids", ids.join(","));
    else if (categoryId) params.set("categoryId", String(categoryId));
    const qs = params.toString();
    return adminFetch<AdminProductExport[]>(`/admin/products/export${qs ? `?${qs}` : ""}`);
  },

  importProducts: (products: Record<string, unknown>[]) =>
    adminFetch<ImportResult>("/admin/products/import", {
      method: "POST",
      body: JSON.stringify({ products }),
    }),

  getAnalytics: () => adminFetch<AdminAnalytics>("/admin/analytics"),

  getCategories: () => adminFetch<AdminCategory[]>("/admin/categories"),

  getVisitors: () => adminFetch<VisitorsData>("/admin/visitors"),

  getOrderDetail: (orderId: string) => adminFetch<AdminOrderDetail>(`/admin/orders/${orderId}`),

  getMedia: () => adminFetch<AdminMedia[]>("/admin/media"),

  uploadMedia: (file: File) =>
    new Promise<AdminMedia>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const dataBase64 = dataUrl.split(",")[1];
          const result = await adminFetch<AdminMedia>("/admin/media/upload", {
            method: "POST",
            body: JSON.stringify({ filename: file.name, mimeType: file.type, dataBase64 }),
          });
          resolve(result);
        } catch (e) { reject(e); }
      };
      reader.onerror = () => reject(new Error("File read error"));
      reader.readAsDataURL(file);
    }),

  deleteMedia: (id: number) => adminFetch<{ ok: boolean }>(`/admin/media/${id}`, { method: "DELETE" }),
};
