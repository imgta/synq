'use server';

import { eq, ne, and, ilike, isNotNull, cosineDistance } from 'drizzle-orm';
import { drizzleDB, tables } from '@/lib/db';
import { consola } from 'consola';
import { tool } from 'ai';
import { z } from 'zod';

type SetAsideStatus = 'qualified' | 'eligible' | 'ineligible' | 'not_applicable';

export const findJVPartners = tool({
  description:
    'Return raw, unweighted JV partner candidates for an opportunity using ANN and basic metadata—no combined scores.\n' +
    'Args can be any of: leadCompanyId | leadCompanyUEI | leadCompanyName, and opportunityNoticeId | opportunitySolicitationNumber | opportunityTitle.\n' +
    'Examples:\n' +
    '- leadCompanyUEI: "SENTINEL92M", opportunityNoticeId: "GD-2025-002"\n' +
    '- leadCompanyName: "Tristimuli", opportunityTitle: "Virtual Flight Operations Trainer with Multilingual Voice"\n' +
    '- leadCompanyId: "<uuid>", opportunitySolicitationNumber: "W31P4Q-25-R-0198"',
  inputSchema: z.object({
    leadCompanyId: z.string().optional().describe('Internal company id (uuid-like)'),
    leadCompanyUEI: z.string().optional().describe('12-char UEI, e.g. "SENTINEL92M"'),
    leadCompanyName: z.string().optional().describe('Exact company name, e.g. "Sentinel Microsystems"'),

    opportunityNoticeId: z.string().optional().describe('Notice ID, e.g. "GD-2025-002"'),
    opportunitySolicitationNumber: z.string().optional().describe('Solicitation number, e.g. "W31P4Q-25-R-0198"'),
    opportunityTitle: z.string().optional().describe('Exact title, e.g. "Compact AESA Radar Modules for Mobile Air Defense"'),

    limit: z.number().min(1).max(50).default(12),
  })
    .refine(i => !!(i.leadCompanyId || i.leadCompanyUEI || i.leadCompanyName), {
      message: 'Provide leadCompanyId, leadCompanyUEI, or leadCompanyName.',
    }),

  execute: async ({
    leadCompanyId,
    leadCompanyUEI,
    leadCompanyName,
    opportunityNoticeId,
    opportunitySolicitationNumber,
    opportunityTitle,
    limit,
  }) => {
    const db = drizzleDB();
    const { companies, opportunities } = tables;

    // resolve and fetch lead company
    const leadResolved = await resolveLeadCompany(db, { leadCompanyId, leadCompanyUEI, leadCompanyName });
    if ('error' in (leadResolved)) return leadResolved;
    const leadCompany = leadResolved as typeof companies.$inferSelect;

    // resolve and fetch opportunity
    if (!opportunityNoticeId && !opportunitySolicitationNumber && !opportunityTitle) {
      return { error: 'Provide opportunityNoticeId, opportunitySolicitationNumber, or opportunityTitle.' };
    }
    const oppResolved = await resolveOpportunity(db, { opportunityNoticeId, opportunitySolicitationNumber, opportunityTitle });
    if ('error' in oppResolved) return oppResolved;
    const opportunity = oppResolved as typeof opportunities.$inferSelect;

    if (!opportunity.embedding_summary) return { error: `Opportunity ${opportunity.notice_id} has no embedding_summary; cannot run ANN.` };

    // compute missing secondary NAICS relative to lead (raw signal)
    const opportunitySecondaryNaics = (opportunity.secondary_naics ?? []) as string[];
    const leadCompanyNaics = [leadCompany.primary_naics, ...(leadCompany.other_naics ?? [])];
    const missingSecondaryNaics = opportunitySecondaryNaics.filter(code => !leadCompanyNaics.includes(code));

    // approximate nearest neighbor (ANN) preselect: order by cosine dist to opportunity embedding
    const companyToOpportunityDistance = cosineDistance(companies.embedding_summary, opportunity.embedding_summary as number[]);
    const preselectLimit = 30;

    const preselectedCompanies = await db
      .select({
        id: companies.id,
        name: companies.name,
        primary_naics: companies.primary_naics,
        other_naics: companies.other_naics,
        certifications: companies.certifications,
        sba_certifications: companies.sba_certifications,
        distance: companyToOpportunityDistance, // per-row computed (pgvector)
      })
      .from(companies)
      .where(and(
        ne(companies.id, leadCompany.id),       // exclude lead company
        isNotNull(companies.embedding_summary), // ensure candidates have embedded index
      ))
      .orderBy(companyToOpportunityDistance)    // HNSW index on companies.embedding_summary
      .limit(preselectLimit);

    // // barebones
    // const candidates = preselectedCompanies.map(c => {
    //   const otherNaics = Array.isArray(c.other_naics) ? (c.other_naics as string[]) : [];
    //   const sbaCerts = Array.isArray(c.sba_certifications) ? (c.sba_certifications as string[]) : [];
    //   const partnerNaics = [c.primary_naics, ...otherNaics];
    //   const naicsCovered = missingSecondaryNaics.filter(code => partnerNaics.includes(code));
    //   const naicsCoverFraction = missingSecondaryNaics.length
    //     ? naicsCovered.length / missingSecondaryNaics.length
    //     : 0;
    //   const setAsideStatus = mapSetAside(opportunity.set_aside_code ?? null, sbaCerts);
    //   return {
    //     partner: {
    //       id: c.id,
    //       name: c.name,
    //       primary_naics: c.primary_naics,
    //       other_naics: otherNaics,
    //       sba_certifications: sbaCerts,
    //     },
    //     metrics: { // RAW metrics for evaluation
    //       distance: c.distance, // cosine dist: lower means closer to opportunity
    //       naicsCovered,         // list of missing secondary NAICS this partner covers
    //       naicsCoverFraction,   // fraction of missing secondary NAICS covered
    //       setAsideStatus,       // coarse mapping, no size-standard checks here
    //     },
    //   };
    // });
    // consola.info('[findJVPartners] Candidates:', JSON.stringify(candidates.slice(0, limit), null, 2));
    // const suggestedPartners = candidates.slice(0, limit); // return top-n by ANN order only

    const scoredCandidates = preselectedCompanies.map(candidate => {
      const scoreResult = partnerFitScore({
        leadCompany: {
          primary_naics: leadCompany.primary_naics,
          other_naics: leadCompany.other_naics as string[],
          sba_certifications: leadCompany.sba_certifications as string[],
        },
        opportunity: {
          primary_naics: opportunity.naics_code,
          secondary_naics: opportunity.secondary_naics as string[],
          set_aside_code: opportunity.set_aside_code,
        },
        jvCandidate: {
          primary_naics: candidate.primary_naics,
          other_naics: candidate.other_naics as string[],
          sba_certifications: candidate.sba_certifications as string[],
          distance: candidate.distance as number,
        },
      });
      return {
        partner: {
          id: candidate.id,
          name: candidate.name,
          primary_naics: candidate.primary_naics,
          other_naics: (candidate.other_naics ?? []) as string[],
          sba_certifications: (candidate.sba_certifications ?? []) as string[],
        },
        metrics: {
          fitScore: scoreResult.totalScore,
          scoreBreakdown: scoreResult.breakdown,
          distance: candidate.distance as number,
          naicsGapsFilled: scoreResult.naicsGapsFilled,
        },
      };
    });
    scoredCandidates.sort((a, b) => b.metrics.fitScore - a.metrics.fitScore);
    const suggestedPartners = scoredCandidates.slice(0, limit);
    consola.info('[findJVPartners] Top Ranked Candidates:', JSON.stringify(suggestedPartners, null, 2));

    return {
      lead: {
        id: leadCompany.id,
        name: leadCompany.name,
        primary_naics: leadCompany.primary_naics,
        other_naics: (leadCompany.other_naics ?? []) as string[],
        sba_certifications: (leadCompany.sba_certifications ?? []) as string[],
      },
      opportunity: {
        notice_id: opportunity.notice_id,
        title: opportunity.title,
        naics_code: opportunity.naics_code,
        secondary_naics: opportunitySecondaryNaics,
        set_aside_code: opportunity.set_aside_code ?? null,
      },
      suggested_partners: suggestedPartners,
      preselect_sample_size: preselectedCompanies.length,
    };
  },
});

