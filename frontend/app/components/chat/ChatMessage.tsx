import { NAICSClassification, NAICSCode } from '@/components/chat/NAICSClassify';
import type { UIMessage } from '@ai-sdk/react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';
import { JVPartners, JVPartnersOutput } from '@/components/chat/JVPartners';
import { Message, MessageContent, MessageAvatar } from '@/components/chat/message';
import { Response } from '@/components/chat/response';

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
    <div>
      <Message className="flex items-center" from={message.role} key={message.id}>
        <MessageContent variant="flat">
          {message.parts.map((part, idx) => {
            const key = `${message.id}-${idx}`;
            switch (part.type) {
              case "text":
                return (
                  <Response key={key}>
                    {part.text}
                  </Response>
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
        </MessageContent>

        {!isUser &&
          <div className="flex items-center justify-center pr-2">
            <Bot className="size-5.5 text-foreground/80" />
          </div>}
        {isUser && (
          <div className="size-8 rounded-full bg-card flex items-center justify-center">
            <User className="size-4 text-foreground" />
          </div>

        )}
      </Message>


    </div>
  );
}
