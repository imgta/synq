export type FilterProcurementType =
  'r' | // Sources Sought
  'p' | // Presolicitation
  'o' | // Solicitation
  'k' | // Combined Synopsis/Solicitation
  'a' | // Award Notice
  'u' | // Justification (J&A)
  's' | // Special Notice
  'i' | // Intent to Bundle Requirements (DoD-Funded)
  'g';  // Sale of Surplus Property
export type FilterStatus = 'active' | 'inactive' | 'archived' | 'cancelled' | 'deleted';
export type FilterSetAside =
  'SBA'
  | 'SBP'
  | '8A'
  | '8AN'
  | 'HZC'
  | 'HZS'
  | 'SDVOSBC'
  | 'SDVOSBS'
  | 'WOSB'
  | 'WOSBSS'
  | 'EDWOSB'
  | 'EDWOSBSS'
  | 'LAS'
  | 'IEE'
  | 'ISBEE'
  | 'BICiv'
  | 'VSA'
  | 'VSS';

export interface OpportunitySearchParams {
  postedFrom?: string;
  postedTo?: string;
  ptype?: FilterProcurementType;
  solum?: string;
  noticeid?: string;
  title?: string;
  status?: FilterStatus;
  // Place of Performance (state, zip code)
  state?: string;
  zip?: string;
  organizationCode?: string;
  organizationName?: string; // org, dept name, subtier name
  typeOfSetAside?: FilterSetAside,
  typeOfSetAsideDescription?: string,
  ncode?: string; // NAICS Code
  ccode?: string; // Classification Code
  rdlfrom?: string; // Response Deadline Date from
  rdlto?: string; // Response Deadline Date to
  limit?: number; // 1-1000
  offset?: number; // default 0
  keyword?: string;
}

export class SAMGovClient {
  private apiKey: string;
  private baseUrl = 'https://api.sam.gov/opportunities/v2/search';

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SAM_GOV_API_KEY || '';
    if (!this.apiKey) throw new Error('SAM.gov API key is required');
  }

  async searchOpportunities(params: OpportunitySearchParams) {
    // default to pre-award procurement types only
    const defaultPTypes = ['r', 'p', 'o', 'k'].join(',');

    const searchParams = new URLSearchParams({
      postedFrom: params.postedFrom ?? this.getDefaultPostedFrom(),
      postedTo: params.postedTo ?? this.getToday(),
      ptype: params.ptype ?? defaultPTypes,
      limit: String(params.limit ?? 50),
      offset: String(params.offset ?? 0),
    });

    if (params.typeOfSetAside) searchParams.set('typeOfSetAside', params.typeOfSetAside);
    if (params.ncode) searchParams.set('ncode', params.ncode);
    if (params.status) searchParams.set('status', params.status);
    if (params.state) searchParams.set('state', params.state);
    if (params.keyword) searchParams.set('q', params.keyword);

    const url = `${this.baseUrl}?api_key=${this.apiKey}`;
    try {
      const searchUrl = `${url}&${String(searchParams)}`;
      const res = await fetch(searchUrl);
      if (!res.ok) throw new Error(`SAM.gov API error: ${res.status} - ${res.text()}`);

      return await res.json();
    } catch (error) {
      console.error('SAM.gov fetch error:', error);
      throw error;
    }
  }

  async getOpportunityByNoticeId(noticeId: string) {
    const url = `${this.baseUrl}?api_key=${this.apiKey}&noticeId=${noticeId}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`SAM.gov API error: ${res.status} - ${res.text()}`);

      return await res.json();
    } catch (error) {
      console.error('Failed to fetch opportunity:', error);
      throw error;
    }
  }

  private getDefaultPostedFrom(): string {
    const date = new Date();
    date.setDate(date.getDate() - 30); // last 30 days
    return this.formatDate(date);
  }

  private getToday(): string {
    return this.formatDate(new Date());
  }

  private formatDate(date: Date): string {
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}/${day}/${year}`;
  }
}

let client: SAMGovClient | null = null;

export function getSAMGovClient(): SAMGovClient {
  if (!client) client = new SAMGovClient();
  return client;
}