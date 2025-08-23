import { Context, Hono } from 'hono';
import { poweredBy } from 'hono/powered-by';
import { prettyJSON } from 'hono/pretty-json';
import { routes } from './routes';
import { Variables } from 'hono/types';
import { createResponse } from './utils/response';
type Bindings = {};

const app = new Hono<{ Variables: Variables, Bindings: Bindings }>();

app.use('*', poweredBy());
app.use('*', prettyJSON());
app.onError((err, c) => {
	console.error(`${err}`);
    return c.json(createResponse(err.message), 500);
});
app.route("/api/v1", routes);

export default app;
