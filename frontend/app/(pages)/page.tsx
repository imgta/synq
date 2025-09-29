'use client';

import { useChat } from '@ai-sdk/react';
import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { SearchBar } from '@/components/SearchBar';

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
    <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-medium mb-4 font-">synQ Engine</h1>
        <div className="flex flex-col w-full max-w-xl py-24 mx-auto stretch">
          {messages.map(m =>
            <div key={m.id} className="whitespace-pre-wrap">
              {m.role === 'user' ? 'User: ' : 'SynQ: '}
              {m.parts.map((part, idx) => {
                const key = `${m.id}-${idx}`;
                switch (part.type) {
                  case 'text':
                    return <div key={key}>{part.text}</div>;
                  case 'tool-weather':
                    return <pre key={key}>{JSON.stringify(part, null, 2)}</pre>;
                }
              })}
            </div>
          )}

          <SearchBar
            input={input}
            submitted={submitted}
            setInput={setInput}
            onSubmit={onSubmit}
            onClear={onClear}
          />
        </div>
      </main>
    </div>
  );
}
