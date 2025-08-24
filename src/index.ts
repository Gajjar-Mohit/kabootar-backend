import express from "express";
import { errorHandler } from "./utils/error-handler";
import router from "./routes";
import { connect } from "./db/db";
const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(express.json());

app.use("/api/v1", router);

app.use(errorHandler);

app.listen(process.env.PORT, async () => {
  await connect();
  console.log("Server is running on port " + process.env.PORT);
});
