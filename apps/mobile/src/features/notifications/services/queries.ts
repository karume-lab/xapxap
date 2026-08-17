import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";

export type NotificationType =
  | "hug"
  | "echo"
  | "cast"
  | "comment"
  | "tip"
  | "stream_join"
  | "fleet_join"
  | "poll_vote"
  | "system";

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (userId: string | null) => [...notificationKeys.all, "list", userId] as const,
  unreadCount: (userId: string | null) => [...notificationKeys.all, "unread", userId] as const,
};

export type NotificationItem = {
  id: string;
  type: NotificationType;
  actorId: string | null;
  user?: {
    username: string;
    avatarUrl: string | null;
    isPremium: boolean;
  };
  content: string;
  time: string;
  unread: boolean;
  amount?: number | null;
};

// biome-ignore lint/suspicious/noExplicitAny: Supabase join returns nested generic shape
type NotificationRow = any;

function mapRow(n: NotificationRow): NotificationItem {
  return {
    id: n.id,
    type: n.type,
    actorId: n.actor_id,
    content: n.content,
    amount: n.amount,
    unread: !n.is_read,
    time: n.created_at ?? "",
    user: n.actor
      ? {
          username: n.actor.username,
          avatarUrl: n.actor.avatar_url,
          isPremium: n.actor.is_premium,
        }
      : undefined,
  };
}

export function useNotifications(userId: string | null) {
  return useQuery({
    queryKey: notificationKeys.list(userId),
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from("notifications")
        .select(
          `
          id,
          type,
          actor_id,
          content,
          amount,
          is_read,
          created_at,
          actor:profiles!actor_id(username, avatar_url, is_premium)
        `
        )
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map(mapRow) as NotificationItem[];
    },
    enabled: !!userId,
  });
}

export function useUnreadNotificationCount(userId: string | null) {
  return useQuery({
    queryKey: notificationKeys.unreadCount(userId),
    queryFn: async () => {
      if (!userId) return 0;

      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
      return count ?? 0;
    },
    enabled: !!userId,
  });
}

export function useMarkNotificationsRead(userId: string | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!userId) return;

      const { error } = await supabase
        .from("notifications")
        .update({ is_read: true })
        .eq("user_id", userId)
        .eq("is_read", false);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
  });
}
