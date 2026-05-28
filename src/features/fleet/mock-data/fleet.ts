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

export const fleetInteractions: Record<
  string,
  { hugs: string[]; echoes: string[]; casts: string[]; anchors: string[] }
> = {};

mockFleetPosts.forEach((post) => {
  fleetInteractions[post.id] = { hugs: [], echoes: [], casts: [], anchors: [] };
  if (post.myInteractions.hug) fleetInteractions[post.id].hugs.push("mock-user-id");
  if (post.myInteractions.echo) fleetInteractions[post.id].echoes.push("mock-user-id");
  if (post.myInteractions.cast) fleetInteractions[post.id].casts.push("mock-user-id");
  if (post.myInteractions.anchor) fleetInteractions[post.id].anchors.push("mock-user-id");
});

export function toggleFleetInteraction(
  userId: string | null,
  postId: string,
  type: "hug" | "echo" | "cast" | "anchor"
) {
  if (!userId) return null;
  const post = mockFleetPosts.find((p) => p.id === postId);
  if (!post) return null;

  let key: "hugs" | "echoes" | "casts" | "anchors" = "hugs";
  if (type === "echo") key = "echoes";
  if (type === "cast") key = "casts";
  if (type === "anchor") key = "anchors";

  const list = fleetInteractions[postId][key];
  const isOn = list.includes(userId);

  if (isOn) {
    fleetInteractions[postId][key] = list.filter((id) => id !== userId);
    post.counts[key] = Math.max(0, post.counts[key] - 1);
  } else {
    fleetInteractions[postId][key].push(userId);
    post.counts[key] += 1;
  }

  return {
    ...post,
    myInteractions: {
      hug: fleetInteractions[postId].hugs.includes(userId),
      echo: fleetInteractions[postId].echoes.includes(userId),
      cast: fleetInteractions[postId].casts.includes(userId),
      anchor: fleetInteractions[postId].anchors.includes(userId),
    },
  };
}

export const pollVotes: Record<string, Record<string, string>> = {}; // pollId -> { userId -> optionId }

Object.keys(mockPolls).forEach((pollId) => {
  pollVotes[pollId] = {};
  const userVotedId = mockPolls[pollId].userVotedId;
  if (userVotedId) {
    pollVotes[pollId]["mock-user-id"] = userVotedId;
  }
});

export function voteInPoll(userId: string | null, pollId: string, optionId: string) {
  if (!userId) return null;
  const poll = mockPolls[pollId];
  if (!poll) return null;

  const userVotedId = pollVotes[pollId][userId];

  if (userVotedId) {
    const prevOption = poll.options.find((o) => o.id === userVotedId);
    if (prevOption) {
      prevOption.votes = Math.max(0, prevOption.votes - 1);
      poll.totalVotes = Math.max(0, poll.totalVotes - 1);
    }
  }

  pollVotes[pollId][userId] = optionId;
  const option = poll.options.find((o) => o.id === optionId);
  if (option) {
    option.votes += 1;
    poll.totalVotes += 1;
  }

  return {
    ...poll,
    userVotedId: optionId,
  };
}

export function createFleetPost(
  content: string,
  authorProfile: Profile | null,
  mediaUrl?: string,
  mediaType?: "image" | "video" | "pdf"
) {
  const newPost: FleetPostWithAuthor = {
    id: `post-${Date.now()}`,
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
    authorId: authorProfile?.id || "mock-user-id",
    mediaUrl: mediaUrl || null,
    mediaType: mediaType || "text",
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
