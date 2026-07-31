import { useLocalSearchParams } from "expo-router";
import { PostDetailScreen } from "@/features/fame/screens/PostDetailScreen";

export default function PostDetailRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <PostDetailScreen postId={id} />;
}
