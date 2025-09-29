import { NextResponse } from 'next/server';
import { z, type ZodType } from 'zod';
import { consola } from 'consola';

/**
 * Validates an incoming request body against the provided Zod schema.
 *
 * @template T - The Zod schema type used for validation
 * @param body - The request body to validate, i.e. `req.json()`
 * @param schema - The Zod schema object detailing the expected structure and types of the request body
 * @returns The validated data with types inferred from the schema
 * @throws Returns a NextResponse status 400 error with field validation errors if parsing fails
 *
 * @usage
 * ```ts
 * const { docId } = validateRequestBody(body, schema);
 * ```
 */
export function validateRequestBody<T extends ZodType<any>>(body: any, schema: T): any {
  const parse = schema.safeParse(body);
  if (!parse.success) {
    consola.error('API Error Occurred');
    return NextResponse.json({ error: z.treeifyError(parse.error) }, { status: 400 });
  }
  return parse.data;
}

export type FetchOptions = RequestInit & {
  revalidate?: number | false;
  tags?: string[];
};

class ServerFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: any
  ) {
    super(message);
    this.name = 'ServerFetchError';
  }
}

/**
 * Server-side fetch wrapper with automatic base URL resolution and Next.js caching.
 * Only for use in Server Components, Server Actions, and Route Handlers.
 */
export async function cFetch<T = any>(
  path: string,
  options?: FetchOptions
): Promise<T> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!baseUrl) throw new Error('NEXT_PUBLIC_APP_URL environment variable is not set');

  // handle both absolute and relative paths
  const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;

  const { revalidate, tags, ...fetchOptions } = options || {};

  // default nextjs cache options
  const nextConfig: { revalidate?: number | false; tags?: string[]; } = {};
  if (revalidate !== undefined) nextConfig.revalidate = revalidate;
  if (tags) nextConfig.tags = tags;

  try {
    const res = await fetch(url, {
      ...fetchOptions,
      next: nextConfig,
      headers: {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      },
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new ServerFetchError(
        `Failed to fetch ${path}: ${res.statusText}`,
        res.status,
        errorText
      );
    }

    // handle empty responses
    const contentType = res.headers.get('content-type');
    if (!contentType?.includes('application/json')) return (await res.text()) as T;

    return await res.json();
  } catch (error) {
    if (error instanceof ServerFetchError) throw error;
    throw new Error(`Network error fetching ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function apiFetch<T = any>(path: string, options?: FetchOptions) {
  const FASTAPI_HOST = process.env.FASTAPI_HOST;
  if (!FASTAPI_HOST) throw new Error('FASTAPI_HOST env variable is unset');


  const { revalidate, tags, ...fetchOptions } = options || {};
  const nextConfig: { revalidate?: number | false; tags?: string[]; } = {};
  if (revalidate !== undefined) nextConfig.revalidate = revalidate;
  if (tags) nextConfig.tags = tags;

  const url = `${FASTAPI_HOST}${path.startsWith('/') ? '' : '/'}${path}`;
  const res = await fetch(url, {
    ...fetchOptions,
    next: nextConfig,
    headers: {
      'Content-Type': 'application/json',
      ...fetchOptions?.headers,
    },
  });
  if (!res.ok) throw new Error(`FastAPI error: ${res.statusText}`);

  return await res.json();
}