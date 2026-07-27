import { QueryClient, queryOptions, useQuery } from "@tanstack/react-query";
import { type User, UserSchema } from "@xapxap/validators";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: true,
    },
  },
});

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
