CREATE SCHEMA "_realtime";
--> statement-breakpoint
CREATE SCHEMA "graphql_public";
--> statement-breakpoint
CREATE SCHEMA "realtime";
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "post_interactions" (
	"post_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"type" varchar(10) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "post_interactions_post_id_user_id_type_pk" PRIMARY KEY("post_id","user_id","type")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_interactions" ADD CONSTRAINT "post_interactions_post_id_fleet_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "fleet_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "post_interactions" ADD CONSTRAINT "post_interactions_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint

GRANT USAGE ON SCHEMA graphql_public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA graphql_public TO supabase_admin;

GRANT ALL ON SCHEMA _realtime TO postgres;
GRANT ALL ON SCHEMA _realtime TO supabase_admin;

GRANT ALL ON SCHEMA realtime TO postgres;
GRANT ALL ON SCHEMA realtime TO supabase_admin;
