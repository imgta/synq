'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cFetch } from '@/api';

interface OpportunitySearchResponse {
  totalRecords: number;
  limit: number;
  offset: number;
  links: { rel: string, href: string; }[];
  opportunitiesData: Record<string, any>[];
}

export default function SamGovSearch() {
  const [data, setData] = useState<OpportunitySearchResponse | null>(null);
  const [params, setParams] = useState<Record<string, string>>({
    ncode: '54',
  });

  async function searchSAM() {
    const res = await cFetch('/api/sam', {
      method: 'POST',
      body: JSON.stringify(params),
    });
    setData(res);
  };

  return (
    <div className="p-8">
      <Input
        placeholder="NAICS Code"
        value={params.ncode}
        onChange={(e => setParams({ ...params, ncode: e.target.value }))}
      />
      <Button onClick={searchSAM}>Search</Button>

      {data &&
        <>
          <h2>{data.totalRecords} contracts:</h2>
          {data.opportunitiesData.map(opp => (
            <div key={opp.noticeId}>
              <h3>{opp.title}</h3>
              <p>{opp.naicsCode}</p>
            </div>
          ))}
        </>
      }
    </div>
  );
}