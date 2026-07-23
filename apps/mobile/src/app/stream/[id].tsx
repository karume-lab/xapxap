import { useLocalSearchParams } from "expo-router";
import { LiveStreamScreen } from "@/features/streaming/screens/LiveStreamScreen";

export default function StreamRoute() {
  const { id } = useLocalSearchParams();
  return <LiveStreamScreen streamId={id as string} />;
}
