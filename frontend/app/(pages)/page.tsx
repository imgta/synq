'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { SearchBar } from '@/components/SearchBar';
import { DataRadarChart } from '@/components/dataviz/radar-chart';

export default function Index() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { messages, sendMessage } = useChat();

  async function onSubmit() {
    sendMessage({ text: input });
    setInput('');
  }

  function onClear() {
    setSubmitted(false);
    setInput('');
  }

  return (
    <main className="max-w-7xl mx-auto px-6">
      <div className="w-full min-h-dvh sm:min-h-0 flex flex-col ">
        <div className="pt-24 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm mb-6">
            <Sparkles className="size-3" />
            <span>AI-powered government contracting intelligence</span>
          </div>
          <h1 className="text-8xl mb-4 font-soehne font-medium">synQ</h1>
        </div>
        <div className="flex flex-col w-full max-w-xl py-24 mx-auto stretch">
          {messages.map(m =>
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'User: ' : 'SynQ: '}
              {m.parts.map((part, idx) => {
                const key = `${m.id}-${idx}`;
                switch (part.type) {
                  case 'text':
                    return <div key={key}>{part.text}</div>;
                  case 'tool-classifyBusinessByNAICS':
                    return <p key={key}>{JSON.stringify(part, null, 2)}</p>;
                }
              })}
            </div>
          )}
        </div>
        <SearchBar
          input={input}
          submitted={submitted}
          setInput={setInput}
          onSubmit={onSubmit}
          onClear={onClear}
        />
        <DataRadarChart />
      </div>
    </main>
  );
}
