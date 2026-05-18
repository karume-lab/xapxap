import { View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { usePoll } from "@/features/fleet/api/queries";

interface PollUIProps {
  pollId: string;
}

export function PollUI({ pollId }: PollUIProps) {
  const { data: poll, vote, isLoading } = usePoll(pollId);

  if (isLoading || !poll) return null;

  return (
    <View className="mt-4 gap-2">
      {poll.options.map((option) => {
        const percentage =
          poll.totalVotes > 0 ? Math.round((option.votes / poll.totalVotes) * 100) : 0;
        const isVoted = poll.userVotedId === option.id;

        return (
          <Button
            key={option.id}
            variant="ghost"
            onPress={() => !poll.userVotedId && vote(option.id)}
            disabled={!!poll.userVotedId}
            className="p-0 h-auto w-auto bg-transparent active:bg-transparent min-w-0 min-h-0">
            <Glass
              intensity={20}
              radius={12}
              className={`overflow-hidden border w-full ${isVoted ? "border-primary" : "border-border"}`}>
              {/* Progress Bar Background */}
              <View
                className="absolute top-0 left-0 bottom-0 bg-primary/10"
                style={{ width: `${percentage}%` }}
              />

              <View className="flex-row items-center justify-between p-3">
                <Text className={`font-medium ${isVoted ? "text-primary" : "text-foreground"}`}>
                  {option.optionText}
                </Text>
                {poll.userVotedId && (
                  <Text className="text-xs font-bold text-muted-foreground">{percentage}%</Text>
                )}
              </View>
            </Glass>
          </Button>
        );
      })}

      <Text className="text-[10px] text-muted-foreground text-center mt-1">
        {poll.totalVotes} votes • Relaying via 3G Node
      </Text>
    </View>
  );
}
