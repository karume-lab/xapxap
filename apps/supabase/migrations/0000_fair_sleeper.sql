DO $$ BEGIN
 CREATE TYPE "fame_status" AS ENUM('evaluating', 'fame_burst', 'trend_deck', 'rejected');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "stream_quality" AS ENUM('drift_expo', 'aqua_premium');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transaction_status" AS ENUM('pending', 'completed', 'failed', 'fraud_flagged');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 CREATE TYPE "transaction_type" AS ENUM('tip', 'deposit', 'withdrawal', 'stream_entry');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fame_heuristics" (
	"post_id" uuid PRIMARY KEY NOT NULL,
	"status" "fame_status" DEFAULT 'evaluating',
	"checksum_verified" boolean DEFAULT false,
	"resolution_meets_floor" boolean DEFAULT false,
	"sentiment_score" numeric(5, 4),
	"tag_correlation_score" numeric(5, 4),
	"burst_started_at" timestamp with time zone,
	"burst_ended_at" timestamp with time zone,
	"views_count" integer DEFAULT 0,
	"completion_rate" numeric(5, 4) DEFAULT '0',
	"latency_of_interest_ms" integer,
	"follow_conversion_rate" numeric(5, 4) DEFAULT '0',
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "fleet_posts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_id" uuid NOT NULL,
	"parent_id" uuid,
	"content" text,
	"media_url" text,
	"media_type" varchar(20),
	"checksum" text,
	"resolution" integer,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "gem_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sender_id" uuid,
	"receiver_id" uuid,
	"amount" integer NOT NULL,
	"type" "transaction_type" NOT NULL,
	"status" "transaction_status" DEFAULT 'completed',
	"reference_id" text,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "live_streams" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"broadcaster_id" uuid NOT NULL,
	"title" varchar(200) NOT NULL,
	"quality" "stream_quality" DEFAULT 'drift_expo',
	"is_live" boolean DEFAULT false,
	"playback_url" text,
	"is_gated" boolean DEFAULT false,
	"entry_fee_gems" integer DEFAULT 0,
	"started_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "payout_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"gem_amount" integer NOT NULL,
	"fiat_amount" numeric(10, 2) NOT NULL,
	"fiat_currency" varchar(3) DEFAULT 'KES',
	"mobile_money_number" varchar(20) NOT NULL,
	"provider" varchar(50) NOT NULL,
	"status" "transaction_status" DEFAULT 'pending',
	"created_at" timestamp with time zone DEFAULT now(),
	"processed_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_options" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"poll_id" uuid NOT NULL,
	"option_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "poll_votes" (
	"option_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "poll_votes_option_id_user_id_pk" PRIMARY KEY("option_id","user_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "polls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"post_id" uuid NOT NULL,
	"question" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(50) NOT NULL,
	"display_name" varchar(100),
	"avatar_url" text,
	"bio" text,
	"is_premium" boolean DEFAULT false,
	"role" varchar(20) DEFAULT 'user',
	"date_of_birth" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "profiles_username_unique" UNIQUE("username")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "stream_tickets" (
	"stream_id" uuid NOT NULL,
	"viewer_id" uuid NOT NULL,
	"purchased_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "stream_tickets_stream_id_viewer_id_pk" PRIMARY KEY("stream_id","viewer_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "wallets" (
	"user_id" uuid PRIMARY KEY NOT NULL,
	"balance" integer DEFAULT 0 NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fame_heuristics" ADD CONSTRAINT "fame_heuristics_post_id_fleet_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "fleet_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fleet_posts" ADD CONSTRAINT "fleet_posts_author_id_profiles_id_fk" FOREIGN KEY ("author_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "fleet_posts" ADD CONSTRAINT "fleet_posts_parent_id_fleet_posts_id_fk" FOREIGN KEY ("parent_id") REFERENCES "fleet_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gem_transactions" ADD CONSTRAINT "gem_transactions_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "gem_transactions" ADD CONSTRAINT "gem_transactions_receiver_id_profiles_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "profiles"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "live_streams" ADD CONSTRAINT "live_streams_broadcaster_id_profiles_id_fk" FOREIGN KEY ("broadcaster_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "payout_requests" ADD CONSTRAINT "payout_requests_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_options" ADD CONSTRAINT "poll_options_poll_id_polls_id_fk" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_option_id_poll_options_id_fk" FOREIGN KEY ("option_id") REFERENCES "poll_options"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "polls" ADD CONSTRAINT "polls_post_id_fleet_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "fleet_posts"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stream_tickets" ADD CONSTRAINT "stream_tickets_stream_id_live_streams_id_fk" FOREIGN KEY ("stream_id") REFERENCES "live_streams"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "stream_tickets" ADD CONSTRAINT "stream_tickets_viewer_id_profiles_id_fk" FOREIGN KEY ("viewer_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
