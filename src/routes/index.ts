import { Hono } from "hono";
import { Variables } from "hono/types";
import { userRouter } from "./v1/user.route";
import { chatRouter } from "./v1/chat.route";

const routes = new Hono<{  }>();

routes.route('/user', userRouter);
routes.route('/chat', chatRouter);

export { routes };
