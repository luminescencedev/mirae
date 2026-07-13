CREATE TYPE "public"."link_style" AS ENUM('simple', 'card', 'media', 'featured');--> statement-breakpoint
CREATE TYPE "public"."link_type" AS ENUM('social', 'shop', 'support', 'video', 'stream', 'newsletter', 'contact', 'custom');--> statement-breakpoint
CREATE TABLE "artist_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"title" text NOT NULL,
	"url" text NOT NULL,
	"platform" text,
	"type" "link_type" DEFAULT 'custom' NOT NULL,
	"style" "link_style" DEFAULT 'simple' NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"enabled" boolean DEFAULT true NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "artist_links" ADD CONSTRAINT "artist_links_artist_id_artist_profiles_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "artist_links_artist_idx" ON "artist_links" USING btree ("artist_id");--> statement-breakpoint
CREATE INDEX "artist_links_artist_position_idx" ON "artist_links" USING btree ("artist_id","position");