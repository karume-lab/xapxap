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
      fame_heuristics: {
        Row: {
          burst_ended_at: string | null;
          burst_started_at: string | null;
          checksum_verified: boolean | null;
          completion_rate: number | null;
          created_at: string | null;
          follow_conversion_rate: number | null;
          latency_of_interest_ms: number | null;
          post_id: string;
          resolution_meets_floor: boolean | null;
          sentiment_score: number | null;
          status: Database["public"]["Enums"]["fame_status"] | null;
          tag_correlation_score: number | null;
          updated_at: string | null;
          views_count: number | null;
        };
        Insert: {
          burst_ended_at?: string | null;
          burst_started_at?: string | null;
          checksum_verified?: boolean | null;
          completion_rate?: number | null;
          created_at?: string | null;
          follow_conversion_rate?: number | null;
          latency_of_interest_ms?: number | null;
          post_id: string;
          resolution_meets_floor?: boolean | null;
          sentiment_score?: number | null;
          status?: Database["public"]["Enums"]["fame_status"] | null;
          tag_correlation_score?: number | null;
          updated_at?: string | null;
          views_count?: number | null;
        };
        Update: {
          burst_ended_at?: string | null;
          burst_started_at?: string | null;
          checksum_verified?: boolean | null;
          completion_rate?: number | null;
          created_at?: string | null;
          follow_conversion_rate?: number | null;
          latency_of_interest_ms?: number | null;
          post_id?: string;
          resolution_meets_floor?: boolean | null;
          sentiment_score?: number | null;
          status?: Database["public"]["Enums"]["fame_status"] | null;
          tag_correlation_score?: number | null;
          updated_at?: string | null;
          views_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "fame_heuristics_post_id_fleet_posts_id_fk";
            columns: ["post_id"];
            isOneToOne: true;
            referencedRelation: "fleet_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      fleet_posts: {
        Row: {
          author_id: string;
          checksum: string | null;
          content: string | null;
          created_at: string | null;
          id: string;
          media_type: string | null;
          media_url: string | null;
          parent_id: string | null;
          resolution: number | null;
          updated_at: string | null;
        };
        Insert: {
          author_id: string;
          checksum?: string | null;
          content?: string | null;
          created_at?: string | null;
          id?: string;
          media_type?: string | null;
          media_url?: string | null;
          parent_id?: string | null;
          resolution?: number | null;
          updated_at?: string | null;
        };
        Update: {
          author_id?: string;
          checksum?: string | null;
          content?: string | null;
          created_at?: string | null;
          id?: string;
          media_type?: string | null;
          media_url?: string | null;
          parent_id?: string | null;
          resolution?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "fleet_posts_author_id_profiles_id_fk";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "fleet_posts_parent_id_fleet_posts_id_fk";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "fleet_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      gem_transactions: {
        Row: {
          amount: number;
          created_at: string | null;
          id: string;
          receiver_id: string | null;
          reference_id: string | null;
          sender_id: string | null;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          type: Database["public"]["Enums"]["transaction_type"];
        };
        Insert: {
          amount: number;
          created_at?: string | null;
          id?: string;
          receiver_id?: string | null;
          reference_id?: string | null;
          sender_id?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          type: Database["public"]["Enums"]["transaction_type"];
        };
        Update: {
          amount?: number;
          created_at?: string | null;
          id?: string;
          receiver_id?: string | null;
          reference_id?: string | null;
          sender_id?: string | null;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          type?: Database["public"]["Enums"]["transaction_type"];
        };
        Relationships: [
          {
            foreignKeyName: "gem_transactions_receiver_id_profiles_id_fk";
            columns: ["receiver_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "gem_transactions_sender_id_profiles_id_fk";
            columns: ["sender_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      live_streams: {
        Row: {
          broadcaster_id: string;
          created_at: string | null;
          ended_at: string | null;
          entry_fee_gems: number | null;
          id: string;
          is_gated: boolean | null;
          is_live: boolean | null;
          playback_url: string | null;
          quality: Database["public"]["Enums"]["stream_quality"] | null;
          started_at: string | null;
          title: string;
        };
        Insert: {
          broadcaster_id: string;
          created_at?: string | null;
          ended_at?: string | null;
          entry_fee_gems?: number | null;
          id?: string;
          is_gated?: boolean | null;
          is_live?: boolean | null;
          playback_url?: string | null;
          quality?: Database["public"]["Enums"]["stream_quality"] | null;
          started_at?: string | null;
          title: string;
        };
        Update: {
          broadcaster_id?: string;
          created_at?: string | null;
          ended_at?: string | null;
          entry_fee_gems?: number | null;
          id?: string;
          is_gated?: boolean | null;
          is_live?: boolean | null;
          playback_url?: string | null;
          quality?: Database["public"]["Enums"]["stream_quality"] | null;
          started_at?: string | null;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "live_streams_broadcaster_id_profiles_id_fk";
            columns: ["broadcaster_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      payout_requests: {
        Row: {
          created_at: string | null;
          fiat_amount: number;
          fiat_currency: string | null;
          gem_amount: number;
          id: string;
          mobile_money_number: string;
          processed_at: string | null;
          provider: string;
          status: Database["public"]["Enums"]["transaction_status"] | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          fiat_amount: number;
          fiat_currency?: string | null;
          gem_amount: number;
          id?: string;
          mobile_money_number: string;
          processed_at?: string | null;
          provider: string;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          fiat_amount?: number;
          fiat_currency?: string | null;
          gem_amount?: number;
          id?: string;
          mobile_money_number?: string;
          processed_at?: string | null;
          provider?: string;
          status?: Database["public"]["Enums"]["transaction_status"] | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "payout_requests_user_id_profiles_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_options: {
        Row: {
          id: string;
          option_text: string;
          poll_id: string;
        };
        Insert: {
          id?: string;
          option_text: string;
          poll_id: string;
        };
        Update: {
          id?: string;
          option_text?: string;
          poll_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_polls_id_fk";
            columns: ["poll_id"];
            isOneToOne: false;
            referencedRelation: "polls";
            referencedColumns: ["id"];
          },
        ];
      };
      poll_votes: {
        Row: {
          created_at: string | null;
          option_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          option_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          option_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "poll_votes_option_id_poll_options_id_fk";
            columns: ["option_id"];
            isOneToOne: false;
            referencedRelation: "poll_options";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "poll_votes_user_id_profiles_id_fk";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      polls: {
        Row: {
          created_at: string | null;
          expires_at: string;
          id: string;
          post_id: string;
          question: string;
        };
        Insert: {
          created_at?: string | null;
          expires_at: string;
          id?: string;
          post_id: string;
          question: string;
        };
        Update: {
          created_at?: string | null;
          expires_at?: string;
          id?: string;
          post_id?: string;
          question?: string;
        };
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fleet_posts_id_fk";
            columns: ["post_id"];
            isOneToOne: false;
            referencedRelation: "fleet_posts";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          display_name: string | null;
          id: string;
          is_premium: boolean | null;
          role: string | null;
          updated_at: string | null;
          username: string;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          display_name?: string | null;
          id: string;
          is_premium?: boolean | null;
          role?: string | null;
          updated_at?: string | null;
          username: string;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          display_name?: string | null;
          id?: string;
          is_premium?: boolean | null;
          role?: string | null;
          updated_at?: string | null;
          username?: string;
        };
        Relationships: [];
      };
      stream_tickets: {
        Row: {
          purchased_at: string | null;
          stream_id: string;
          viewer_id: string;
        };
        Insert: {
          purchased_at?: string | null;
          stream_id: string;
          viewer_id: string;
        };
        Update: {
          purchased_at?: string | null;
          stream_id?: string;
          viewer_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "stream_tickets_stream_id_live_streams_id_fk";
            columns: ["stream_id"];
            isOneToOne: false;
            referencedRelation: "live_streams";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "stream_tickets_viewer_id_profiles_id_fk";
            columns: ["viewer_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      wallets: {
        Row: {
          balance: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          balance?: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          balance?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_profiles_id_fk";
            columns: ["user_id"];
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
