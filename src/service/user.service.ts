
import { Context } from 'hono';
import { getPrisma } from '../db';
import { CreateUser } from '../types/user';
import { AppError } from '../utils/errors';
import { Env } from '../utils/env';
import { env } from 'hono/adapter';

export class UserService {
	async createUser(user: CreateUser, c: Context<{ Bindings: Env }>) {
		try {
			const prisma = getPrisma(c.env.DATABASE_URL!);
			if (!user.name) {
				throw new AppError('Name is required', 400, 'INVALID_INPUT');
			}
			if (!user.email || !user.phone) {
				throw new AppError('Either email or phone is required', 400, 'INVALID_INPUT');
			}
			if (!user.email.includes('@')) {
				throw new AppError('Email is invalid', 400, 'INVALID_INPUT');
			}
			const existingUser = await prisma.user.findFirst({
				where: {
					email: user.email,
				},
			});
			if (existingUser) {
				throw new AppError('User with this email already exists', 409, 'USER_EXISTS');
			}
			const newUser = await prisma.user.create({
				data: {
					name: user.name,
					email: user.email,
					phone: user.phone,
				},
			});
			return newUser;
		} catch (error) {
			throw new AppError('Failed to create user: ' + error, 500, 'DATABASE_ERROR');
		}
	}
	async getUserById(id: string) {
		try {
			const prisma = getPrisma(process.env.DATABASE_URL!);
			const user = await prisma.user.findUnique({
				where: {
					id,
				},
			});
			return user;
		} catch (error) {
			throw new AppError('Failed to fetch user', 500, 'DATABASE_ERROR');
		}
	}
}
