import { useLocalSearchParams } from "expo-router";
import { FleetDeckScreen } from "@/features/fleet/screens/FleetDeckScreen";

export default function FleetDeckRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <FleetDeckScreen deckId={id} />;
}
