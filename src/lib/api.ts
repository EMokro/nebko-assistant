const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface Tokens {
  accessToken: string;
  refreshToken: string;
}

let tokens: Tokens | null = null;

export function getStoredTokens(): Tokens | null {
  if (tokens) return tokens;
  const stored = localStorage.getItem("nebko_tokens");
  if (stored) {
    tokens = JSON.parse(stored);
    return tokens;
  }
  return null;
}

export function setTokens(t: Tokens) {
  tokens = t;
  localStorage.setItem("nebko_tokens", JSON.stringify(t));
}

export function clearTokens() {
  tokens = null;
  localStorage.removeItem("nebko_tokens");
  localStorage.removeItem("nebko_user");
}

async function refreshAccessToken(): Promise<string | null> {
  const t = getStoredTokens();
  if (!t?.refreshToken) return null;
  try {
    const res = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: t.refreshToken }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    setTokens({ accessToken: data.accessToken, refreshToken: t.refreshToken });
    return data.accessToken;
  } catch {
    return null;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const t = getStoredTokens();
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (t?.accessToken) {
    headers["Authorization"] = `Bearer ${t.accessToken}`;
  }

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  let res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401 && t?.refreshToken) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(`${API_BASE}${path}`, { ...options, headers });
    }
  }

  if (!res.ok) {
    const error = await res.text().catch(() => "Unknown error");
    throw new Error(`API Error ${res.status}: ${error}`);
  }

  const contentType = res.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return res.json();
  }
  return res as unknown as T;
}

// Auth
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export const authApi = {
  login: (email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (name: string, email: string, password: string) =>
    apiFetch<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    }),
};

// Real Estate
export interface RealEstateGroup {
  id: string;
  name: string;
  addressLineText: string;
}

export interface RealEstate {
  id: string;
  name: string;
  realEstateType: Record<string, unknown>;
  realEstateGroupId: string;
  realEstateGroup: Record<string, unknown>;
  address: Record<string, unknown>;
}

export interface RealEstateUnit {
  id: string;
  name: string;
  realEstateId: string;
}

export interface PersonOutput {
  personID: string;
  personTypeID: string;
  personTypeName: string;
  legalName: string;
}

export interface NebkoAssignment {
  assignmentYear: string;
  periodOfUseStart: string;
  periodOfUseEnd: string;
  billingPeriodStart: string;
  billingPeriodEnd: string;
  realEstateUnitId: string;
  realEstateGroupId: string;
  tenantIds: string[];
  co2Costs: number;
  advancedPayments: string[];
  nebkoPositions: string[];
  isValidatedByUser: boolean;
}

export interface DocumentOutput {
  id: string;
  documentTypeID?: string;
  documentType?: { id: string; name: string; description?: string };
  isProcessed: boolean;
  description?: string;
  originalname: string;
  documentDate?: string;
}

export interface RealEstateType {
  id: string;
  name: string;
}

export const realEstateApi = {
  getGroups: () => apiFetch<RealEstateGroup[]>("/realEstateGroup/all"),
  createGroup: (data: { name: string; addressLineText: string }) =>
    apiFetch<RealEstateGroup>("/realEstateGroup/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getAll: () => apiFetch<RealEstate[]>("/realEstate/all"),
  getTypes: () => apiFetch<RealEstateType[]>("/realEstateType"),
  create: (data: {
    name: string;
    realEstateTypeID: string;
    realEstateGroupId: string;
    address: { country: string; city: string; street: string; zip: string; houseNo: string };
  }) =>
    apiFetch<RealEstate>("/realEstate/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getUnits: () => apiFetch<RealEstateUnit[]>("/realEstateUnit/all"),
};

export const personApi = {
  getAll: () => apiFetch<PersonOutput[]>("/person/all"),
  getTypes: () => apiFetch<{ name: string }[]>("/person/types"),
  create: (data: {
    personTypeName: string;
    legalName: string;
    addressData: { country: string; city: string; street: string; zip: string; houseNo: string };
  }) =>
    apiFetch<unknown>("/person/create", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const documentApi = {
  getAllMetadata: () => apiFetch<DocumentOutput[]>("/document/all-metadata"),
  upload: (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    return apiFetch<unknown>("/document/upload", {
      method: "POST",
      body: formData,
    });
  },
};

export const generatorApi = {
  start: (data: {
    files: File[];
    realEstateUnitId: string;
    assignmentYear: string;
    periodOfUseStart: string;
    periodOfUseEnd: string;
    billingPeriodStart: string;
    billingPeriodEnd: string;
  }) => {
    const formData = new FormData();
    data.files.forEach((f) => formData.append("files", f));
    formData.append(
      "data",
      JSON.stringify({
        realEstateUnitId: data.realEstateUnitId,
        assignmentYear: data.assignmentYear,
        periodOfUseStart: data.periodOfUseStart,
        periodOfUseEnd: data.periodOfUseEnd,
        billingPeriodStart: data.billingPeriodStart,
        billingPeriodEnd: data.billingPeriodEnd,
      })
    );
    return apiFetch<unknown[]>("/generator/start", {
      method: "POST",
      body: formData,
    });
  },
};

export const nebkoApi = {
  getAssignment: (id: string) =>
    apiFetch<NebkoAssignment>(`/nebkoAssignment/${id}`),
  getAssignmentsForUnit: (unitId: string) =>
    apiFetch<NebkoAssignment[]>(`/realEstateUnit/${unitId}/nebko-assignments`),
};
