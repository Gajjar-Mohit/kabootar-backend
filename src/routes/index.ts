import { Hono } from "hono";
import { Variables } from "hono/types";
import { userRouter } from "./v1/user.route";

const routes = new Hono<{  }>();

routes.route('/user', userRouter);

export { routes };
