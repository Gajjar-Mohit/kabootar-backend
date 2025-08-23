import z from "zod";

export const CreateUserSchema = z.object({
	name: z.string().min(2, 'Name must be at least 2 characters'),
	email: z.email('Invalid email format').optional(),
	phone: z.string().min(10, 'Phone number must be at least 10 digits').optional(),
});