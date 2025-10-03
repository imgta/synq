// import {
//   pipeline, env,
//   type FeatureExtractionPipeline,
//   type ProgressCallback,
//   type PipelineType,
// } from '@huggingface/transformers';
import OpenAI from 'openai';
import { consola } from 'consola';

// env.allowLocalModels = false; // skip local model check
// env.allowRemoteModels = true;
// env.useBrowserCache = false;

// export const EmbeddingModels = {
//   /** 384-dimension size model for embedding structured summary texts.*/
//   summary: 'Xenova/bge-small-en-v1.5',
//   /** 768-dimension size model to vectorize full-text documents for retrievals.*/
//   fulltext: 'Xenova/bge-base-en-v1.5',
// } as const;

// export type ModelName = keyof typeof EmbeddingModels;

// /**
//  * A manager class for handling multiple feature-extraction pipelines.
//  * It ensures that each model is only loaded once and reused across invocations.
//  */
// class EmbeddingPipelineManager {
//   private static task: PipelineType = 'feature-extraction';
//   private static instances: Map<ModelName, FeatureExtractionPipeline> = new Map();
//   private static loadingPromises: Map<ModelName, Promise<FeatureExtractionPipeline>> = new Map();

//   private static async loadModel(model: ModelName, progress_callback?: ProgressCallback): Promise<FeatureExtractionPipeline> {
//     const modelName = EmbeddingModels[model];
//     consola.start(`Initializing embedding model: ${modelName}`);

//     const extractor = await pipeline(this.task, modelName, {
//       progress_callback,
//       device: 'cpu',
//       dtype: 'fp32',
//     });
//     consola.success(`${modelName} pipeline initialized`);
//     return extractor as FeatureExtractionPipeline;
//   }

//   /** Clears all cached model instances (useful for testing)*/
//   static clearCache(): void {
//     this.instances.clear();
//     this.loadingPromises.clear();
//   }

//   /**
//    * Singleton pattern pipeline to load one embedding model instance for reuse across all invocations.
//    * @param model The name of the model to load.
//    * @param progress_callback An optional callback for tracking download progress.
//    * @returns A promise that resolves to the feature extraction pipeline.
//    */
//   static async getInstance(model: ModelName, progress_callback?: ProgressCallback) {
//     if (this.instances.has(model)) return this.instances.get(model)!;
//     // if already loading, wait for that promise to resolve
//     if (this.loadingPromises.has(model)) return this.loadingPromises.get(model)!;
//     // create new loading promise
//     const loadingPromise = this.loadModel(model, progress_callback);
//     this.loadingPromises.set(model, loadingPromise);

//     try {
//       const instance = await loadingPromise;
//       this.instances.set(model, instance);
//       return instance;
//     } finally {
//       // Clean up loading promise after completion
//       this.loadingPromises.delete(model);
//     }
//   }
// }


// /**
//  * Generates a vector embedding for a given text using a specified model.
//  * @param text The text to generate an embedding for.
//  * @param model The model to use ('summary' or 'fulltext').
//  * @returns A promise that resolves to a vector number array.
//  */
// export async function generateEmbedding(text: string, opt?: { model: ModelName; }) {
//   const model = opt?.model ?? 'summary';
//   if (!text || text.trim().length === 0) throw new Error('Cannot generate embedding for empty text');

//   try {
//     const extractor = await EmbeddingPipelineManager.getInstance(model);
//     const output = await extractor(text, { pooling: 'mean', normalize: true });
//     return Array.from(output.data); // // Float32Array -> number[]
//   } catch (error) {
//     consola.error(`Embedding Error (${model}):`, error);
//     throw new Error(`Failed to generate (${model}): ${error}`);
//   }
// }


export const OpenAiEmbeddingModels = {
  summary: {
    model: 'text-embedding-3-small',
    dimensions: 384,
  },
  fulltext: {
    model: 'text-embedding-3-small', // Sticking with `small` is often enough
    dimensions: 1024, // A higher dimension for more detailed content
  },
} as const;
export type OpenAiModelName = keyof typeof OpenAiEmbeddingModels;

const openai = new OpenAI();

export async function generateOpenAiEmbedding(text: string, opt?: { model: OpenAiModelName; }) {
  const modelName = opt?.model ?? 'summary';
  const config = OpenAiEmbeddingModels[modelName];

  try {
    const embedding = await openai.embeddings.create({
      input: text,
      model: config.model,
      dimensions: config.dimensions,
    });
    consola.info(embedding);
    return embedding.data[0].embedding;
  } catch (error) {
    consola.error(`OpenAI Embedding Error (${modelName}):`, error);
    throw new Error(`Failed to generate embedding (${modelName})`);
  }
}