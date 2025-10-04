import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SuggestionBadgesProps {
  onClick: (prompt: string) => void;
  className?: string;
}

const findNaicsPrompt = `I'm the founder of TerraLumen Geospatial (small business, 8 employees). Here's what we actually do: collect aerial RGB/LiDAR with small UAS and process orthomosaics, DTMs, and 3D meshes, run GEOINT pipelines: automated feature extraction (roads/structures/veg) and change detection, package high-fidelity terrain for HLA/DIS-based training sims; deploy edge AI models for object detection on UAS video, and occasional UI/voice localization for partner training apps. Give me the most relevant NAICS codes for my company.`;

const SUGGESTIONS: { title: string, prompt: string; }[] = [
  {
    title: "Sentinel: Seeking WOSB",
    prompt: "Sentinel Microsystems (UEI SENTINEL92M) is targeting opportunity GD-2025-002, but are in the market for a joint venture. Find us potential partners who have the required WOSB set-aside certification.",
  },
  {
    title: "STE-2025-005 Gaps",
    prompt: "I'm a consultant for Tristimuli (UEI TRISTI65M, WOSB) targeting STE-2025-005 (WOSB, coalition VR/AR training). Help me find a Joint Venture partnership that complements Tristimuli's VR content pipeline. They should be able to cover these capability gaps: (a) HLA/DIS interoperability, (b) GEOINT terrain generation (541370/541710), and (c) multilingual voice/UX (541930)?",
  },
  {
    title: "WOSB Partners",
    prompt: "We're Sentinel Microsystems (UEI SENTINEL92M) going after GD-2025-002. Can you help us find potential company partnerships that have the required WOSB set-aside status for the contract we're targeting?",
  },
  {
    title: "Find My NAICS",
    prompt: findNaicsPrompt,
  },
];

export function SuggestionBadges({ onClick, className }: SuggestionBadgesProps) {
  return (
    <div className={cn('flex flex-wrap gap-2 sm:px-4', className)}>
      {SUGGESTIONS.map(({ title, prompt }) => (
        <Badge
          key={title}
          variant="outline"
          onClick={() => onClick(prompt)}
          className="cursor-pointer rounded-lg px-3 py-1 text-[11px] sm:text-xs border-border/20 bg-background hover:bg-bot/95 hover:text-slate-900 active:scale-95 transition select-none"
        >
          {title}
        </Badge>
      ))}
    </div>
  );
}