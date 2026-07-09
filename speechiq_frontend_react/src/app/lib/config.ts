// 127.0.0.1 (not "localhost") on purpose: on some machines "localhost" resolves to the
// IPv6 loopback (::1) first, but uvicorn's default --host only binds IPv4 (127.0.0.1),
// so the browser's connection attempt gets refused before any HTTP request is sent.
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";
