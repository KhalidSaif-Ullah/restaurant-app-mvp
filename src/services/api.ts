const API_BASE_URL = 'http://192.168.100.41:5000/api';

type ApiOptions = {
  method?: string;
  token?: string;
  body?: unknown;
};

export async function apiRequest<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.token) {
    headers.Authorization = 'Bearer ' + options.token;
  }

  const response = await fetch(API_BASE_URL + endpoint, {
    method: options.method || 'GET',
    headers,
    ...(options.body !== undefined
      ? { body: JSON.stringify(options.body) }
      : {}),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || 'Request failed with status ' + response.status
    );
  }

  return data as T;
}