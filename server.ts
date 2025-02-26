import express from "express";
import userRoutes from "./router/userRoutes";
import dotenv from "dotenv";

import grant from "grant";
import { env } from "./utils/env";
import { logger } from "./utils/logger";
import expressSession from "express-session";

import http from "http";
import { Server as SocketIO } from "socket.io";
import socketIO from "socket.io";
import adminRoutes from "./router/adminRoutes";
import awardRoutes from "./router/awardRoutes";

import GameController from "./controllers/gameController";
import GameService from "./services/gameService";
import { knex } from "./utils/db";
dotenv.config();

const app = express();

//--教server read json--
app.use(express.json());

//--------session config------------------------------
const sessionMiddleware = expressSession({
  secret: env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: { secure: false },
});

declare module "express-session" {
  interface SessionData {
    user?: UserSession;
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

io.on("connection", (socket: socketIO.Socket) => {
  socket.on("join-room", (id: string) => {
    socket.join(`Room-${id}`);
  });
});

//------------------- google login-------------------------------
const grantExpress = grant.express({
  defaults: {
    origin: env.FRONTEND_URL,
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
export const gameService = new GameService(knex);
export const gameController = new GameController(gameService, io);
import gameRoutes from "./router/gameRoutes";
import checkInRoutes from "./router/checkInRoutes";
import { isLoggedIn } from "./utils/guard";
import { UserSession } from "./utils/model";

app.use(gameRoutes);
app.use(adminRoutes);
app.use(awardRoutes);
app.use(checkInRoutes);
app.use(express.static("public"));
app.use(express.static("public/html"));
app.use(express.static("uploads"));
app.use(express.static("image"));
app.use(isLoggedIn, express.static("protected"));
app.use(isLoggedIn, express.static("protected/html"));
app.use((req, res) => {
  res.redirect("/404.html");
});

const PORT = env.PORT;
server.listen(PORT, () => {
  logger.info(`Server is ready =>: http://localhost:${PORT}/`);
});
