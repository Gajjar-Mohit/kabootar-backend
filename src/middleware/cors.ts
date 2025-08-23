import { cors } from 'hono/cors';

export const corsMiddleware = cors({
	origin: (origin, c) => {
		const env = c.env?.ENVIRONMENT;

		if (env === 'development') {
			return origin || '*';
		}

		// Production origins
		const allowedOrigins = ["*"];

		return allowedOrigins.includes(origin || '') ? origin : null;
	},
	allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
	allowHeaders: ['Content-Type', 'Authorization'],
	exposeHeaders: ['Content-Length', 'X-Request-ID'],
	maxAge: 600,
	credentials: true,
});
