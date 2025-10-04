import {
  pipeline, env,
  type FeatureExtractionPipeline,
  type ProgressCallback,
  type PipelineType,
} from '@huggingface/transformers';
import { consola } from 'consola';
import OpenAI from 'openai';

env.allowLocalModels = false;  // skip local checks
env.allowRemoteModels = true; // allow hf hub url feching
env.useBrowserCache = false;

export type EmbeddingModelCase = 'summary' | 'fulltext';

export const EmbeddingModels = {
  /** 384-dimension size model for embedding structured summary texts.*/
  summary: 'Xenova/all-MiniLM-L6-v2',
  /** 768-dimension size model to vectorize full-text documents for retrievals.*/
  fulltext: 'Xenova/bge-base-en-v1.5',
} as const;


/**
 * A manager class for handling multiple feature-extraction pipelines.
 * It ensures that each model is only loaded once and reused across invocations.
 */
export class TransformersEmbeddingPipeline {
  private static task: PipelineType = 'feature-extraction';
  private static instances: Map<EmbeddingModelCase, FeatureExtractionPipeline> = new Map();
  private static loading: Map<EmbeddingModelCase, Promise<FeatureExtractionPipeline>> = new Map();

  private static async loadModel(model: EmbeddingModelCase, progress_callback?: ProgressCallback): Promise<FeatureExtractionPipeline> {
    const modelName = EmbeddingModels[model];
    consola.start(`Initializing embedding model: ${modelName}`);

    const extractor = await pipeline(this.task, modelName, {
      progress_callback,
      device: 'cpu',
      dtype: 'fp32',
    });
    consola.success(`${modelName} pipeline initialized`);
    return extractor as FeatureExtractionPipeline;
  }

  /** Clears all cached model instances. */
  static clearCache(): void {
    this.instances.clear();
    this.loading.clear();
  }

  /**
   * Singleton pattern pipeline to load one embedding model instance for reuse across all invocations.
   * @param modelType The name of the model type to load.
   * @param progress_callback An optional callback for tracking download progress.
   * @returns A promise that resolves to the feature extraction pipeline.
   */
  static async getInstance(modelType: EmbeddingModelCase, progress_callback?: ProgressCallback) {
    const existing = this.instances.get(modelType);
    if (existing) return existing;

    // wait for loading promises to resolve
    const inflight = this.loading.get(modelType);
    if (inflight) return inflight;

    // create new loading promise
    const loadingPromise = this.loadModel(modelType, progress_callback);
    this.loading.set(modelType, loadingPromise);

    try {
      const instance = await loadingPromise;
      this.instances.set(modelType, instance);
      return instance;
    } finally { // clean up loading promise after completion
      this.loading.delete(modelType);
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


export const OpenAiEmbeddingModels = {
  summary: {
    model: 'text-embedding-3-small',
    dimensions: 384,
  },
  fulltext: {
    model: 'text-embedding-3-small',
    dimensions: 1024,
  },
} as const;

const openai = new OpenAI();

export async function generateOpenAiEmbedding(input: string, opt?: { modelType: EmbeddingModelCase; }) {
  const modelType = opt?.modelType ?? 'summary';
  const { model, dimensions } = OpenAiEmbeddingModels[modelType];

  try {
    const embedding = await openai.embeddings.create({
      input,
      model,
      dimensions,
    });
    consola.info(embedding);
    return embedding.data[0].embedding;
  } catch (error) {
    consola.error(`OpenAI Embedding Error (${model}):`, error);
    throw new Error(`Failed to generate embeddings (${model})`);
  }
}