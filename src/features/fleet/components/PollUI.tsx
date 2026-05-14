import { Pressable, View } from "react-native";
import { Glass } from "@/components/ui/glass";
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
          <Pressable
            key={option.id}
            onPress={() => !poll.userVotedId && vote(option.id)}
            disabled={!!poll.userVotedId}>
            <Glass
              intensity={20}
              radius={12}
              className={`overflow-hidden border ${isVoted ? "border-[#bef445]" : "border-white/10"}`}>
              {/* Progress Bar Background */}
              <View
                className="absolute top-0 left-0 bottom-0 bg-[#bef445]/10"
                style={{ width: `${percentage}%` }}
              />

              <View className="flex-row items-center justify-between p-3">
                <Text className={`font-medium ${isVoted ? "text-[#bef445]" : "text-white"}`}>
                  {option.optionText}
                </Text>
                {poll.userVotedId && (
                  <Text className="text-xs font-bold text-white/60">{percentage}%</Text>
                )}
              </View>
            </Glass>
          </Pressable>
        );
      })}

      <Text className="text-[10px] text-muted-foreground text-center mt-1">
        {poll.totalVotes} votes • Relaying via 3G Node
      </Text>
    </View>
  );
}
