// src/api/http.js
import axios from "axios";

const BASE_URL = "http://localhost:3000";

// Main client used everywhere
const http = axios.create({
  baseURL: BASE_URL,
  withCredentials: true, // REQUIRED for HttpOnly cookie round-trips
});

// A bare instance (no interceptors) to call /auth/refresh from inside the interceptor
const bare = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
});

// Avoid retry-loops. We only retry once per request.
http.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { response, config } = error || {};
    if (!response || !config) throw error;

    const is401 = response.status === 401;
    const alreadyRetried = config.__isRetryRequest;
    const isAuthEndpoint = /\/api\/auth\/(me|refresh|logout|url-login|consume)/.test(config.url || "");

    if (is401 && !alreadyRetried && !isAuthEndpoint) {
      try {
        // rotate access using refresh cookie
        await bare.post("/api/auth/refresh");
        const retryCfg = { ...config, __isRetryRequest: true };
        return http.request(retryCfg);
      } catch {
        // refresh failed — bubble the original 401
      }
    }
    throw error;
  }
);

export default http;
