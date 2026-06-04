import "./pre-start";
import { createServer } from "http";
import app from "./src/app";
import { initSocket } from "./src/socket";

const server = createServer(app);

initSocket(server);

server.listen(process.env.PORT, () => {
  // eslint-disable-next-line no-console
  console.log("APP started listening on PORT", process.env.PORT);
});
