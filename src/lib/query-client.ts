import { useQuery } from "@tanstack/react-query";
import { type User, UserSchema } from "@/lib/schemas";

export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: async (): Promise<User> => {
      // Example fetch
      const response = await fetch(`https://jsonplaceholder.typicode.com/users/${id}`);
      const data = await response.json();

      // Validate with Zod
      return UserSchema.parse({
        id: String(data.id),
        name: data.name,
        email: data.email,
      });
    },
  });
}
