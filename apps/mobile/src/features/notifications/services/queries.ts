import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string | null) => [...notificationKeys.all, "list", userId] as const,
};

export type NotificationItem = {
  id: string;
  type: "like" | "comment" | "gift" | "system";
  user?: {
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  content: string;
  time: string;
  unread: boolean;
  amount?: number;
};

export function useNotifications(userId: string | null) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(`
          id,
          type,
          content,
          amount,
          is_read,
          created_at,
          actor:profiles!actor_id(username, avatar_url, is_premium)
        `)
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // biome-ignore lint/suspicious/noExplicitAny: Supabase query returns generic data
      return (data || []).map((n: any) => ({
        id: n.id,
        type: n.type,
        content: n.content,
        amount: n.amount,
        unread: !n.is_read,
        time: new Date(n.created_at).toLocaleDateString(),
        user: n.actor
          ? {
              username: n.actor.username,
              avatarUrl: n.actor.avatar_url,
              isPremium: n.actor.is_premium,
            }
          : undefined,
      })) as NotificationItem[];
    },
    enabled: !!userId,
  });
}
