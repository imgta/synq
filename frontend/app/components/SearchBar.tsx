import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface SearchBarProps {
  input: string;
  submitted: boolean;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  onSubmit: () => Promise<void>;
  onClear: () => void;
}

export function SearchBar({
  input,
  submitted,
  setInput,
  onSubmit,
  onClear,
}: SearchBarProps) {
  return (
    <form className="mb-8 px-24"
      onSubmit={async e => { e.preventDefault(); await onSubmit(); }}
    >
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-4 sm:space-y-0 sm:space-x-2">
        <div className="relative flex-grow">
          <Input type="text"
            placeholder="Find opportunities..."
            className="pr-10 text-base"
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
        </div>
        <div className="flex sm:flex-row items-center justify-center gap-1.5">
          {submitted
            ? <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={onClear}>Clear</Button>
            : <Button type="submit" className="w-full sm:w-auto">Submit</Button>
          }
        </div>
      </div>
    </form>
  );
};
