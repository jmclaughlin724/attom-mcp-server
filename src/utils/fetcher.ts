// src/utils/fetcher.ts
import { URLSearchParams } from 'url';
import { fetch } from 'undici'; // Use installed undici fetch
import { writeLog } from './logger.js'; // Import from new logger module
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

/**
 * Helper function to build the request URL
 */
function buildRequestUrl(baseUrl: string, path: string, method: string, query: Record<string, any>): string {
  const qs = new URLSearchParams();
  
  console.log('[buildRequestUrl] Raw query parameters:', JSON.stringify(query));
  
  for (const [k, v] of Object.entries(query)) {
    if (v !== undefined && v !== null) {
      qs.append(k, String(v));
      console.log(`[buildRequestUrl] Adding parameter: ${k}=${String(v)}`);
    }
  }

  let url = baseUrl + path;
  if (method === 'GET' && qs.toString()) {
    url += `?${qs}`;
  }
  
  console.log('[buildRequestUrl] FULL URL:', url);
  return url;
}

/**
 * Helper function to handle response processing
 */
async function processResponse(res: any, url: string): Promise<Record<string, any>> {
  if (!res.ok) {
    const errorText = await res.text();
    const errorPayload = {
      message: `Attom API Error: ${res.status} ${res.statusText}`,
      url,
      status: res.status,
      statusText: res.statusText,
      body: errorText
    };
    const fetchError = new Error(errorPayload.message);
    (fetchError as any).details = errorPayload;
    throw fetchError;
  }
  
  const data = await res.json() as Record<string, any>;
  // Check for API-level errors in the response
  if (data.status && data.status.code !== 0 && data.status.code !== '0') {
    throw new Error(`ATTOM API error for ${url}: ${data.status.code} - ${data.status.msg ?? 'Unknown error'}`);
  }
  return data;
}

/**
 * Helper function to handle the final error after all retries fail
 */
function handleFinalError(err: unknown, maxRetries: number, url: string): never {
  if (err instanceof Error) {
    err.message = `Failed after ${maxRetries + 1} attempts. Last URL: ${url}. Error: ${err.message}`;
    throw err;
  } else {
    throw new Error(`Failed after ${maxRetries + 1} attempts. Last URL: ${url}. Error details: ${JSON.stringify(err)}`);
  }
}

/**
 * Main function to fetch data from ATTOM API with retry logic
 */
export async function fetchAttom(
  path: string,
  query: Record<string, any> = {},
  overrides?: {
    method?: string;
    headers?: Record<string, string>;
    retries?: number;
  }
) {
  try {
    // Handle POI endpoint path redirection
    // This ensures compatibility between old (/v4/poi/search) and new (/v4/neighborhood/poi) paths
    console.log(`[Fetcher] Original endpoint path: ${path}`);
    console.log(`[Fetcher] Query parameters: ${JSON.stringify(query)}`);
    
    if (path === '/v4/poi/search') {
      console.log('[Fetcher] Redirecting POI request from /v4/poi/search to /v4/neighborhood/poi');
      path = '/v4/neighborhood/poi';
    }
    
    console.log(`[Fetcher] Final endpoint path: ${path}`);
  } catch (error) {
    console.error('[Fetcher] Error in path redirection:', error);
  }
  const baseUrl = process.env.ATTOM_API_BASE_URL ?? 'https://api.gateway.attomdata.com';
  const method = overrides?.method ?? 'GET';
  const finalHeaders = {
    Accept: 'application/json',
    apikey: process.env.ATTOM_API_KEY ?? 'DEMO_KEY',
    ...overrides?.headers,
  };

  const url = buildRequestUrl(baseUrl, path, method, query);
  const maxRetries = overrides?.retries ?? Number(process.env.ATTOM_API_RETRIES ?? '0');
  
  let lastErr: unknown = null;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      writeLog(`[Fetcher] ${method} ${url}`);
      const res = await fetch(url, { method, headers: finalHeaders });
      return await processResponse(res, url);
    } catch (err) {
      lastErr = err;
      writeLog(`[Fetcher] Attempt ${attempt + 1} failed for ${method} ${url}: ${err instanceof Error ? err.message : String(err)}`);
      
      if (attempt < maxRetries) {
        // Exponential backoff
        const delay = 500 * Math.pow(2, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // If all retries failed
  if (lastErr) {
    return handleFinalError(lastErr, maxRetries, url);
  } else {
    // Should not happen if loop runs at least once, but handle defensively
    throw new Error(`Fetch failed for ${url} with no specific error captured.`);
  }
}
