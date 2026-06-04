import routes from "@routes";
import express, { Express } from "express";

const app: Express = express();

app.use(express.json());
app.use("/", routes);

export default app;
