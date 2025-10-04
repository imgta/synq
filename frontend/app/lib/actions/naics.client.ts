// app/lib/actions/naics.client.ts

'use client';

import { TransformersEmbeddingPipeline } from '@/lib/embedding.server';
import { getNaicsCandidates } from '@/api/chat/(actions)/naics.server';

export async function clientNaicsCandidates(description: string, limit = 8) {
  try {
    const embedding = await TransformersEmbeddingPipeline.generateEmbedding(description, 'summary');
    return await getNaicsCandidates(embedding, limit); // server action call (RPC)
  } catch {
    return await getNaicsCandidates(description, limit); // server-side fallback
  }
}