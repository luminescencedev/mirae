CREATE TYPE "public"."project_type" AS ENUM('illustration', 'character_design', 'vtuber', 'emote', 'concept_art', 'animation', 'other');--> statement-breakpoint
CREATE TYPE "public"."project_visibility" AS ENUM('draft', 'published', 'archived');--> statement-breakpoint
CREATE TABLE "portfolio_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"r2_key" text NOT NULL,
	"mime_type" text NOT NULL,
	"width" integer,
	"height" integer,
	"size_bytes" integer,
	"alt_text" text,
	"position" integer DEFAULT 0 NOT NULL,
	"blur_data" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "portfolio_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"project_type" "project_type" DEFAULT 'illustration' NOT NULL,
	"visibility" "project_visibility" DEFAULT 'draft' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"published_at" timestamp with time zone,
	CONSTRAINT "portfolio_projects_artist_slug_key" UNIQUE("artist_id","slug")
);
--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD COLUMN "avatar_r2_key" text;--> statement-breakpoint
ALTER TABLE "artist_profiles" ADD COLUMN "cover_r2_key" text;--> statement-breakpoint
ALTER TABLE "portfolio_assets" ADD CONSTRAINT "portfolio_assets_project_id_portfolio_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."portfolio_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "portfolio_projects" ADD CONSTRAINT "portfolio_projects_artist_id_artist_profiles_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "portfolio_assets_project_idx" ON "portfolio_assets" USING btree ("project_id");--> statement-breakpoint
CREATE INDEX "portfolio_assets_project_position_idx" ON "portfolio_assets" USING btree ("project_id","position");--> statement-breakpoint
CREATE INDEX "portfolio_projects_artist_idx" ON "portfolio_projects" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "portfolio_projects_artist_visibility_idx" ON "portfolio_projects" USING btree ("artist_id","visibility");--> statement-breakpoint
CREATE INDEX "portfolio_projects_artist_position_idx" ON "portfolio_projects" USING btree ("artist_id","position");