import { endpoints } from "./endpoints";

export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export function getJwt(): string | null {
  return localStorage.getItem("jwt");
}

async function request<T>(url: string, method: HttpMethod, body?: any): Promise<T> {
  const jwt = getJwt();
  const headers: Record<string, string> = {};
  if (jwt) headers["Authorization"] = `Bearer ${jwt}`;
  if (body !== undefined) headers["Content-Type"] = "application/json";

  const res = await fetch(url, {
    method,
    headers,
    credentials: "include",
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  if (!res.ok) {
    let errText = "";
    try { errText = await res.text(); } catch {}
    throw new Error(`HTTP ${res.status}: ${errText || res.statusText}`);
  }
  return res.json();
}

export const api = {
  endpoints,
  get: <T>(url: string) => request<T>(url, "GET"),
  post: <T>(url: string, body?: any) => request<T>(url, "POST", body),
};
