-- Make all FK deletes cascade so removing a deck/profile cleans up children.

-- Deleting a fleet deck removes its posts (they belong to the deck).
ALTER TABLE "public"."fleet_posts" DROP CONSTRAINT "fleet_posts_deck_id_fleet_decks_id_fk";
ALTER TABLE "public"."fleet_posts" ADD CONSTRAINT "fleet_posts_deck_id_fleet_decks_id_fk" FOREIGN KEY ("deck_id") REFERENCES "public"."fleet_decks"("id") ON DELETE cascade ON UPDATE no action;

-- Deleting a profile removes their gem ledger entries.
ALTER TABLE "public"."gem_transactions" DROP CONSTRAINT "gem_transactions_sender_id_profiles_id_fk";
ALTER TABLE "public"."gem_transactions" ADD CONSTRAINT "gem_transactions_sender_id_profiles_id_fk" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;

ALTER TABLE "public"."gem_transactions" DROP CONSTRAINT "gem_transactions_receiver_id_profiles_id_fk";
ALTER TABLE "public"."gem_transactions" ADD CONSTRAINT "gem_transactions_receiver_id_profiles_id_fk" FOREIGN KEY ("receiver_id") REFERENCES "public"."profiles"("id") ON DELETE cascade ON UPDATE no action;
