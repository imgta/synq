import { NextRequest, NextResponse } from 'next/server';
import { getSAMGovClient } from '@/lib/sam-gov';
import { validateRequestBody } from '@/api';
import { z } from 'zod';

const schema = z.object({ ncode: z.string() });

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const params = validateRequestBody(body, schema);

    console.log('PARAMS:', params);
    const client = getSAMGovClient();
    const data = await client.searchOpportunities(params);

    return NextResponse.json(data);
  } catch (error) {
    console.error('SAM.gov API route error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}