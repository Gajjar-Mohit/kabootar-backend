import express from "express";
import { errorHandler } from "./utils/error-handler";
import router from "./routes";
const app = express();

app.use((req, res, next) => {
  console.log(req.method, req.url);
  next();
});

app.use(express.json());

app.use("/api/v1", router);

app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port " + process.env.PORT);
});
