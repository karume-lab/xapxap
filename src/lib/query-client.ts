import { queryOptions, useQuery } from "@tanstack/react-query";
import { type User, UserSchema } from "@/lib/schemas";

export const userOptions = (id: string) =>
  queryOptions({
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

export function useUser(id: string) {
  return useQuery(userOptions(id));
}