async function resolveLeadCompany(
  db: ReturnType<typeof drizzleDB>,
  by: {
    leadCompanyUEI?: string;
    leadCompanyId?: string;
    leadCompanyName?: string;
  }
) {
  const { companies } = tables;

  if (by.leadCompanyId) {
    const [row] = await db.select().from(companies).where(eq(companies.id, by.leadCompanyId)).limit(1);
    if (row) return row;
    return { error: `Lead company id ${by.leadCompanyId} not found.` } as const;
  }

  if (by.leadCompanyUEI) {
    const [row] = await db.select().from(companies).where(eq(companies.uei, by.leadCompanyUEI)).limit(1);
    if (row) return row;
    return { error: `Lead company UEI ${by.leadCompanyUEI} not found.` } as const;
  }

  if (by.leadCompanyName) {
    const [exact] = await db.select().from(companies).where(eq(companies.name, by.leadCompanyName)).limit(1);
    if (exact) return exact;

    // fuzzyish fallback: ILIKE %name%
    const suggestions = await db
      .select({ id: companies.id, name: companies.name, uei: companies.uei })
      .from(companies)
      .where(ilike(companies.name, `%${by.leadCompanyName}%`))
      .limit(5);

    const hint = suggestions.length
      ? ` Did you mean: ${suggestions.map(s => `${s.name} (UEI ${s.uei})`).join('; ')} ?`
      : '';
    return { error: `Lead company "${by.leadCompanyName}" not found.${hint}` } as const;
  }
  return { error: 'Provide companyId, companyUEI, or companyName.' } as const;
}

