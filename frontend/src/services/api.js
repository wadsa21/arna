import axios from "axios";
import { useAuthStore } from "../store/authStore";
import { useSubscriptionStore } from "../store/subscriptionStore";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// Подставляем access-токен в каждый запрос
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Прозрачное обновление access-токена по 401
let refreshing = null;

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config;
    const { refreshToken, setTokens, logout } = useAuthStore.getState();

    if (
      error.response?.status === 401 &&
      !original._retry &&
      refreshToken
    ) {
      original._retry = true;
      try {
        refreshing =
          refreshing ||
          axios.post("/api/auth/refresh/", { refresh: refreshToken });
        const { data } = await refreshing;
        refreshing = null;
        setTokens({ access: data.access, refresh: data.refresh || refreshToken });
        original.headers.Authorization = `Bearer ${data.access}`;
        return api(original);
      } catch (e) {
        refreshing = null;
        logout();
        return Promise.reject(e);
      }
    }

    // Лимит/фича тарифа превышены — открываем глобальную модалку апгрейда
    const data = error.response?.data;
    if (error.response?.status === 403 && data?.error === "upgrade_required") {
      useSubscriptionStore.getState().openUpgrade({
        requiredPlan: data.required_plan,
        currentPlan: data.current_plan,
        message: data.detail,
      });
    }

    return Promise.reject(error);
  }
);

export default api;

// --- API-методы по доменам ----------------------------------------------
export const authApi = {
  login: (email, password) => api.post("/auth/login/", { email, password }),
  register: (payload) => api.post("/auth/register/", payload),
  me: () => api.get("/auth/me/"),
  updateMe: (payload) => api.patch("/auth/me/", payload),
};

export const childrenApi = {
  list: () => api.get("/children/"),
  create: (payload) => api.post("/children/", payload),
  update: (id, payload) => api.patch(`/children/${id}/`, payload),
  remove: (id) => api.delete(`/children/${id}/`),
};

export const scheduleApi = {
  list: (params) => api.get("/schedules/", { params }),
  retrieve: (id) => api.get(`/schedules/${id}/`),
  create: (payload) => api.post("/schedules/", payload),
  addItem: (scheduleId, payload) =>
    api.post(`/schedules/${scheduleId}/items/`, payload),
  copy: (scheduleId, target_dates) =>
    api.post(`/schedules/${scheduleId}/copy/`, { target_dates }),
  updateItem: (itemId, payload) =>
    api.patch(`/schedule-items/${itemId}/`, payload),
  removeItem: (itemId) => api.delete(`/schedule-items/${itemId}/`),
  completeItem: (itemId) => api.post(`/schedule-items/${itemId}/complete/`),
};

export const cardsApi = {
  list: (params) => api.get("/cards/", { params }),
  categories: () => api.get("/cards/categories/"),
  create: (formData) =>
    api.post("/cards/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  update: (id, payload) => api.patch(`/cards/${id}/`, payload),
  remove: (id) => api.delete(`/cards/${id}/`),
};

export const behaviorApi = {
  list: (params) => api.get("/behavior-logs/", { params }),
  create: (payload) => api.post("/behavior-logs/", payload),
  insights: (childId) =>
    api.get("/behavior-logs/insights/", { params: { child: childId } }),
};

export const notificationsApi = {
  list: () => api.get("/notifications/"),
  unreadCount: () => api.get("/notifications/unread_count/"),
  markRead: (id) => api.patch(`/notifications/${id}/read/`),
};

export const billingApi = {
  plans: () => api.get("/plans/"),
  subscription: () => api.get("/subscription/"),
  upgrade: (payload) => api.post("/subscription/upgrade/", payload),
  cancel: () => api.post("/subscription/cancel/"),
  history: () => api.get("/subscription/history/"),
  initiatePayment: (payload) => api.post("/payments/initiate/", payload),
  myReferral: () => api.get("/referral/my-code/"),
  referralStats: () => api.get("/referral/stats/"),
  validateReferral: (code) => api.post("/referral/validate/", { code }),
};
