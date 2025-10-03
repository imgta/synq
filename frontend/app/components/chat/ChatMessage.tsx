import { NAICSClassification, NAICSCode } from '@/components/chat/NAICSClassify';
import type { UIMessage } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JVPartners, JVPartnersOutput } from '@/components/chat/JVPartners';

export type PartnerCompareArgs = {
  lead: JVPartnersOutput['lead'];
  partner: NonNullable<JVPartnersOutput['suggested_partners']>[number]['partner'];
  opportunity: JVPartnersOutput['opportunity'];
};

type ChatMessageProps = {
  message: UIMessage;
  onPartnerClick?: (args: PartnerCompareArgs) => void;
};

export function ChatMessage({ message, onPartnerClick }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div className={cn('flex gap-4', isUser ? 'justify-end' : 'justify-start')}>
      {!isUser && (
        <div className="flex-shrink-0 size-8 rounded-full bg-brand flex items-center justify-center">
          <Bot className="size-4 text-bot" />
        </div>
      )}

      <div className={cn('flex flex-col gap-3 max-w-3xl', isUser ? 'tems-end' : 'tems-start')}>
        {message.parts.map((part, idx) => {
          const key = `${message.id}-${idx}`;
          switch (part.type) {
            case "text":
              return (
                <div
                  key={key}
                  className={cn('rounded-2xl px-2 py-1', isUser ? 'bg-brand text-bot' : 'bg-card text-foreground')}
                >
                  <div className="p-3 pb-4 prose prose-sm max-w-none dark:prose-invert prose-p:my-2 prose-ul:my-2 prose-ol:my-2 prose-li:my-0 prose-strong:font-semibold prose-code:bg-background/50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-xs">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="whitespace-pre-wrap">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-5 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-5 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="list-inside leading-relaxed">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                        code: ({ children }) => (
                          <code className="bg-background/50 px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>
                        ),
                      }}
                    >
                      {part.text}
                    </ReactMarkdown>
                  </div>
                </div>
              );

            case "tool-classifyBusinessByNAICS":
              if (part.state === 'output-available' && part.output) {
                return <NAICSClassification key={key} data={part.output as { naicsCodes: NAICSCode[]; }} />;
              }
              return (
                <div key={key} className="bg-muted rounded-2xl px-4 py-3">
                  <p className="text-sm text-muted-foreground">Analyzing business classification...</p>
                </div>
              );

            case "tool-findJVPartners": {
              if (part.state === 'output-available') {
                const data = part.output as JVPartnersOutput;
                if (data?.error) {
                  return (
                    <div key={key} className="bg-destructive/10 border border-destructive/30 rounded-2xl px-4 py-3">
                      <p className="text-sm text-destructive">{String(data.error)}</p>
                    </div>
                  );
                }
                if (typeof data !== 'object' || Array.isArray(data)) {
                  return <pre key={key} className="text-xs bg-background/50 p-3 rounded">{JSON.stringify(data, null, 2)}</pre>;
                }
                return <JVPartners key={key} data={data} onPartnerClick={onPartnerClick} />;
              }
              return (
                <div key={key} className="bg-muted rounded-2xl px-4 py-3">
                  <p className="text-sm text-muted-foreground">Finding JV partners...</p>
                </div>
              );
            }
            default:
              return null;
          }
        })}
      </div>

      {isUser && (
        <div className="flex-shrink-0 size-8 rounded-full bg-card flex items-center justify-center">
          <User className="size-4 text-foreground" />
        </div>
      )}
    </div>
  );
}
