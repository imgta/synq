'use client';

import { useState } from 'react';
import { TransformersEmbeddingPipeline } from '@/lib/embedding.client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function TestEmbeddingPage() {
  const [input, setInput] = useState('Hello world');
  const [loading, setLoading] = useState(false);
  const [vector, setVector] = useState<number[] | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setVector(null);

    try {
      const vec = await TransformersEmbeddingPipeline.generateEmbedding(input, 'summary');
      setVector(vec);
      toast.success('Embedding generated successfully!', {
        description: `Vector length: ${vec.length}`,
      });
      console.log('Embedding:', vec);
    } catch (err) {
      console.error(err);
      toast.error('Embedding failed', {
        description: (err as Error).message ?? 'Unknown error',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-xl font-semibold">Transformers.js Embedding Test</h1>

      <Textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to embed..."
        className="min-h-[120px]"
      />

      <Button
        onClick={handleGenerate}
        disabled={loading}
        className="w-full"
      >
        {loading ? 'Generating...' : 'Generate Embedding'}
      </Button>

      {vector && (
        <div className="text-sm break-all mt-4 border-t pt-4">
          <p><strong>Vector length:</strong> {vector.length}</p>
          <p><strong>First 10 values:</strong> {vector.slice(0, 10).join(', ')}</p>
        </div>
      )}
    </main>
  );
}
