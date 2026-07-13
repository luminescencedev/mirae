CREATE TABLE "studio_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"artist_id" uuid NOT NULL,
	"type" text NOT NULL,
	"link_id" uuid,
	"session_hash" text,
	"ref_host" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "studio_events" ADD CONSTRAINT "studio_events_artist_id_artist_profiles_id_fk" FOREIGN KEY ("artist_id") REFERENCES "public"."artist_profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "studio_events_artist_created_idx" ON "studio_events" USING btree ("artist_id","created_at");--> statement-breakpoint
CREATE INDEX "studio_events_artist_type_idx" ON "studio_events" USING btree ("artist_id","type");