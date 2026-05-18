import type { FleetPostWithAuthor, PollWithDetails, Profile } from "@/lib/types";

export const mockFleetPosts: FleetPostWithAuthor[] = [
  {
    id: "post-1",
    content: "What should be the next major feature in XapXap? 🚀 #XapXap #Community",
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: "u1",
    mediaUrl: null,
    mediaType: "text",
    parentId: null,
    pollId: "poll-1",
    checksum: null,
    resolution: null,
    author: { id: "u1", username: "founder", avatarUrl: null, isPremium: true },
    counts: { hugs: 120, echoes: 45, casts: 12, anchors: 5 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  },
  {
    id: "post-2",
    content: "Just arrived at the tech hub. The 3G signal is surprisingly stable here! 📶",
    createdAt: new Date(Date.now() - 3600000),
    updatedAt: new Date(Date.now() - 3600000),
    authorId: "u2",
    mediaUrl: null,
    mediaType: "text",
    parentId: null,
    pollId: null,
    checksum: null,
    resolution: null,
    author: { id: "u2", username: "dev_explorer", avatarUrl: null, isPremium: false },
    counts: { hugs: 85, echoes: 12, casts: 2, anchors: 1 },
    myInteractions: { hug: true, echo: false, cast: false, anchor: false },
  },
];

export const mockPolls: Record<string, PollWithDetails> = {
  "poll-1": {
    id: "poll-1",
    postId: "post-1",
    question: "Next major feature?",
    expiresAt: new Date(Date.now() + 86400000),
    createdAt: new Date(),
    options: [
      { id: "opt-1", pollId: "poll-1", optionText: "Video Stories", votes: 45 },
      { id: "opt-2", pollId: "poll-1", optionText: "Marketplace", votes: 30 },
      { id: "opt-3", pollId: "poll-1", optionText: "Direct Messaging", votes: 25 },
    ],
    totalVotes: 100,
    userVotedId: null,
  },
};

export function toggleFleetInteraction(postId: string, type: "hug" | "echo" | "cast" | "anchor") {
  const post = mockFleetPosts.find((p) => p.id === postId);
  if (!post) return null;
  const isOn = post.myInteractions[type];
  post.myInteractions[type] = !isOn;
  const key =
    type === "hug" ? "hugs" : type === "echo" ? "echoes" : type === "cast" ? "casts" : "anchors";
  post.counts[key] += isOn ? -1 : 1;
  return post;
}

export function voteInPoll(pollId: string, optionId: string) {
  const poll = mockPolls[pollId];
  if (!poll) return null;
  if (poll.userVotedId) {
    const prevOption = poll.options.find((o) => o.id === poll.userVotedId);
    if (prevOption) {
      prevOption.votes = Math.max(0, prevOption.votes - 1);
      poll.totalVotes = Math.max(0, poll.totalVotes - 1);
    }
  }
  poll.userVotedId = optionId;
  const option = poll.options.find((o) => o.id === optionId);
  if (option) {
    option.votes += 1;
    poll.totalVotes += 1;
  }
  return poll;
}

export function createFleetPost(content: string, authorProfile: Profile | null) {
  const newPost: FleetPostWithAuthor = {
    id: `post-${Date.now()}`,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: authorProfile?.id || "mock-user-id",
    mediaUrl: null,
    mediaType: "text",
    parentId: null,
    pollId: null,
    checksum: null,
    resolution: null,
    author: {
      id: authorProfile?.id || "mock-user-id",
      username: authorProfile?.username || "wave_rider",
      avatarUrl: authorProfile?.avatarUrl || null,
      isPremium: authorProfile?.isPremium || false,
    },
    counts: { hugs: 0, echoes: 0, casts: 0, anchors: 0 },
    myInteractions: { hug: false, echo: false, cast: false, anchor: false },
  };
  mockFleetPosts.unshift(newPost);
  return newPost;
}
