import { Hono } from 'hono';
import { Bindings, Variables } from 'hono/types';
import { UserService } from '../../service/user.service';
import { CreateUserSchema } from '../../schema/user';
import { createResponse } from '../../utils/response';
import { Env } from '../../utils/env';

const userRouter = new Hono<{ Bindings: Env }>();

userRouter.post('/register', async (c) => {
	console.log(await c.req.json());
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
		},
		c
	);
	return c.json(createResponse(user, 'User created successfully'));
});

export { userRouter };
