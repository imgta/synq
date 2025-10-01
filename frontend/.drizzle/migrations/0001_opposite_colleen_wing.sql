CREATE TYPE "public"."level" AS ENUM('sector', 'subsector', 'industry_group', 'naics_industry', 'national_industry');--> statement-breakpoint
CREATE TYPE "public"."contract_performance" AS ENUM('exceptional', 'very_good', 'satisfactory', 'marginal', 'unsatisfactory');--> statement-breakpoint
CREATE TYPE "public"."size_standard_metric" AS ENUM('receipts', 'employees');--> statement-breakpoint
CREATE TABLE "awards" (
	"id" text PRIMARY KEY NOT NULL,
	"program_code" text,
	"naics_code" text NOT NULL,
	"contract_number" text NOT NULL,
	"awarded_date" timestamp NOT NULL,
	"awardee_uei" text NOT NULL,
	"sub_ueis" jsonb,
	"award_amount" bigint,
	"performance" "contract_performance",
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"primary_naics" text NOT NULL,
	"other_naics" jsonb,
	"uei" text,
	"employee_count" integer,
	"annual_revenue" bigint,
	"sba_certifications" jsonb,
	"certifications" jsonb,
	"past_performance" jsonb,
	"embedding_summary" vector(512),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "companies_uei_unique" UNIQUE("uei")
);
--> statement-breakpoint
CREATE TABLE "company_opportunity" (
	"company_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"fit_metrics" jsonb DEFAULT '{}'::jsonb,
	"fit_score" numeric(3, 2),
	"jv_analysis" jsonb DEFAULT '{}'::jsonb,
	"bookmarked_at" timestamp (6) with time zone,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "company_opportunity_company_id_opportunity_id_pk" PRIMARY KEY("company_id","opportunity_id")
);
--> statement-breakpoint
CREATE TABLE "naics" (
	"code" text PRIMARY KEY NOT NULL,
	"description" text NOT NULL,
	"title" text,
	"level" "level" NOT NULL,
	"sector" text NOT NULL,
	"trilateral" boolean,
	"size_standard_metric" "size_standard_metric",
	"size_standard_max" bigint,
	"related_codes" jsonb DEFAULT '[]'::jsonb,
	"cross_ref_count" integer DEFAULT 0,
	"defense_related" boolean DEFAULT false,
	"defense_keyword_count" integer DEFAULT 0,
	"validated" boolean DEFAULT true,
	"change_indicator" text,
	"embedding_summary" vector(512),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"notice_id" text NOT NULL,
	"solicitation_number" text,
	"modification_number" text,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"type" text NOT NULL,
	"base_type" text,
	"archive_type" text,
	"archive_date" timestamp with time zone,
	"full_parent_path_name" text,
	"full_parent_path_code" text,
	"organization_type" text,
	"office_address" jsonb,
	"naics_code" text NOT NULL,
	"naics_description" text,
	"classification_code" text,
	"set_aside_code" text,
	"set_aside_description" text,
	"posted_date" timestamp (6) with time zone NOT NULL,
	"response_deadline" timestamp (6) with time zone,
	"updated_date" timestamp (6) with time zone,
	"award_data" jsonb,
	"point_of_contact" jsonb DEFAULT '[]'::jsonb,
	"place_of_performance" jsonb,
	"description_link" text,
	"additional_info_link" text,
	"ui_link" text,
	"resource_links" jsonb DEFAULT '[]'::jsonb,
	"active" boolean DEFAULT true NOT NULL,
	"additional_info_required" boolean DEFAULT false,
	"embedding_summary" vector(512),
	"embedding_fulltext" vector(1024),
	"estimated_value" bigint,
	"key_requirements" jsonb DEFAULT '[]'::jsonb,
	"secondary_naics" jsonb DEFAULT '[]'::jsonb,
	"complexity_score" numeric(3, 2),
	"raw_data" jsonb,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunities_notice_id_unique" UNIQUE("notice_id")
);
--> statement-breakpoint
CREATE TABLE "opportunity_program" (
	"opportunity_id" text NOT NULL,
	"program_id" text NOT NULL,
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "opportunity_program_opportunity_id_program_id_pk" PRIMARY KEY("opportunity_id","program_id")
);
--> statement-breakpoint
CREATE TABLE "programs" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"code" text,
	"description" text NOT NULL,
	"estimated_value" bigint,
	"key_naics" jsonb,
	"prime_contractors" jsonb,
	"embedding_summary" vector(512),
	"created_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp (6) with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "programs_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_program_code_programs_code_fk" FOREIGN KEY ("program_code") REFERENCES "public"."programs"("code") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "awards" ADD CONSTRAINT "awards_naics_code_naics_code_fk" FOREIGN KEY ("naics_code") REFERENCES "public"."naics"("code") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_opportunity" ADD CONSTRAINT "company_opportunity_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "company_opportunity" ADD CONSTRAINT "company_opportunity_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_program" ADD CONSTRAINT "opportunity_program_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunity_program" ADD CONSTRAINT "opportunity_program_program_id_programs_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."programs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "awards_naics_idx" ON "awards" USING btree ("naics_code");--> statement-breakpoint
