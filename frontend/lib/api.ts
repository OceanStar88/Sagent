import type { AuthUser, CallDetail, CallSummary, Contact, MessageResponse, SettingsPayload, SignupResponse, TokenResponse, UserPreferencesPayload } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/v1";

type RequestOptions = RequestInit & {
  token?: string | null;
};

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const isFormDataBody = typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormDataBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.token) {
    headers.set("Authorization", `Bearer ${options.token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

async function getErrorMessage(response: Response): Promise<string> {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { detail?: unknown; message?: unknown };

    if (typeof payload.detail === "string") {
      return payload.detail;
    }

    if (Array.isArray(payload.detail)) {
      const validationMessage = payload.detail
        .map((item) => {
          if (typeof item === "string") {
            return item;
          }

          if (item && typeof item === "object" && "msg" in item && typeof item.msg === "string") {
            return item.msg;
          }

          return null;
        })
        .filter((item): item is string => Boolean(item))
        .join(" ");

      if (validationMessage) {
        return validationMessage;
      }
    }

    if (typeof payload.message === "string") {
      return payload.message;
    }
  }

  const errorBody = await response.text();
  return errorBody || "Request failed";
}

export function getObserverWebSocketUrl(callId: string, token: string): string {
  const base = API_BASE_URL.replace(/\/v1$/, "");
  const wsBase = base.replace(/^http/, "ws");
  return `${wsBase}/ws/observe/${callId}?token=${encodeURIComponent(token)}`;
}

export function login(email: string, password: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export function signup(firstName: string, lastName: string, email: string, password: string): Promise<SignupResponse> {
  return apiRequest<SignupResponse>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ first_name: firstName, last_name: lastName, email, password }),
  });
}

export function googleSignIn(idToken: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/google/signin", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export function googleSignUp(idToken: string): Promise<TokenResponse> {
  return apiRequest<TokenResponse>("/auth/google/signup", {
    method: "POST",
    body: JSON.stringify({ id_token: idToken }),
  });
}

export function verifyEmail(token: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/verify-email", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
}

export function resendVerification(email: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/resend-verification", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function requestPasswordReset(email: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string): Promise<MessageResponse> {
  return apiRequest<MessageResponse>("/auth/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, password }),
  });
}

export function getCurrentUser(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/me", { token });
}

export function uploadAvatar(token: string, file: File): Promise<AuthUser> {
  const formData = new FormData();
  formData.append("file", file);
  return apiRequest<AuthUser>("/auth/avatar", {
    method: "POST",
    token,
    body: formData,
  });
}

export function deleteAvatar(token: string): Promise<AuthUser> {
  return apiRequest<AuthUser>("/auth/avatar", {
    method: "DELETE",
    token,
  });
}

export function getUserPreferences(token: string): Promise<UserPreferencesPayload> {
  return apiRequest<UserPreferencesPayload>("/auth/preferences", { token });
}

export function updateUserPreferences(token: string, payload: UserPreferencesPayload): Promise<UserPreferencesPayload> {
  return apiRequest<UserPreferencesPayload>("/auth/preferences", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}

export function getCalls(token: string): Promise<CallSummary[]> {
  return apiRequest<CallSummary[]>("/calls", { token });
}

export function getCallDetail(token: string, callId: string): Promise<CallDetail> {
  return apiRequest<CallDetail>(`/calls/${callId}`, { token });
}

export function startOutboundCall(token: string, payload: { to_number: string; from_number: string }) {
  return apiRequest<{ call_id: string; status: string }>("/calls/outbound", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function endCall(token: string, callId: string) {
  return apiRequest<{ call_id: string; status: string }>(`/calls/${callId}/end`, {
    method: "POST",
    token,
  });
}

export function getContacts(token: string): Promise<Contact[]> {
  return apiRequest<Contact[]>("/contacts", { token });
}

export function createContact(token: string, payload: { name: string; phone_number: string }) {
  return apiRequest<Contact>("/contacts", {
    method: "POST",
    token,
    body: JSON.stringify(payload),
  });
}

export function deleteContact(token: string, contactId: string) {
  return apiRequest<void>(`/contacts/${contactId}`, {
    method: "DELETE",
    token,
  });
}

export function getSettings(token: string): Promise<SettingsPayload> {
  return apiRequest<SettingsPayload>("/settings", { token });
}

export function updateSettings(token: string, payload: SettingsPayload): Promise<SettingsPayload> {
  return apiRequest<SettingsPayload>("/settings", {
    method: "PUT",
    token,
    body: JSON.stringify(payload),
  });
}
