import { pgTable, boolean, text, integer, bigint, pgEnum, decimal, timestamp, jsonb, vector, index, primaryKey } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const EMBEDDING_DIMENSIONS = 384;

function genUUID(length: number) {
  return crypto.randomUUID().replace(/-/g, '').slice(0, length);
}

export const sizeMetricEnum = pgEnum('size_standard_metric', ['receipts', 'employees']);

export const naics = pgTable('naics', {
  code: text('code').primaryKey(), // 6-digit padded code
  description: text('description').notNull(),
  title: text('title'),
  level: integer('level').notNull(), // 2-6 (specificity)
  sector: text('sector').notNull(), // first 2 digits
  subsector: text('subsector'),
  industry_group: text('industry_group'),
  industry: text('industry'),
  // size standard metrics for small business set-asides qualification
  size_standard_metric: sizeMetricEnum(), // receipts | employees
  size_standard_max: bigint('size_standard_max', { mode: 'number' }), // revenue or headcount
  // relationships
  related_codes: jsonb('related_codes').$type<string[]>().default([]),
  cross_ref_count: integer('cross_ref_count').default(0),
  defense_related: boolean('defense_related').default(false),
  defense_keyword_count: integer('defense_keyword_count').default(0),
  validated: boolean('validated').default(true),
  change_indicator: text('change_indicator'),
  embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }),
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('naics_sector_idx').on(table.sector),
  index('naics_level_idx').on(table.level),
  index('naics_defense_idx').on(table.defense_related),
  index('naics_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);

export const companies = pgTable('companies', {
  id: text('id').primaryKey().$defaultFn(() => genUUID(20)),
  name: text('name').notNull(),
  description: text('description').notNull(),
  primary_naics: text('primary_naics').notNull(),
  other_naics: jsonb('other_naics').$type<string[]>(),
  uei: text('uei').unique(), // 12-char, unique entity identifier
  employee_count: integer('employee_count'),
  annual_revenue: bigint('annual_revenue', { mode: 'number' }),
  sba_certifications: jsonb('sba_certifications').$type<'8A' | 'WOSB' | 'EDWOSB' | 'VOSB' | 'SDVOSB' | 'HZ'[]>(),
  // capability signals for AI matching
  certifications: jsonb('certifications').$type<string[]>(), // ISO 9001, CMMC, FedRAMP
  past_performance: jsonb('past_performance').$type<{
    rating?: number; // 0-5 scale
    notable_contracts?: string[]; // ['$12M USAF', 'VA EHR integration']
  }>(),
  embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }),
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  // neon supports HNSW indexes for vector dimension sizes up to 2000
  index('companies_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);

/**
 * Contract Opportunity Notices
 * - sourced from SAM.gov opportunities v2 API: https://open.gsa.gov/api/get-opportunities-public-api
 * - keeping raw json for potential remaps
 */
export const opportunities = pgTable('opportunities', {
  id: text('id').primaryKey().$defaultFn(() => genUUID(20)),
  notice_id: text('notice_id').unique().notNull(),
  solicitation_number: text('solicitation_number'),
  modification_number: text('modification_number'),
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // current procurement type, eg: 'Solicitation'
  base_type: text('base_type'), // original procurement type, eg: 'Sources Sought'
  archive_type: text('archive_type'), // 'auto15', 'autoclosed'
  archive_date: timestamp('archive_date', { mode: 'date', withTimezone: true }),
  // federal hierarchy (FH) info, v2 (replaces deprecated dept/subtier/office)
  full_parent_path_name: text('full_parent_path_name'), // org names associated w/ notice, separated via dot notation
  full_parent_path_code: text('full_parent_path_code'), // org codes associated w/ notice, separated via dot notation
  organization_type: text('organization_type'), // 'OFFICE', 'DEPARTMENT', 'SUB-TIER'
  office_address: jsonb('office_address').$type<{
    city?: string;
    state?: string;
    zipcode?: string;
    country_code?: string;
  }>(),
  naics_code: text('naics_code').notNull(),
  naics_description: text('naics_description'),
  classification_code: text('classification_code'), // product service code (PSC)
  set_aside_code: text('set_aside_code'), // 'SBA', 'SDVOSBC', 'HZC'
  set_aside_description: text('set_aside_description'),
  // timeline dates
  posted_date: timestamp('posted_date', { precision: 6, withTimezone: true }).notNull(),
  response_deadline: timestamp('response_deadline', { precision: 6, withTimezone: true }),
  updated_date: timestamp('updated_date', { precision: 6, withTimezone: true }),
  
  award_data: jsonb('award_data').$type<{
    number?: string;
    amount?: number;
    date?: string;
    awardee?: {
      name?: string;
      uei_sam?: string;
      location?: {
        street_address?: string;
        street_address2?: string;
        city?: { code?: string; name?: string; };
        state?: { code?: string; name?: string; };
        country?: { code?: string; name?: string; };
        zip?: string;
      };
    };
  }>(),
  point_of_contact: jsonb('point_of_contact').$type<{
    fax?: string;
    type?: string; // 'primary', 'secondary'
    email?: string;
    phone?: string;
    title?: string;
    full_name?: string;
    additional_info?: { content?: string; };
  }[]>().default([]),
  // place of performance (where contract services are rendered, or goods delivered)
  place_of_performance: jsonb('place_of_performance').$type<{
    street_address?: string;
    street_address2?: string;
    city?: { code?: string; name?: string; };
    state?: { code?: string; name?: string; };
    country?: { code?: string; name?: string; };
    zip?: string;
  }>(),
  // links, attachments
  description_link: text('description_link'), // URL link to opportunity description
  additional_info_link: text('additional_info_link'),
  ui_link: text('ui_link'), // direct link to SAM.gov UI, we should return this link to users
  resource_links: jsonb('resource_links').$type<string[]>().default([]), // direct URL links to download attachments
  // statuses, flags
  active: boolean('active').default(true).notNull(), // mapped from 'Yes' | 'No' string
  additional_info_required: boolean('additional_info_required').default(false),
  // AI features
  embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }),
  estimated_value: bigint('estimated_value', {mode: 'number'}), // AI-extracted contract estimated value from description text, attachment docs
  key_requirements: jsonb('key_requirements').$type<string[]>().default([]), // AI-extracted key requirements
  secondary_naics: jsonb('secondary_naics').$type<string[]>().default([]), // AI-parse description text to find ancillary NAICS codes
  complexity_score: decimal('complexity_score', { precision: 3, scale: 2 }), // 0.00-1.00 AI-assessed complexity
  raw_data: jsonb('raw_data'), // raw API response (debugging, compliance, future remapping)
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  // single-column row indexes for base filters
  index('opp_notice_id_idx').on(table.notice_id),
  index('opp_naics_idx').on(table.naics_code),
  index('opp_posted_date_idx').on(table.posted_date),
  index('opp_response_deadline_idx').on(table.response_deadline),
  index('opp_set_aside_idx').on(table.set_aside_code),
  index('opp_active_idx').on(table.active),
  // composite indexes for commonly paired filters (active + ?)
  index('opp_active_naics_idx').on(table.active, table.naics_code),
  index('opp_active_posted_idx').on(table.active, table.posted_date),
  index('opp_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);


export const company_opportunity = pgTable('company_opportunity', {
  company_id: text('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  opportunity_id: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  // AI company-opportunity fitting metrics
  fit_metrics: jsonb('fit_metrics').$type<{
    naics_score?: number; // naics code alignment, 0.00-1.00
    description_score?: number; // semantic similarity, 0.00-1.00
    set_aside_status?: 'qualified' | 'eligible' | 'ineligible' | 'not_applicable'; // set-aside status enum
    reasoning?: string; // ai-generated scoring justifications
  }>().default({}),
  // TODO: once i settle on a scoring algorithm, remove this `fit_score` column--currently needed to create our `co_opp_company_fit_score_idx` index--by computing the overall score directly in an expression index
  fit_score: decimal('fit_score', { precision: 3, scale: 2 }), // overall company-opportunity fit score
  // AI joint venture partnership insights
  jv_analysis: jsonb('jv_analysis').$type<{
    capability_gaps?: string[]; // missing capabilities required for contract
    partner_picks?: string[]; // business prospects that could fill gaps
    risk_factors?: string[]; // potential stopgaps (competition, logistics, etc)
  }>().default({}),
  bookmarked_at: timestamp('bookmarked_at', { precision: 6, withTimezone: true }), // ui/ux for saving
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  primaryKey({ columns: [table.company_id, table.opportunity_id] }),
  index('co_opp_company_fit_score_idx').on(table.company_id, table.fit_score), // "show my best fits"
  index('co_opp_opportunity_idx').on(table.opportunity_id), // "who fits this opportunity?
  index('co_opp_bookmarked_idx') // "show my saved opportunities"
    .on(table.company_id, table.bookmarked_at)
    .where(sql`bookmarked_at IS NOT NULL`),
]);

/**
 * Programs - major federal acquisition programs that spawn multiple opportunities
 * Focus: High-value context for AI agent prompts about market landscape
 */
export const programs = pgTable('programs', {
  id: text('id').primaryKey().$defaultFn(() => genUUID(20)),
  name: text('name').notNull(),
  code: text('code').unique(),
  description: text('description').notNull(),
  estimated_value: bigint('estimated_value', { mode: 'number' }),
  // core AI prompt signals
  key_naics: jsonb('key_naics').$type<string[]>(), // primary NAICS codes for program
  prime_contractors: jsonb('prime_contractors').$type<string[]>(), // who typically wins
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('programs_code_idx').on(table.code),
]);

/**
 * Junction table: opportunities <-> programs
 * Enables AI to say: "This opportunity is part of the $18.5B Golden Dome program"
 */
export const opportunity_program = pgTable('opportunity_program', {
  opportunity_id: text('opportunity_id').notNull().references(() => opportunities.id, { onDelete: 'cascade' }),
  program_id: text('program_id').notNull().references(() => programs.id, { onDelete: 'cascade' }),
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  primaryKey({ columns: [table.opportunity_id, table.program_id] }),
  index('opp_prog_opportunity_idx').on(table.opportunity_id),
  index('opp_prog_program_idx').on(table.program_id),
]);


export const performanceEnum = pgEnum('contract_performance', [
  'exceptional',
  'very_good',
  'satisfactory',
  'marginal',
  'unsatisfactory'
]);
/**
 * Awards - contract award history for pattern analysis
 * Focus: Minimal data needed to show "which NAICS combinations win together"
 */
export const awards = pgTable('awards', {
  id: text('id').primaryKey().$defaultFn(() => genUUID(20)),
  program_code: text('program_code').references(() => programs.code, { onDelete: 'set null' }),
  naics_code: text('naics_code').notNull().references(() => naics.code, { onDelete: 'cascade' }),
  contract_number: text('contract_number').notNull(),
  awarded_date: timestamp('awarded_date', { mode: 'date' }).notNull(),
  // matchmaking signals
  awardee_uei: text('awardee_uei').notNull(), // prime contractor who won
  sub_ueis: jsonb('sub_ueis').$type<string[]>(), // subcontractor UEIs on this award
  award_amount: bigint('award_amount', { mode: 'number' }),
  // link to program context
  performance: performanceEnum('performance'),
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  index('awards_naics_idx').on(table.naics_code),
  index('awards_program_idx').on(table.program_code),
  index('awards_date_idx').on(table.awarded_date),
]);