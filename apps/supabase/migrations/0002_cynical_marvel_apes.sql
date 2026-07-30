CREATE TABLE "fleet_deck_members" (
	"deck_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(20) DEFAULT 'member',
	"joined_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "fleet_deck_members_deck_id_user_id_pk" PRIMARY KEY("deck_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "fleet_decks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"captain_id" uuid NOT NULL,
	"name" varchar(60) NOT NULL,
	"description" text,
	"category" varchar(50),
	"is_open" boolean DEFAULT true,
	"member_count" integer DEFAULT 0,
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "fleet_posts" ADD COLUMN "deck_id" uuid;--> statement-breakpoint
ALTER TABLE "fleet_deck_members" ADD CONSTRAINT "fleet_deck_members_deck_id_fleet_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."fleet_decks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_deck_members" ADD CONSTRAINT "fleet_deck_members_user_id_profiles_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_decks" ADD CONSTRAINT "fleet_decks_captain_id_profiles_id_fk" FOREIGN KEY ("captain_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fleet_posts" ADD CONSTRAINT "fleet_posts_deck_id_fleet_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."fleet_decks"("id") ON DELETE set null ON UPDATE no action;