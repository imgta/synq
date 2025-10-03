import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface SearchBarProps {
  input: string;
  submitted: boolean;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => Promise<void>;
  onClear: () => void;
  placeholder?: string;
}

export function SearchBar({
  input,
  submitted,
  setInput,
  onSubmit,
  onClear,
  placeholder,
}: SearchBarProps) {
  return (
    <form className="mb-6 px-8"
      onSubmit={async e => { e.preventDefault(); await onSubmit(); }}
    >
      <div className="flex justify-center flex-col sm:flex-row sm:items-start space-y-4 sm:space-y-0 sm:space-x-2">
        <div className="sm:flex-grow max-w-2xl">
          <Input
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={placeholder ?? "Find opportunities..."}
            className="bg-background focus-visible:ring-0 min-h-10"
          />
        </div>
        <div className="flex sm:flex-row items-center justify-center">
          {submitted
            ? <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClear}>Clear</Button>
            : <Button type="submit" className="bg-brand size-full">
              <Send className="size-5 stroke-[1.5] text-background dark:text-foreground pr-0.5" />
            </Button>
          }
        </div>
      </div>
    </form>
  );
};
