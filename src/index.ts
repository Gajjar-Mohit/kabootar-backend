import express from "express";
import cors from "cors";
import router from "./routes";
import { errorHandler } from "./utils/error_handler";

const app = express();
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use(express.json());
app.use(cors());

app.use("/api/v1", router);
app.use(errorHandler);

app.listen(process.env.PORT, () => {
  console.log("Server is running on port 8000");
});
