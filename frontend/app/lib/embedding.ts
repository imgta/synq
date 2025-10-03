import {
  pipeline, env,
  type FeatureExtractionPipeline,
  type ProgressCallback,
  type PipelineType,
} from '@huggingface/transformers';
import type { Opportunity } from '@/lib/db';
import { consola } from 'consola';

env.allowLocalModels = false; // skip local model check
// env.allowRemoteModels = true;
// env.useBrowserCache = false;

export const EmbeddingModels = {
  /** 384-dimension size model for embedding structured summary texts.*/
  summary: 'Xenova/bge-small-en-v1.5',
  /** 768-dimension size model to vectorize full-text documents for retrievals.*/
  fulltext: 'Xenova/bge-base-en-v1.5',
} as const;

export type ModelName = keyof typeof EmbeddingModels;

/**
 * A manager class for handling multiple feature-extraction pipelines.
 * It ensures that each model is only loaded once and reused across invocations.
 */
class EmbeddingPipelineManager {
  private static task: PipelineType = 'feature-extraction';
  private static instances: Map<ModelName, FeatureExtractionPipeline> = new Map();
  private static loadingPromises: Map<ModelName, Promise<FeatureExtractionPipeline>> = new Map();

  private static async loadModel(model: ModelName, progress_callback?: ProgressCallback): Promise<FeatureExtractionPipeline> {
    const modelName = EmbeddingModels[model];
    consola.start(`Initializing embedding model: ${modelName}`);

    const extractor = await pipeline(this.task, modelName, {
      progress_callback,
      device: 'wasm',
      dtype: 'fp32',
    });
    consola.success(`${modelName} pipeline initialized`);
    return extractor as FeatureExtractionPipeline;
  }

  /** Clears all cached model instances (useful for testing)*/
  static clearCache(): void {
    this.instances.clear();
    this.loadingPromises.clear();
  }

  /**
   * Singleton pattern pipeline to load one embedding model instance for reuse across all invocations.
   * @param model The name of the model to load.
   * @param progress_callback An optional callback for tracking download progress.
   * @returns A promise that resolves to the feature extraction pipeline.
   */
  static async getInstance(model: ModelName, progress_callback?: ProgressCallback) {
    if (this.instances.has(model)) return this.instances.get(model)!;
    // if already loading, wait for that promise to resolve
    if (this.loadingPromises.has(model)) return this.loadingPromises.get(model)!;
    // create new loading promise
    const loadingPromise = this.loadModel(model, progress_callback);
    this.loadingPromises.set(model, loadingPromise);

    try {
      const instance = await loadingPromise;
      this.instances.set(model, instance);
      return instance;
    } finally {
      // Clean up loading promise after completion
      this.loadingPromises.delete(model);
    }
  }
}

/**
 * Generates a vector embedding for a given text using a specified model.
 * @param text The text to generate an embedding for.
 * @param model The model to use ('summary' or 'fulltext').
 * @returns A promise that resolves to a vector number array.
 */
export async function generateEmbedding(text: string, opt?: { model: ModelName; }) {
  const model = opt?.model ?? 'summary';
  if (!text || text.trim().length === 0) throw new Error('Cannot generate embedding for empty text');

  try {
    const extractor = await EmbeddingPipelineManager.getInstance(model);
    const output = await extractor(text, { pooling: 'mean', normalize: true });
    return Array.from(output.data); // // Float32Array -> number[]
  } catch (error) {
    consola.error(`Embedding Error (${model}):`, error);
    throw new Error(`Failed to generate (${model}): ${error}`);
  }
}

/**
 * Generates embeddings for multiple texts in batches to prevent memory issues.
 * @param texts Array of texts to embed
 * @param options Configuration including model and batch size
 * @returns Promise resolving to array of embeddings
 */
export async function generateEmbeddingsBatch(
  texts: string[],
  options?: { model?: ModelName; batchSize?: number; }
): Promise<number[][]> {
  const model = options?.model ?? 'summary';
  const batchSize = options?.batchSize ?? 32;
  const results: number[][] = [];

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize);
    const batchResults = await Promise.all(
      batch.map(text => generateEmbedding(text, { model }))
    );
    results.push(...batchResults);
    if (i + batchSize < texts.length) {
      consola.success(`Processed ${i + batchSize}/${texts.length} embeddings`);
    }
  }
  return results;
}



/**
 * Structures opportunity data into a rich text document for AI embedding.
 * @param opp The opportunity object from the database.
 * @returns A formatted string containing the most salient details of the opportunity.
 */
export function createEmbeddingInput(opp: Opportunity): string {
  const parts: string[] = [];

  // 1. Core Identity & Description
  parts.push(`Title: ${opp.title}`);
  if (opp.description) {
    // Truncate long descriptions to keep the most relevant info at the top
    const truncatedDesc = opp.description.substring(0, 1500);
    parts.push(`\nDescription: ${truncatedDesc}`);
  }

  // 2. Key AI-Extracted Features (high signal)
  if (opp.key_requirements?.length) {
    parts.push(`\nKey Requirements:`);
    opp.key_requirements.forEach(req => parts.push(`- ${req}`));
  }

  // 3. Agency and Classification (Who and What)
  if (opp.full_parent_path_name) {
    const agency = opp.full_parent_path_name.replaceAll('.', ' > ');
    parts.push(`\nIssuing Agency: ${agency}`);
  }
  if (opp.naics_code && opp.naics_description) {
    parts.push(`Primary Industry (NAICS): ${opp.naics_code} - ${opp.naics_description}`);
  }
  if (opp.secondary_naics?.length) {
    parts.push(`Secondary Industries: ${opp.secondary_naics.join(', ')}`);
  }
  if (opp.classification_code) {
    parts.push(`Service Code (PSC): ${opp.classification_code}`);
  }

  // 4. Contracting Details (How)
  if (opp.type) parts.push(`Opportunity Type: ${opp.type}`);
  if (opp.set_aside_description) {
    parts.push(`Set-Aside: ${opp.set_aside_description}`);
  }

  // process numericals and location data
  if (opp.estimated_value) {
    const formattedValue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(opp.estimated_value);
    parts.push(`Estimated Value: ${formattedValue}`);
  }
  if (opp.complexity_score) {
    const complexity = parseFloat(opp.complexity_score);
    let complexityText = 'Standard';
    if (complexity > 0.75) complexityText = 'High';
    if (complexity < 0.3) complexityText = 'Low';
    parts.push(`Assessed Complexity: ${complexityText}`);
  }
  if (opp.place_of_performance) {
    const { city, state, country } = opp.place_of_performance;
    const location = [city?.name, state?.name, country?.name].filter(Boolean).join(', ');
    if (location) parts.push(`Place of Performance: ${location}`);
  }

  const summary = parts.join('\n\n');

  return summary;
}