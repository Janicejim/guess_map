import express from "express";
import userRoutes from "./router/userRoutes";
import dotenv from "dotenv";
import { isAdmin } from "./utils/guard";
import grant from "grant";
import { env } from "./utils/env";
import { logger } from "./utils/logger";
import expressSession from "express-session";
import gameRoutes from "./router/gameRoutes";
import http from "http";
import { Server as SocketIO } from "socket.io";
import { chatRoomIO } from "./router/SocketRoute";
import adminRoutes from "./router/adminRoutes";

dotenv.config();

const app = express();

//--教server read json--
app.use(express.json());

//--------session config------------------------------
const sessionMiddleware = expressSession({
  secret: "Tecky Academy teaches typescript",
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

declare module "express-session" {
  interface SessionData {
    user?: any;
    grant?: any;
  }
}

app.use(sessionMiddleware);
// -----  socketIO & session config  ----- ---------------------------------------//
const server = new http.Server(app);
const io = new SocketIO(server);
io.use((socket, next) => {
  let req = socket.request as express.Request;
  let res = req.res as express.Response;
  sessionMiddleware(req, res || {}, next as express.NextFunction);
});
chatRoomIO(io);

//------------------- google login-------------------------------
const grantExpress = grant.express({
  defaults: {
    origin: "http://localhost:8000",
    transport: "session",
    state: true,
  },
  google: {
    key: env.GOOGLE_CLIENT_ID,
    secret: env.GOOGLE_CLIENT_SECRET,
    scope: ["profile", "email"],
    callback: "/login/google",
  },
});

//All routers here
app.use(grantExpress as express.RequestHandler);
app.use(userRoutes);
app.use(gameRoutes);
app.use(adminRoutes);
app.use(express.static("public"));
app.use(express.static("site_images"));
app.use(express.static("uploads"));
app.use(express.static("profileUploads"));
app.use(isAdmin, express.static("protected"));
app.use((req, res) => {
  res.redirect("/404.html");
});

const PORT = env.PORT;
server.listen(PORT, () => {
  logger.info(`Server is ready =>: http://localhost:${PORT}/`);
});
