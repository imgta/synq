import { NextRequest, NextResponse } from 'next/server';
import { validateRequestBody } from '@/api';
import { z } from 'zod';

const { FASTAPI_HOST } = process.env;

const naicsDataSchema = z.object({
  force_refresh: z
    .string()
    .optional()
    .transform(val => val === 'true'),
});

export async function GET(req: NextRequest) {
  try {
    if (!FASTAPI_HOST) {
      return NextResponse.json(
        { error: 'FASTAPI_HOST environment variable not configured' },
        { status: 500 }
      );
    }
    // extract and validate query params
    const { searchParams } = req.nextUrl;
    const queryData = validateRequestBody(
      { force_refresh: searchParams.get('force_refresh') },
      naicsDataSchema
    );

    // check if validation returned an error response
    if (queryData instanceof NextResponse) return queryData;

    const url = new URL(`${FASTAPI_HOST}/data`);
    if (queryData.force_refresh) url.searchParams.set('force_refresh', 'true');

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 604800 }, // cache for 7 days
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`FastAPI error: ${error}`);
    }
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('NAICS API Error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}