export async function resolveOpportunity(
  db: ReturnType<typeof drizzleDB>,
  by: {
    opportunityNoticeId?: string;
    opportunitySolicitationNumber?: string;
    opportunityTitle?: string;
  }
) {
  const { opportunities } = tables;

  if (by.opportunityNoticeId) {
    const [row] = await db.select().from(opportunities)
      .where(eq(opportunities.notice_id, by.opportunityNoticeId)).limit(1);
    if (row) return row;
    return { error: `Opportunity notice_id ${by.opportunityNoticeId} not found.` } as const;
  }

  if (by.opportunitySolicitationNumber) {
    const [row] = await db.select().from(opportunities)
      .where(eq(opportunities.solicitation_number, by.opportunitySolicitationNumber)).limit(1);
    if (row) return row;

    // show close matches on fallback
    const suggestions = await db.select({
      notice_id: opportunities.notice_id,
      solicitation_number: opportunities.solicitation_number,
      title: opportunities.title,
    })
      .from(opportunities)
      .where(ilike(opportunities.solicitation_number, `%${by.opportunitySolicitationNumber}%`))
      .limit(5);

    const hint = suggestions.length
      ? ` Did you mean: ${suggestions.map(s => `${s.solicitation_number} (${s.notice_id} - ${s.title})`).join('; ')} ?`
      : '';
    return { error: `Solicitation number "${by.opportunitySolicitationNumber}" not found.${hint}` } as const;
  }

  if (by.opportunityTitle) {
    const [exact] = await db.select().from(opportunities)
      .where(eq(opportunities.title, by.opportunityTitle)).limit(1);
    if (exact) return exact;

    const suggestions = await db.select({
      notice_id: opportunities.notice_id,
      solicitation_number: opportunities.solicitation_number,
      title: opportunities.title,
    })
      .from(opportunities)
      .where(ilike(opportunities.title, `%${by.opportunityTitle}%`))
      .limit(5);

    const hint = suggestions.length
      ? ` Did you mean: ${suggestions.map(s => `"${s.title}" (${s.notice_id})`).join('; ')} ?`
      : '';
    return { error: `Opportunity titled "${by.opportunityTitle}" not found.${hint}` } as const;
  }
  return { error: 'Provide opportunityNoticeId, opportunitySolicitationNumber, or opportunityTitle.' } as const;
}

