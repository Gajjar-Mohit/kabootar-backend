import { Hono } from 'hono';
import { Bindings, Variables } from 'hono/types';
import { UserService } from '../../service/user.service';
import { CreateUserSchema } from '../../schema/user';
import { createResponse } from '../../utils/response';
import { Env } from '../../utils/env';
import { AppError } from '../../utils/errors';

const userRouter = new Hono<{ Bindings: Env }>();

userRouter.post('/register', async (c) => {
	const body = await c.req.json();
	const request = CreateUserSchema.safeParse(body);
	if (!request.success) {
		return c.json(request.error, 400);
	}
	const userService = new UserService();
	const user = await userService.createUser(
		{
			name: request.data.name,
			email: request.data.email,
			phone: request.data.phone,
			publicKey: request.data.publicKey,
		},
		c
	);
	return c.json(createResponse(user, 'User created successfully'));
});

userRouter.delete('/delete/:id', async (c) => {
	const id = c.req.param('id');
	const userService = new UserService();
	if (!id) {
		throw new AppError('User id is required', 400, 'INVALID_INPUT');
	}
	const deleted = await userService.deleteUser(id, c);
	if (!deleted) {
		throw new AppError('User not found', 404, 'USER_NOT_FOUND');
	}

	return c.json(createResponse(null, 'User deleted successfully'));
});

export { userRouter };
