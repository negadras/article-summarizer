import {QueryClient, QueryFunction} from "@tanstack/react-query";

// Backend API base URL - Spring Boot backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    let text: string;
    try {
      text = await res.text();
    } catch (readError) {
      // Final fallback if we can't read the response
      throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    }

    try {
      const errorData = JSON.parse(text);
      // Extract user-friendly message from backend error response
      const userMessage = errorData.message || errorData.details || res.statusText;
      throw new Error(userMessage);
    } catch (jsonError) {
      // Fallback if response isn't JSON
      throw new Error(text || res.statusText);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Prepend API base URL if the URL is relative
  const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

  const headers: Record<string, string> = {};

  if (data) {
    headers["Content-Type"] = "application/json";
  }

  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(fullUrl, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${API_BASE_URL}${url}`;

    const headers: Record<string, string> = {};
    const token = localStorage.getItem('authToken');
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const res = await fetch(fullUrl, {
      headers,
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
