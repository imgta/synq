'use client';

import { useChat } from '@ai-sdk/react';
import { useRef, useState } from 'react';
import { Sparkles, Earth, ChartNoAxesCombined, Cctv, Cpu, Blocks, Radar } from 'lucide-react';
import { ChartHandle, DataRadarChart, type CompareOptions } from '@/components/dataviz/radar-chart';
import { ChatMessage, PartnerCompareArgs } from '@/components/chat/ChatMessage';
import { QuickCompareCard } from '@/components/quick-compare-card';
import { SearchBar } from '@/components/SearchBar';

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


  async function onSubmit() { sendMessage({ text: input }); setInput(''); }
  function onClear() { setSubmitted(false); setInput(''); }

  return (
    <main className="max-w-7xl mx-auto px-6">
      <div className="w-full min-h-dvh sm:min-h-0 flex flex-col ">
        <div className="py-24 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-none border border-muted-foreground/25 text-foreground text-sm mb-6 ml-2">
            <Sparkles className="size-3 text-primary/90" />
            <span>AI-powered government contracting engine</span>
          </div>
          <h1 className="text-8xl mb-4 font-soehne font-medium">SynQ</h1>

          <h2 className="font-soehne tracking-wide text-foreground/85 scale-95">From NAICS codes to lucrative joint ventures&mdash;smarter, simpler, SynQ.</h2>
        </div>

        <section className="flex flex-col px-4 w-full max-w-4xl mx-auto mb-4 gap-6">
          {messages.map(m => (
            <ChatMessage key={m.id} message={m} onPartnerClick={renderPartnerCompare} />
          ))}
        </section>

        <SearchBar placeholder="Ask about which NAICS codes best fit your business..."
          input={input}
          submitted={submitted}
          setInput={setInput}
          onSubmit={onSubmit}
          onClear={onClear}
        />

        <section className="px-8 w-full max-w-4xl mx-auto mb-10 space-y-2">
          <h3 className="px-2 text-sm font-soehne">Quick Compare</h3>
          <div className="rounded-xl overflow-hidden">
            <div className="grid gap-1 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              <QuickCompareCard
                icon={<Earth className="size-4" />}
                title="The 'Dream Team' JV"
                subheader="A $45M contract needs both environmental remediation (8a) and secure construction (HZ)."
                onClick={() =>
                  renderComparison({
                    view: 'opportunity',
                    companies: ['Ridgeline Builders', 'Terra Sift'],
                    opportunities: ['BASE-2025-009'],
                  })
                }
              />
              <QuickCompareCard
                icon={<ChartNoAxesCombined className="size-4" />}
                title="Specialists vs Golden Dome"
                subheader="Can Apex, Contrail, and Ironclad cover C2 software and radar integration across two GD opps?"
                onClick={() =>
                  renderComparison({
                    view: 'opportunity',
                    companies: ['Apex Integration Partners', 'Contrail Analytics', 'Ironclad Embedded'],
                    opportunities: ['GD-2025-001', 'GD-2025-002'],
                    anchorOpportunity: 'GD-2025-001',
                  })
                }
              />
              <QuickCompareCard
                icon={<Cctv className="size-4" />}
                title="New-Era Battlefield Sensors"
                subheader="UAV analytics, radar modules, and biosurveillance systems are converging on major sensor procurements."
                onClick={() =>
                  renderComparison({
                    view: 'opportunity',
                    companies: ['Contrail Analytics', 'Sentinel Microsystems', 'BioShield Innovations'],
                    opportunities: ['GD-2025-002', 'CBRN-2025-007'],
                  })
                }
              />
              <QuickCompareCard
                icon={<Cpu className="size-4" />}
                title="The Niche Subcontractor"
                subheader="An $18M VR training contract requires multilingual support, creating a perfect role for PolyGlot."
                className="sm:border-l sm:border-white/10"
                onClick={() =>
                  renderComparison({
                    view: 'opportunity',
                    companies: ['Tristimuli', 'PolyGlot Defense Solutions'],
                    opportunities: ['STE-2025-005'],
                  })
                }
              />
              <QuickCompareCard
                icon={<Blocks className="size-4" />}
                title="Prime vs. Specialists"
                subheader="Can an integrator like Apex handle a complex C2 contract alone, or do they need niche subs?"
                className="lg:border-l-0 lg:border-white/10"
                onClick={() =>
                  renderComparison({
                    view: 'opportunity',
                    companies: ['Apex Integration Partners', 'Contrail Analytics', 'Ironclad Embedded'],
                    opportunities: ['GD-2025-001'],
                  })
                }
              />
              <QuickCompareCard
                icon={<Radar className="size-4" />}
                title="Radar Modernization Race"
                subheader="Defense giants and niche manufacturers are vying for contracts spanning command software, AESA radar hardware, and next-gen detection systems."
                onClick={() =>
                  renderComparison({
                    view: 'opportunity',
                    companies: ['Apex Integration Partners', 'Sentinel Microsystems'],
                    opportunities: ['GD-2025-001', 'GD-2025-002', 'CBRN-2025-007'],
                    anchorOpportunity: 'GD-2025-002',
                  })
                }
              />
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