function mapSetAside(setAside: string | null, sbaCerts?: string[] | null): SetAsideStatus {
  if (!setAside) return 'not_applicable';
  const certs = new Set((sbaCerts ?? []).map(s => s.toUpperCase()));
  if (setAside === 'SBA') return certs.has('8A') ? 'qualified' : 'ineligible';
  if (setAside === 'SDVOSBC') return certs.has('SDVOSB') ? 'qualified' : 'ineligible';
  if (setAside === 'WOSB') return (certs.has('WOSB') || certs.has('EDWOSB')) ? 'qualified' : 'ineligible';
  if (setAside === 'HZC') return certs.has('HZ') ? 'qualified' : 'ineligible';
  return 'eligible';
}


type CompanyProfile = {
  primary_naics: string;
  other_naics?: string[] | null;
  sba_certifications?: string[] | null;
};

type OpportunityProfile = {
  primary_naics: string;
  secondary_naics?: string[] | null;
  set_aside_code?: string | null;
};

type CandidateMetrics = {
  distance: number; // Cosine distance from ANN search (0 = identical, 1 = dissimilar)
};

export type PartnerFitScoreArgs = {
  leadCompany: CompanyProfile;
  opportunity: OpportunityProfile;
  jvCandidate: CompanyProfile & CandidateMetrics;
};

function partnerFitScore({ leadCompany, opportunity, jvCandidate }: PartnerFitScoreArgs) {
  const WEIGHTS = {
    naicsCoverage: 0.50, // heavily favoring coverage here because filling gaps is priority
    semantic: 0.25,
    setAside: 0.25,
  };
  const PENALTIES = { primaryNaicsOverlap: 0.70 }; // 30% penalty for direct overlaps

  // lower distance is better, so we invert it
  const semanticScore = 1 - (jvCandidate.distance ?? 1);

  // calculate NAICS coverage score
  const leadNaics = new Set([
    leadCompany.primary_naics,
    ...(leadCompany.other_naics ?? []),
  ]);
  const candidateNaics = new Set([
    jvCandidate.primary_naics,
    ...(jvCandidate.other_naics ?? [])
  ]);
  const requiredSecondaryNaics = opportunity.secondary_naics ?? [];

  const capabilityGaps = requiredSecondaryNaics.filter(code => !leadNaics.has(code));
  const gapsFilled = capabilityGaps.filter(code => candidateNaics.has(code));

  // if there are no gaps, JV candidate is perfect on this metric
  const naicsCoverageScore = capabilityGaps.length > 0.0
    ? gapsFilled.length / capabilityGaps.length
    : 1;

  const setAsideStatus = mapSetAside(
    opportunity.set_aside_code ?? null,
    jvCandidate.sba_certifications ?? []
  );

  let setAsideScore = 0.0;
  if (setAsideStatus === 'qualified') setAsideScore = 1;
  else if (setAsideStatus === 'eligible') setAsideScore = 0.5; // partial credit for eligibility

  const weightedSum =
    semanticScore * WEIGHTS.semantic
    + naicsCoverageScore * WEIGHTS.naicsCoverage
    + setAsideScore * WEIGHTS.setAside;

  const overlapPenalty = leadCompany.primary_naics === jvCandidate.primary_naics
    ? PENALTIES.primaryNaicsOverlap
    : 1.0;

  const totalScore = weightedSum * overlapPenalty;

  const result = {
    totalScore: Math.max(0, Math.min(1, totalScore)),
    breakdown: {
      semanticScore,
      naicsCoverageScore,
      setAsideScore,
      overlapPenalty,
    },
    naicsGapsFilled: gapsFilled,
  };
  return result;
}