'use client';

import { TransformersEmbeddingPipeline } from '@/lib/embedding.client';

export async function embed(text: string) {
  const vector = await TransformersEmbeddingPipeline.generateEmbedding(text, 'summary');
  console.log(vector);
}