CREATE INDEX "awards_program_idx" ON "awards" USING btree ("program_code");--> statement-breakpoint
CREATE INDEX "awards_date_idx" ON "awards" USING btree ("awarded_date");--> statement-breakpoint
CREATE INDEX "companies_embedding_summary_idx" ON "companies" USING hnsw ("embedding_summary" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "co_opp_company_fit_score_idx" ON "company_opportunity" USING btree ("company_id","fit_score");--> statement-breakpoint
CREATE INDEX "co_opp_opportunity_idx" ON "company_opportunity" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "co_opp_bookmarked_idx" ON "company_opportunity" USING btree ("company_id","bookmarked_at") WHERE bookmarked_at IS NOT NULL;--> statement-breakpoint
CREATE INDEX "naics_sector_idx" ON "naics" USING btree ("sector");--> statement-breakpoint
CREATE INDEX "naics_level_idx" ON "naics" USING btree ("level");--> statement-breakpoint
CREATE INDEX "naics_defense_idx" ON "naics" USING btree ("defense_related");--> statement-breakpoint
CREATE INDEX "naics_embedding_summary_idx" ON "naics" USING hnsw ("embedding_summary" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "opp_notice_id_idx" ON "opportunities" USING btree ("notice_id");--> statement-breakpoint
CREATE INDEX "opp_naics_idx" ON "opportunities" USING btree ("naics_code");--> statement-breakpoint
CREATE INDEX "opp_posted_date_idx" ON "opportunities" USING btree ("posted_date");--> statement-breakpoint
CREATE INDEX "opp_response_deadline_idx" ON "opportunities" USING btree ("response_deadline");--> statement-breakpoint
CREATE INDEX "opp_set_aside_idx" ON "opportunities" USING btree ("set_aside_code");--> statement-breakpoint
CREATE INDEX "opp_active_idx" ON "opportunities" USING btree ("active");--> statement-breakpoint
CREATE INDEX "opp_active_naics_idx" ON "opportunities" USING btree ("active","naics_code");--> statement-breakpoint
CREATE INDEX "opp_active_posted_idx" ON "opportunities" USING btree ("active","posted_date");--> statement-breakpoint
CREATE INDEX "opp_embedding_summary_idx" ON "opportunities" USING hnsw ("embedding_summary" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "opp_embedding_fulltext_idx" ON "opportunities" USING hnsw ("embedding_fulltext" vector_cosine_ops);--> statement-breakpoint
CREATE INDEX "opp_prog_opportunity_idx" ON "opportunity_program" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opp_prog_program_idx" ON "opportunity_program" USING btree ("program_id");--> statement-breakpoint
CREATE INDEX "programs_code_idx" ON "programs" USING btree ("code");--> statement-breakpoint
CREATE INDEX "programs_embedding_summary_idx" ON "programs" USING hnsw ("embedding_summary" vector_cosine_ops);