import { pipeline } from '@huggingface/transformers';
import type { FeatureExtractionPipeline, ProgressCallback, PipelineType } from '@huggingface/transformers';

/**
 * Singleton pattern pipeline to load one model instance for reuse across all serverless function invocations.
 */
class EmbeddingPipeline {
  static task: PipelineType = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2';
  static instance: FeatureExtractionPipeline | null = null;

  static async getInstance(progress_callback?: ProgressCallback) {
    this.instance ??= (await pipeline(
      this.task,
      this.model,
      {
        dtype: 'fp32',
        device: 'cpu',
        progress_callback,
      },
    )) as FeatureExtractionPipeline;

    return this.instance;
  }
}

/**
 * Generates a vector embedding from a given text.
 * @param text The text to generate an embedding for.
 * @returns A promise that resolves to a 384-dimension number array.
 */
export async function generateEmbedding(text: string) {
  const extractor = await EmbeddingPipeline.getInstance();
  const output = await extractor(text, { pooling: 'mean', normalize: true });

  // Float32Array -> number[]
  return Array.from(output.data);
}