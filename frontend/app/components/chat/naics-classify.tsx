'use client';

export interface NaicsResult {
  code: string;
  title: string | null;
  description: string;
  similarity: number;
}

export interface NaicsClassificationProps {
  primaryNaics: NaicsResult;
  ancillaryNaics: NaicsResult[];
}

// A helper component for displaying a single NAICS code card
function NaicsCodeCard({ code, title, description, similarity, isPrimary = false }: NaicsResult & { isPrimary?: boolean; }) {
  const formattedSimilarity = (similarity * 100).toFixed(1);

  return (
    <div className={`p-4 border rounded-lg ${isPrimary ? 'bg-blue-50 border-blue-200' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-lg">{title}</h3>
        <span
          className={`px-2 py-1 text-sm font-semibold rounded-full ${isPrimary ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-foreground'
            }`}
        >
          {formattedSimilarity}% Match
        </span>
      </div>
      <p className="text-sm text-foreground mb-1 font-mono">
        NAICS Code: {code}
      </p>
      <p className="text-sm text-foreground0">{description}</p>
    </div>
  );
}

// The main component that orchestrates the display
export function NaicsClassificationResult({ primaryNaics, ancillaryNaics }: NaicsClassificationProps) {
  return (
    <div className="bg-background p-4 my-2 rounded-xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-xl font-semibold text-foreground-800">NAICS Code Classification</h2>

      <div>
        <h3 className="text-md font-semibold text-foreground mb-2">Primary Industry</h3>
        <NaicsCodeCard {...primaryNaics} isPrimary />
      </div>

      {ancillaryNaics && ancillaryNaics.length > 0 && (
        <div>
          <h3 className="text-md font-semibold text-foreground-700 mb-2">Ancillary Industries</h3>
          <div className="space-y-3">
            {ancillaryNaics.map(naics => (
              <NaicsCodeCard key={naics.code} {...naics} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}