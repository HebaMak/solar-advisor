
const API_URL = 'http://localhost:8000'

async function api<T>(
  path: string,
  method = 'GET',
  body?: unknown
): Promise<T> {
  const csrfToken = sessionStorage.getItem('csrfToken')

  const response = await fetch(`${API_URL}${path}`, {
    method,
    credentials: 'include',
    headers: {
      ...(body !== undefined
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...(method !== 'GET' && method !== 'HEAD' && csrfToken
        ? { 'X-CSRF-Token': csrfToken }
        : {}),
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({}))
    throw new Error(error.detail || `Request failed (${response.status})`)
  }

  if (response.status === 204) {
    return undefined as T
  }

  return response.json()
}

export type Site = {
  id: number
  clientName: string
  address: string
  latitude: number
  longitude: number
  roofAreaM2?: number | null
  peakKwp: number
}

export type Production = {
  yearlyKwh: number
  monthlyKwh: {
    month: number
    kwh: number
  }[]
}

export type BatteryResult = {
  productionKwh: number
  consumptionKwh: number
  withoutBattery: {
    selfUsedKwh: number
    gridImportKwh: number
    exportedKwh: number
    selfConsumptionPercent: number
    selfSufficiencyPercent: number
  }
  withBattery: {
    selfUsedKwh: number
    gridImportKwh: number
    exportedKwh: number
    selfConsumptionPercent: number
    selfSufficiencyPercent: number
  }
}

export const authApi = {
  register: (email: string, password: string) =>
    api<{ email: string; csrfToken: string }>('/api/register', 'POST', {
      email,
      password,
    }),

  login: (email: string, password: string) =>
    api<{ email: string; csrfToken: string }>('/api/login', 'POST', {
      email,
      password,
    }),

  me: () => api<{ email: string }>('/api/me'),

  logout: () => api<void>('/api/logout', 'POST'),
}

export const sitesApi = {
  getAll: () => api<Site[]>('/api/sites'),

  create: (data: Omit<Site, 'id'>) =>
    api<Site>('/api/sites', 'POST', data),

  update: (id: number, data: Omit<Site, 'id'>) =>
    api<Site>(`/api/sites/${id}`, 'PUT', data),

  delete: (id: number) =>
    api<void>(`/api/sites/${id}`, 'DELETE'),

  production: (id: number) =>
    api<Production>(`/api/sites/${id}/production`),

  battery: (id: number, capacityKwh: number, annualUseKwh: number) =>
    api<BatteryResult>(
      `/api/sites/${id}/battery?capacityKwh=${capacityKwh}&annualUseKwh=${annualUseKwh}`
    ),
}
