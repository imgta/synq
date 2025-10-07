'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { ChartHandle, DataRadarChart, type CompareOptions } from '@/components/dataviz/radar-chart';
import { ChatMessage, PartnerCompareArgs } from '@/components/chat/ChatMessage';
import { QuickCompareCard, CARD_ITEMS } from '@/components/chat/quick-compare-card';
import { SuggestionBadges } from '@/components/chat/SuggestionBadges';
import { SearchBar } from '@/components/chat/SearchBar';


export default function Index() {
  const [input, setInput] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const { messages, sendMessage } = useChat();

  const chartRef = useRef<ChartHandle | null>(null);

  function renderComparison(opts: CompareOptions) {
    const isOneToOne = opts.companies.length === 1 && opts.opportunities.length === 1;
    const mode = opts.mode ?? (isOneToOne ? 'pivot' : 'standard');
    chartRef.current?.setCompare({
      mode,
      view: opts.view,
      companies: opts.companies,
      opportunities: opts.opportunities,
      anchorOpportunity: 'anchorOpportunity' in opts
        ? opts.anchorOpportunity
        : opts.view === 'opportunity'
          ? opts.opportunities[0]
          : undefined,
      anchorCompany: 'anchorCompany' in opts
        ? opts.anchorCompany
        : opts.view === 'company'
          ? opts.companies[0]
          : undefined,
    });
    chartRef.current?.scrollIntoView();
  }

  function renderPartnerCompare({ lead, partner, opportunity }: PartnerCompareArgs) {
    if (!lead?.name || !partner?.name || !opportunity?.notice_id) return;
    renderComparison({
      view: 'opportunity',
      mode: 'pivot',
      companies: [lead.name, partner.name],
      opportunities: [opportunity.notice_id],
      anchorCompany: lead.name, // anchor comparison on lead company
    });
  }

  async function onSubmit() {
    sendMessage({ text: input });
    setInput('');
  }
  function onClear() { setSubmitted(false); setInput(''); }

  function onSuggestClick(suggestion: string) {
    setSubmitted(true);
    sendMessage({ text: suggestion });
  }

  return (
    <main className="max-w-7xl mx-auto sm:px-6">
      <div className="w-full min-h-dvh sm:min-h-0 flex flex-col ">
        <div className="py-12 sm:py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-none border border-muted-foreground/25 text-foreground text-sm mb-6 ml-2">
            <Sparkles className="size-3 text-primary/90" />
            <span>AI-powered government contracting engine</span>
          </div>
          <h1 className="text-8xl mb-4 font-soehne font-medium">SynQ</h1>

          <h2 className="font-soehne tracking-wide text-foreground/85 scale-95">
            From NAICS codes to lucrative joint ventures&mdash;smarter, simpler, SynQ.
          </h2>
        </div>

        <section className="flex flex-col sm:px-4 w-full max-w-4xl mx-auto mb-4 gap-6">
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} onPartnerClick={renderPartnerCompare} />
          ))}
        </section>

        <section className="px-4 w-full max-w-3xl mx-auto mb-3">
          <SuggestionBadges
            onClick={prompt => { onSuggestClick(prompt); }}
          />
        </section>

        <section className="justify-center">
          <SearchBar placeholder="Ask about which NAICS codes best fit your business..."
            input={input}
            submitted={submitted}
            setInput={setInput}
            onSubmit={onSubmit}
            onClear={onClear}
          />
        </section>

        <section className="px-4 sm:px-8 w-full max-w-4xl mx-auto mb-10 space-y-2">
          <h3 className="px-2 text-sm font-soehne">Quick Compare</h3>
          <div className="rounded-xl overflow-hidden">
            <div className="grid gap-1 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {CARD_ITEMS.map(({ icon, title, subheader, options, className }, i) => (
                <QuickCompareCard
                  key={i}
                  icon={icon}
                  title={title}
                  subheader={subheader}
                  className={className}
                  onClick={() => renderComparison(options)}
                />
              ))}
            </div>
          </div>
        </section>

        <DataRadarChart
          ref={chartRef}
          initial={{
            view: 'opportunity',
            mode: 'standard',
            companies: [],
            opportunities: [],
            anchorOpportunity: '',
          }}
        />
      </div>
    </main>
  );
}
