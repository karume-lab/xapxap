import type { Profile } from "@/lib/types";

export const mockProfile: Profile = {
  id: "mock-user-id",
  username: "wave_rider",
  displayName: "Wave Rider",
  avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&h=200&fit=crop",
  dateOfBirth: null,
  isPremium: true, // Making premium enabled for nicer visuals
  bio: "Surfing the digital waves of XapXap. Mesh networking enthusiast.",
  role: "user",
  createdAt: new Date(),
  updatedAt: new Date(),
};

export function updateMockProfile(patch: Partial<Profile>): Profile {
  Object.assign(mockProfile, patch);
  mockProfile.updatedAt = new Date();
  return { ...mockProfile };
}
