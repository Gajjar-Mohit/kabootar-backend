import z from "zod";

export const UserCreateRequest = z.object({
  name: z.string().min(1).max(100),
  email: z.email(),
  phone: z.string().optional(),
  profileUrl: z.string().optional(),
  bio: z.string().optional(),
  clerkId: z.string(),
});
