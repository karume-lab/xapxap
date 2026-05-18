export interface TrendingWaveMock {
  id: string;
  author: string;
  content: string;
  buzz: number;
}

export const mockTrendingWaves: TrendingWaveMock[] = [
  {
    id: "1",
    author: "anax",
    content: "Hello guys, this is my first post on XapXap 🌊🚀",
    buzz: 4,
  },
  {
    id: "2",
    author: "founder",
    content: "A great recommendation for building mesh node connections off-grid!",
    buzz: 3,
  },
  {
    id: "3",
    author: "drift_queen",
    content: "Hello from the other side of the ocean! 🐋💨",
    buzz: 3,
  },
];

export const mockPopularTags = [
  { id: "1", tag: "#XapXap", count: 120 },
  { id: "2", tag: "#MeshNetwork", count: 85 },
  { id: "3", tag: "#SolarPower", count: 42 },
];

export function incrementBuzz(id: string) {
  const wave = mockTrendingWaves.find((w) => w.id === id);
  if (wave) {
    wave.buzz += 1;
  }
  return wave;
}
