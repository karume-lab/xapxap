export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      notifications: {
        Row: {
          actorId: string | null;
          content: string;
          createdAt: string | null;
          id: string;
          isRead: boolean | null;
          type: string;
          userId: string;
          amount: number | null;
        };
        Insert: {
          actorId?: string | null;
          content: string;
          createdAt?: string | null;
          id?: string;
          isRead?: boolean | null;
          type: string;
          userId: string;
          amount?: number | null;
        };
        Update: {
          actorId?: string | null;
          content?: string;
          createdAt?: string | null;
          id?: string;
          isRead?: boolean | null;
          type?: string;
          userId?: string;
          amount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_profiles_id_fk";
            columns: ["actorId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "notifications_user_id_profiles_id_fk";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      fame_heuristics: {
        Row: {
          burstEndedAt: string | null;
          burstStartedAt: string | null;
          checksumVerified: boolean | null;
          completionRate: number | null;
          createdAt: string | null;
          followConversionRate: number | null;
          latencyOfInterestMs: number | null;
          postId: string;
          resolutionMeetsFloor: boolean | null;
          sentimentScore: number | null;
          status: Database["public"]["Enums"]["fame_status"] | null;
          tagCorrelationScore: number | null;
          updatedAt: string | null;
          viewsCount: number | null;
        };
        Insert: {
          burstEndedAt?: string | null;
          burstStartedAt?: string | null;
          checksumVerified?: boolean | null;
          completionRate?: number | null;
          createdAt?: string | null;
          followConversionRate?: number | null;
          latencyOfInterestMs?: number | null;
          postId: string;
          resolutionMeetsFloor?: boolean | null;
          sentimentScore?: number | null;
          status?: Database["public"]["Enums"]["fame_status"] | null;
          tagCorrelationScore?: number | null;
          updatedAt?: string | null;
          viewsCount?: number | null;
        };
        Update: {
          burstEndedAt?: string | null;
          burstStartedAt?: string | null;
          checksumVerified?: boolean | null;
          completionRate?: number | null;
          createdAt?: string | null;
          followConversionRate?: number | null;
          latencyOfInterestMs?: number | null;
          postId?: string;
          resolutionMeetsFloor?: boolean | null;
          sentimentScore?: number | null;
          status?: Database["public"]["Enums"]["fame_status"] | null;
          tagCorrelationScore?: number | null;
          updatedAt?: string | null;
          viewsCount?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fame_heuristics_post_id_fleet_posts_id_fk";
            columns: ["postId"];
            isOneToOne: true;
            referencedRelation: "fleet_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      fleet_posts: {
        Row: {
          authorId: string;
          checksum: string | null;
          content: string | null;
          createdAt: string | null;
          deckId: string | null;
          id: string;
          mediaType: string | null;
          mediaUrl: string | null;
          parentId: string | null;
          resolution: number | null;
          updatedAt: string | null;
        };
        Insert: {
          authorId: string;
          checksum?: string | null;
          content?: string | null;
          createdAt?: string | null;
          deckId?: string | null;
          id?: string;
          mediaType?: string | null;
          mediaUrl?: string | null;
          parentId?: string | null;
          resolution?: number | null;
          updatedAt?: string | null;
        };
        Update: {
          authorId?: string;
          checksum?: string | null;
          content?: string | null;
          createdAt?: string | null;
          deckId?: string | null;
          id?: string;
          mediaType?: string | null;
          mediaUrl?: string | null;
          parentId?: string | null;
          resolution?: number | null;
          updatedAt?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fleet_posts_author_id_profiles_id_fk";
            columns: ["authorId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fleet_posts_deck_id_fleet_decks_id_fk";
            columns: ["deckId"];
            isOneToOne: false;
            referencedRelation: "fleet_decks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fleet_posts_parent_id_fleet_posts_id_fk";
            columns: ["parentId"];
            isOneToOne: false;
            referencedRelation: "fleet_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      gem_transactions: {
        Row: {
          amount: number;
          createdAt: string | null;
          id: string;
          receiverId: string | null;
          referenceId: string | null;
          senderId: string | null;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          type: Database["public"]["Enums"]["transaction_type"];
        };
        Insert: {
          amount: number;
          createdAt?: string | null;
          id?: string;
          receiverId?: string | null;
          referenceId?: string | null;
          senderId?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          type: Database["public"]["Enums"]["transaction_type"];
        };
        Update: {
          amount?: number;
          createdAt?: string | null;
          id?: string;
          receiverId?: string | null;
          referenceId?: string | null;
          senderId?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          type?: Database["public"]["Enums"]["transaction_type"];
        };
        Relationships: [
          {
            foreignKeyName: "gem_transactions_receiver_id_profiles_id_fk";
            columns: ["receiverId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gem_transactions_sender_id_profiles_id_fk";
            columns: ["senderId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      live_streams: {
        Row: {
          broadcasterId: string;
          createdAt: string | null;
          endedAt: string | null;
          entryFeeGems: number | null;
          id: string;
          isGated: boolean | null;
          isLive: boolean | null;
          playbackUrl: string | null;
          quality: Database["public"]["Enums"]["stream_quality"] | null;
          startedAt: string | null;
          title: string;
        };
        Insert: {
          broadcasterId: string;
          createdAt?: string | null;
          endedAt?: string | null;
          entryFeeGems?: number | null;
          id?: string;
          isGated?: boolean | null;
          isLive?: boolean | null;
          playbackUrl?: string | null;
          quality?: Database["public"]["Enums"]["stream_quality"] | null;
          startedAt?: string | null;
          title: string;
        };
        Update: {
          broadcasterId?: string;
          createdAt?: string | null;
          endedAt?: string | null;
          entryFeeGems?: number | null;
          id?: string;
          isGated?: boolean | null;
          isLive?: boolean | null;
          playbackUrl?: string | null;
          quality?: Database["public"]["Enums"]["stream_quality"] | null;
          startedAt?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_streams_broadcaster_id_profiles_id_fk";
            columns: ["broadcasterId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payout_requests: {
        Row: {
          createdAt: string | null;
          fiatAmount: number;
          fiatCurrency: string | null;
          gemAmount: number;
          id: string;
          mobileMoneyNumber: string;
          processedAt: string | null;
          provider: string;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          userId: string;
        };
        Insert: {
          createdAt?: string | null;
          fiatAmount: number;
          fiatCurrency?: string | null;
          gemAmount: number;
          id?: string;
          mobileMoneyNumber: string;
          processedAt?: string | null;
          provider: string;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          userId: string;
        };
        Update: {
          createdAt?: string | null;
          fiatAmount?: number;
          fiatCurrency?: string | null;
          gemAmount?: number;
          id?: string;
          mobileMoneyNumber?: string;
          processedAt?: string | null;
          provider?: string;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payout_requests_user_id_profiles_id_fk";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_options: {
        Row: {
          id: string;
          optionText: string;
          pollId: string;
        };
        Insert: {
          id?: string;
          optionText: string;
          pollId: string;
        };
        Update: {
          id?: string;
          optionText?: string;
          pollId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_polls_id_fk";
            columns: ["pollId"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_votes: {
        Row: {
          createdAt: string | null;
          optionId: string;
          userId: string;
        };
        Insert: {
          createdAt?: string | null;
          optionId: string;
          userId: string;
        };
        Update: {
          createdAt?: string | null;
          optionId?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_poll_options_id_fk";
            columns: ["optionId"];
            isOneToOne: false;
            referencedRelation: "poll_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poll_votes_user_id_profiles_id_fk";
            columns: ["userId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      polls: {
        Row: {
          createdAt: string | null;
          expiresAt: string;
          id: string;
          postId: string;
          question: string;
        };
        Insert: {
          createdAt?: string | null;
          expiresAt: string;
          id?: string;
          postId: string;
          question: string;
        };
        Update: {
          createdAt?: string | null;
          expiresAt?: string;
          id?: string;
          postId?: string;
          question?: string;
        };
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fleet_posts_id_fk";
            columns: ["postId"];
            isOneToOne: false;
            referencedRelation: "fleet_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatarUrl: string | null;
          bio: string | null;
          createdAt: string | null;
          displayName: string | null;
          id: string;
          isPremium: boolean | null;
          role: string | null;
          updatedAt: string | null;
          username: string;
        };
        Insert: {
          avatarUrl?: string | null;
          bio?: string | null;
          createdAt?: string | null;
          displayName?: string | null;
          id: string;
          isPremium?: boolean | null;
          role?: string | null;
          updatedAt?: string | null;
          username: string;
        };
        Update: {
          avatarUrl?: string | null;
          bio?: string | null;
          createdAt?: string | null;
          displayName?: string | null;
          id?: string;
          isPremium?: boolean | null;
          role?: string | null;
          updatedAt?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      stream_tickets: {
        Row: {
          purchasedAt: string | null;
          streamId: string;
          viewerId: string;
        };
        Insert: {
          purchasedAt?: string | null;
          streamId: string;
          viewerId: string;
        };
        Update: {
          purchasedAt?: string | null;
          streamId?: string;
          viewerId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stream_tickets_stream_id_live_streams_id_fk";
            columns: ["streamId"];
            isOneToOne: false;
            referencedRelation: "live_streams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stream_tickets_viewer_id_profiles_id_fk";
            columns: ["viewerId"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          balance: number;
          updatedAt: string | null;
          userId: string;
        };
        Insert: {
          balance?: number;
          updatedAt?: string | null;
          userId: string;
        };
        Update: {
          balance?: number;
          updatedAt?: string | null;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_profiles_id_fk";
            columns: ["userId"];
            isOneToOne: true;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      fame_status: "evaluating" | "fame_burst" | "trend_deck" | "rejected";
      stream_quality: "drift_expo" | "aqua_premium";
      transaction_status: "pending" | "completed" | "failed" | "fraud_flagged";
      transaction_type: "tip" | "deposit" | "withdrawal" | "stream_entry";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      fame_status: ["evaluating", "fame_burst", "trend_deck", "rejected"],
      stream_quality: ["drift_expo", "aqua_premium"],
      transaction_status: ["pending", "completed", "failed", "fraud_flagged"],
      transaction_type: ["tip", "deposit", "withdrawal", "stream_entry"],
    },
  },
} as const;
