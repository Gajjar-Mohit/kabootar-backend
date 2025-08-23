import { Hono } from 'hono';
import { createResponse } from '../../utils/response';

const chatRouter = new Hono<{ Bindings: Env }>();

chatRouter.get('/create', async (c) => {
	return c.json(
		createResponse(
			{
				message: 'create user endpoint',
			},
			'User created successfully'
		)
	);
});

export { chatRouter };
