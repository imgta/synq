ALTER TABLE "companies" ALTER COLUMN "embedding_summary" SET DATA TYPE vector(384);--> statement-breakpoint
ALTER TABLE "naics" ALTER COLUMN "embedding_summary" SET DATA TYPE vector(384);--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "embedding_summary" SET DATA TYPE vector(384);--> statement-breakpoint
ALTER TABLE "opportunities" ALTER COLUMN "embedding_fulltext" SET DATA TYPE vector(768);--> statement-breakpoint
ALTER TABLE "programs" ALTER COLUMN "embedding_summary" SET DATA TYPE vector(384);