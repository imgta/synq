import { pgTable, boolean, text, integer, decimal, timestamp, jsonb, vector, index } from 'drizzle-orm/pg-core';

const EMBEDDING_DIMENSIONS = 384;

function genUUID(length: number) {
  return crypto.randomUUID().replace(/-/g, '').slice(0, length);
}

export const companies = pgTable('companies', {
  id: text('id').$defaultFn(() => genUUID(20)).primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  primary_naics: text('primary_naics').notNull(),
  other_naics: jsonb('other_naics').$type<string[]>(),
  uei: text('uei').unique(), // 12-char, unique entity identifier
  set_asides: jsonb('set_asides').$type<string[]>(), // SB, WO, VO, 8a, HUBZone, etc.
  employee_count: integer('employee_count'),
  annual_revenue: integer('annual_revenue'),
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
  id: text('id').$defaultFn(() => genUUID(20)).primaryKey(),
  notice_id: text('notice_id').unique().notNull(),
  solicitation_number: text('solicitation_number'),
  modification_number: text('modification_number'),

  // basic opportunity info
  title: text('title').notNull(),
  description: text('description').notNull(),
  type: text('type').notNull(), // current procurement type ('Solicitation', 'Award Notice', 'Sources Sought')
  base_type: text('base_type'), // original procurement type ('Presolicitation', 'Combined Synopsis/Solicitation')
  archive_type: text('archive_type'), // 'auto15', 'autoclosed'
  archive_date: timestamp('archive_date', { mode: 'date', withTimezone: true }),

  // federal hierarchy (FH) info, v2 replacement for deprecated dept/subtier/office
  full_parent_path_name: text('full_parent_path_name'), // all org names associated w/ notice, separated via dot notation
  full_parent_path_code: text('full_parent_path_code'), // all org codes associated w/ notice, separated via dot notation
  organization_type: text('organization_type'), // 'OFFICE', 'DEPARTMENT', 'SUB-TIER'
  office_address: jsonb('office_address').$type<{
    city?: string;
    state?: string;
    zipcode?: string;
    country_code?: string;
  }>(),

  // naics codes, classifications
  naics_code: text('naics_code').notNull(),
  naics_description: text('naics_description'),
  classification_code: text('classification_code'), // product service code (PSC)
  set_aside_description: text('set_aside_description'), // 'Total Small Business Set-Aside (FAR 19.5)'
  set_aside_code: text('set_aside_code'), // 'SBA', 'SDVOSBC', 'HZC'

  // timeline dates
  posted_date: timestamp('posted_date', { precision: 6, withTimezone: true }).notNull(),
  response_deadline: timestamp('response_deadline', { precision: 6, withTimezone: true }),
  updated_date: timestamp('updated_date', { precision: 6, withTimezone: true }),
  // award info
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

  // contact info
  point_of_contact: jsonb('point_of_contact').$type<Array<{
    type?: string; // 'primary', 'secondary'
    title?: string;
    full_name?: string;
    email?: string;
    phone?: string;
    fax?: string;
    additional_info?: { content?: string; };
  }>>,

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
  ui_link: text('ui_link'), // direct link to SAM.gov UI
  resource_links: jsonb('resource_links').$type<string[]>(), // direct URL links to download attachments

  // statuses, flags
  active: boolean('active').default(true).notNull(), // mapped from 'Yes' | 'No' string
  additional_info_required: boolean('additional_info_required').default(false),

  // AI features
  embedding: vector('embedding', { dimensions: EMBEDDING_DIMENSIONS }),
  key_requirements: jsonb('key_requirements').$type<string[]>(), // AI-extracted key requirements
  complexity_score: decimal('complexity_score', { precision: 3, scale: 2 }), // 0.00-1.00 AI-assessed complexity

  raw_data: jsonb('raw_data'), // raw API response (debugging, compliance, future remapping)
  created_at: timestamp('created_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
  updated_at: timestamp('updated_at', { precision: 6, withTimezone: true }).defaultNow().notNull(),
}, table => [
  // base filter indexes
  index('opportunities_notice_id_idx').on(table.notice_id),
  index('opportunities_naics_idx').on(table.naics_code),
  index('opportunities_posted_date_idx').on(table.posted_date),
  index('opportunities_response_deadline_idx').on(table.response_deadline),
  index('opportunities_set_aside_idx').on(table.set_aside_code),
  index('opportunities_active_idx').on(table.active),
  // composite indexes for common active + secondary filter
  index('opportunities_active_naics_idx').on(table.active, table.naics_code),
  index('opportunities_active_posted_idx').on(table.active, table.posted_date),
  index('opportunities_embedding_idx').using('hnsw', table.embedding.op('vector_cosine_ops')),
]);
