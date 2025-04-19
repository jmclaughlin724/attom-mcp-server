// src/utils/fetcher.ts
import fetch from 'node-fetch';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function fetchAttom(
  path: string,
  query: Record<string, any> = {},
  overrides?: {
    method?: string;
    headers?: Record<string, string>;
    retries?: number;
  }
) {
  const baseUrl = process.env.ATTOM_API_BASE_URL ?? 'https://api.gateway.attomdata.com';
  const method = overrides?.method ?? 'GET';
  const finalHeaders = {
    Accept: 'application/json',
    apikey: process.env.ATTOM_API_KEY ?? 'DEMO_KEY',
    ...overrides?.headers,
  };

  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) qs.append(k, String(v));
  }

  let url = baseUrl + path;
  if (method === 'GET' && qs.toString()) {
    url += `?${qs}`;
  }

  let lastErr;
  const maxRetries = overrides?.retries ?? Number(process.env.ATTOM_API_RETRIES ?? '0');
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, { method, headers: finalHeaders });
      if (!res.ok) {
        throw new Error(`Attom error ${res.status}: ${res.statusText}`);
      }
      const data = await res.json() as Record<string, any>;
      // Check for API-level errors in the response
      if (data.status && data.status.code !== 0 && data.status.code !== '0') {
        throw new Error(`ATTOM API error: ${data.status.code} - ${data.status.msg ?? 'Unknown error'}`);
      }
      return data;
    } catch (err) {
      lastErr = err;
      // optionally do exponential backoff
    }
  }
  throw lastErr;
}
