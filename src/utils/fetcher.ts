// src/utils/fetcher.ts
import { URLSearchParams } from 'url';
import { fetch } from 'undici'; // Use installed undici fetch
import { writeLog } from './logger.js'; // Import from new logger module
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Resolve project root (two levels up from this file) and load environment variables explicitly.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Fail fast if the required API key is not present. This prevents accidental use of the DEMO_KEY fallback.
if (!process.env.ATTOM_API_KEY) {
  throw new Error(
    'ATTOM_API_KEY not loaded – make sure .env exists at the project root and the process is started from that directory.'
  );
}

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
 * Helper function to replace path placeholders (e.g. {street}) with matching values from the query object.
 * Mutates a shallow clone of the original query object, leaving the input intact.
 *
 * @param rawPath Endpoint path potentially containing placeholders
 * @param query   Original query parameters
 * @returns Tuple of the final path and a query object with any consumed parameters removed
 */
function substitutePathParams(
  rawPath: string,
  query: Record<string, any>
): { path: string; remainingQuery: Record<string, any> } {
  if (!rawPath.includes('{')) {
    // Fast‑exit if no placeholders
    return { path: rawPath, remainingQuery: { ...query } };
  }

  const remaining: Record<string, any> = { ...query };
  let finalPath = rawPath;

  const placeholderRegex = /{([^}]+)}/g; // Matches {param}
  let match: RegExpExecArray | null;

  while ((match = placeholderRegex.exec(rawPath)) !== null) {
    const placeholder = match[0]; // e.g. {street}
    const keyRaw = match[1]; // e.g. street

    // Find the corresponding key in the query (case‑insensitive)
    const key = Object.keys(remaining).find(
      (k) => k.toLowerCase() === keyRaw.toLowerCase()
    );

    if (key && remaining[key] !== undefined && remaining[key] !== null) {
      const value = encodeURIComponent(String(remaining[key]));
      finalPath = finalPath.replace(placeholder, value);
      delete remaining[key];
    } else {
      // If we cannot resolve the placeholder, replace with '-' to satisfy ATTOM V2 path format
      finalPath = finalPath.replace(placeholder, '-');
      writeLog(
        `[Fetcher] Placeholder ${placeholder} not provided; substituting '-' in final path.`
      );
    }
  }

  return { path: finalPath, remainingQuery: remaining };
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

    // Substitute any {placeholder} tokens in the endpoint
    const substitution = substitutePathParams(path, query);
    path = substitution.path;
    query = substitution.remainingQuery;
    
    console.log(`[Fetcher] Final endpoint path after substitution: ${path}`);
  } catch (error) {
    console.error('[Fetcher] Error in path redirection/substitution:', error);
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
