// app/lib/embedding.client.ts

import { FeatureExtractionPipeline, PipelineType, ProgressCallback } from '@huggingface/transformers';
import type { EmbeddingModelCase } from '@/lib/embedding.server';

export const MODEL_PATHS = {
  /** 384-dimension size model for embedding structured summary texts.*/
  summary: '/models/Xenova/all-MiniLM-L6-v2',
  /** 768-dimension size model to vectorize full-text documents for retrievals.*/
  fulltext: '/models/Xenova/bge-base-en-v1.5',
} as const;

/** Lazy import of transformers, loaded in browser only when needed. */
async function loadTransformers() {
  return import('@huggingface/transformers');
}

/** Global cache to persist after HMR */
declare global {
  var __clientEmbeddingPipelines__: | {
    instances: Map<EmbeddingModelCase, FeatureExtractionPipeline>;
    loading: Map<EmbeddingModelCase, Promise<FeatureExtractionPipeline>>;
  } | undefined;
}
const globalCache = (globalThis.__clientEmbeddingPipelines__ ??= { instances: new Map(), loading: new Map() });

export class ClientEmbeddingPipeline {
  private static task: PipelineType = 'feature-extraction';
  private static async loadModel(modelType: EmbeddingModelCase, progress_callback?: ProgressCallback): Promise<FeatureExtractionPipeline> {
    const { pipeline, env } = await loadTransformers();

    env.allowLocalModels = true;  // serve model locally from /public
    env.allowRemoteModels = false; // prevent hub fetching
    env.useBrowserCache = true;
    env.backends.onnx.backend = 'wasm';

    const modelPath = MODEL_PATHS[modelType];
    const extractor = await pipeline(this.task, modelPath, {
      progress_callback,
      device: 'wasm',
      dtype: 'fp32',
    });
    return extractor as FeatureExtractionPipeline;
  }

  /** Clears all cached model instances. */
  static clearCache(): void {
    globalCache.instances.clear();
    globalCache.loading.clear();
  }

  /**
 * Singleton pattern pipeline to load one embedding model instance for reuse across all invocations.
 * @param modelType The type of model to load.
 * @param progress_callback An optional callback for tracking download progress.
 * @returns A promise that resolves to the feature extraction pipeline.
 */
  static async getInstance(modelType: EmbeddingModelCase, progress_callback?: ProgressCallback) {
    const existing = globalCache.instances.get(modelType);
    if (existing) return existing;

    // wait for loading promises to resolve
    const inflight = globalCache.loading.get(modelType);
    if (inflight) return inflight;

    // create new loading promise
    const loadingPromise = this.loadModel(modelType, progress_callback);
    globalCache.loading.set(modelType, loadingPromise);

    try {
      const instance = await loadingPromise;
      globalCache.instances.set(modelType, instance);
      return instance;
    } finally { // clean up loading promise after completion
      globalCache.loading.delete(modelType);
    }
  }

  static async generateEmbedding(input: string, modelType: EmbeddingModelCase = 'summary'): Promise<number[]> {
    try {
      const extractor = await this.getInstance(modelType);
      const output = await extractor(input, { pooling: 'mean', normalize: true });
      return Array.from(output.data); // float32[] => number[]
    } catch (error) {
      console.error(`Embedding Error:`, error);
      throw new Error(`Failed to generate embeddings`);
    }
  }
}