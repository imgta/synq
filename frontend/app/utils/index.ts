interface ValueExtraction {
  value: number | null;
  confidence: number;
  source: string;
}

export function extractContractValue(description: string): ValueExtraction {
  const patterns = [
    /\$\s*(\d+(?:\.\d+)?)\s*(?:M|million)/i, // '$2.5M', '$2.5 million'
    /\$\s*([\d,]+)/g, // '$2,500,000'
    /(\d+(?:\.\d+)?)\s*million\s*dollars/i, // '2.5 million dollars'
    /estimated\s+(?:at|value)?\s*\$?\s*([\d,.]+)\s*(?:M|million)?/i, // 'estimated at $X'
    /ceiling\s+(?:value)?\s*(?:of)?\s*\$?\s*([\d,.]+)\s*(?:M|million)?/i, // 'ceiling value of $X'
  ];

  let bestMatch: ValueExtraction = {
    value: null,
    confidence: 0,
    source: 'none',
  };

  for (const pattern of patterns) {
    const match = description.match(pattern);
    if (match) {
      let value: number;
      const matched = match[1].replace(/,/g, '');

      // millions check
      if (match[0].toLowerCase().includes('m') || match[0].toLowerCase().includes('million')) {
        value = parseFloat(matched) * 1_000_000;
      } else {
        value = parseFloat(matched);
      }

      // gov contracts are ~ $10k-100B USD
      if (value >= 10_000 && value <= 100_000_000_000) {
        return {
          value: Math.round(value),
          confidence: 0.75,
          source: 'ai_extracted',
        };
      }
    }
  }

  return bestMatch;
}