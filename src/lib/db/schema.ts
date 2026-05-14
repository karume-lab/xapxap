import {
  type AnyPgColumn,
  boolean,
  decimal,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

// ==============================================================================
// ENUMS
// ==============================================================================

export const transactionTypeEnum = pgEnum('transaction_type', [
  'tip',
  'deposit',
  'withdrawal',
  'stream_entry',
]);

export const transactionStatusEnum = pgEnum('transaction_status', [
  'pending',
  'completed',
  'failed',
  'fraud_flagged',
]);

export const fameStatusEnum = pgEnum('fame_status', [
  'evaluating',
  'fame_burst',
  'trend_deck',
  'rejected',
]);

export const streamQualityEnum = pgEnum('stream_quality', ['drift_expo', 'aqua_premium']);

// ==============================================================================
// 1. CORE USERS
// ==============================================================================

export const profiles = pgTable('profiles', {
  id: uuid('id').primaryKey().notNull(), // References auth.users(id)
  username: varchar('username', { length: 50 }).unique().notNull(),
  displayName: varchar('display_name', { length: 100 }),
  avatarUrl: text('avatar_url'),
  bio: text('bio'),
  isPremium: boolean('is_premium').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ==============================================================================
// 2. "GEM" ECONOMIC ENGINE
// ==============================================================================

export const wallets = pgTable('wallets', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => profiles.id, { onDelete: 'cascade' }),
  balance: integer('balance').default(0).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const gemTransactions = pgTable('gem_transactions', {
  id: uuid('id').primaryKey().defaultRandom(),
  senderId: uuid('sender_id').references(() => profiles.id),
  receiverId: uuid('receiver_id').references(() => profiles.id),
  amount: integer('amount').notNull(),
  type: transactionTypeEnum('type').notNull(),
  status: transactionStatusEnum('status').default('completed'),
  referenceId: text('reference_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const payoutRequests = pgTable('payout_requests', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  gemAmount: integer('gem_amount').notNull(),
  fiatAmount: decimal('fiat_amount', { precision: 10, scale: 2 }).notNull(),
  fiatCurrency: varchar('fiat_currency', { length: 3 }).default('KES'),
  mobileMoneyNumber: varchar('mobile_money_number', { length: 20 }).notNull(),
  provider: varchar('provider', { length: 50 }).notNull(),
  status: transactionStatusEnum('status').default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  processedAt: timestamp('processed_at', { withTimezone: true }),
});

// ==============================================================================
// 3. FLEET DECKS & CONTENT
// ==============================================================================

export const fleetPosts = pgTable('fleet_posts', {
  id: uuid('id').primaryKey().defaultRandom(),
  authorId: uuid('author_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  parentId: uuid('parent_id').references((): AnyPgColumn => fleetPosts.id, {
    onDelete: 'cascade',
  }),
  content: text('content'),
  mediaUrl: text('media_url'),
  mediaType: varchar('media_type', { length: 20 }),
  checksum: text('checksum'),
  resolution: integer('resolution'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const polls = pgTable('polls', {
  id: uuid('id').primaryKey().defaultRandom(),
  postId: uuid('post_id')
    .references(() => fleetPosts.id, { onDelete: 'cascade' })
    .notNull(),
  question: text('question').notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const pollOptions = pgTable('poll_options', {
  id: uuid('id').primaryKey().defaultRandom(),
  pollId: uuid('poll_id')
    .references(() => polls.id, { onDelete: 'cascade' })
    .notNull(),
  optionText: text('option_text').notNull(),
});

export const pollVotes = pgTable(
  'poll_votes',
  {
    optionId: uuid('option_id')
      .references(() => pollOptions.id, { onDelete: 'cascade' })
      .notNull(),
    userId: uuid('user_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.optionId, t.userId] }),
  })
);

// ==============================================================================
// 4. "1 MINUTE FAME" DISCOVERY ENGINE
// ==============================================================================

export const fameHeuristics = pgTable('fame_heuristics', {
  postId: uuid('post_id')
    .primaryKey()
    .references(() => fleetPosts.id, { onDelete: 'cascade' }),
  status: fameStatusEnum('status').default('evaluating'),
  checksumVerified: boolean('checksum_verified').default(false),
  resolutionMeetsFloor: boolean('resolution_meets_floor').default(false),
  sentimentScore: decimal('sentiment_score', { precision: 5, scale: 4 }),
  tagCorrelationScore: decimal('tag_correlation_score', {
    precision: 5,
    scale: 4,
  }),
  burstStartedAt: timestamp('burst_started_at', { withTimezone: true }),
  burstEndedAt: timestamp('burst_ended_at', { withTimezone: true }),
  viewsCount: integer('views_count').default(0),
  completionRate: decimal('completion_rate', {
    precision: 5,
    scale: 4,
  }).default('0'),
  latencyOfInterestMs: integer('latency_of_interest_ms'),
  followConversionRate: decimal('follow_conversion_rate', {
    precision: 5,
    scale: 4,
  }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

// ==============================================================================
// 5. STREAMING: DRIFT EXPO & AQUA PREMIUM
// ==============================================================================

export const liveStreams = pgTable('live_streams', {
  id: uuid('id').primaryKey().defaultRandom(),
  broadcasterId: uuid('broadcaster_id')
    .references(() => profiles.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 200 }).notNull(),
  quality: streamQualityEnum('quality').default('drift_expo'),
  isLive: boolean('is_live').default(false),
  playbackUrl: text('playback_url'),
  isGated: boolean('is_gated').default(false),
  entryFeeGems: integer('entry_fee_gems').default(0),
  startedAt: timestamp('started_at', { withTimezone: true }),
  endedAt: timestamp('ended_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const streamTickets = pgTable(
  'stream_tickets',
  {
    streamId: uuid('stream_id')
      .references(() => liveStreams.id, { onDelete: 'cascade' })
      .notNull(),
    viewerId: uuid('viewer_id')
      .references(() => profiles.id, { onDelete: 'cascade' })
      .notNull(),
    purchasedAt: timestamp('purchased_at', { withTimezone: true }).defaultNow(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.streamId, t.viewerId] }),
  })
);
