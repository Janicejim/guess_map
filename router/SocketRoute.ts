import express from "express";
import socketIO from "socket.io";
// import { client } from "../db";
// import { logger } from "../logger";

export let io: socketIO.Server;

type players = player[];

type player = {
  socketID: string;
  userName: string;
  roomID: string;
};

let players: player[] = [];

// ---- socket io chatroom test ---- //

export function chatRoomIO(value: socketIO.Server) {
  io = value;
  // io.on("userName",name)
  io.on("connection", (socket: any) => {
    if ((socket.request as express.Request).session["user"]) {
      let user = (socket.request as express.Request).session["user"];

      socket.on("join-room", (id: any) => {
        // console.log('id', id);
        socket.join(`Room-${id}`);

        let player = {
          socketID: socket!["id"],
          userName: user.name,
          roomID: id,
        };
        players.push(player);

        io.to(`Room-${id}`).emit(
          "chat message",
          user.profile_image,
          user.name + "  加入遊戲"
        );

        socket.on("chat message", (msg: any) => {
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + ": " + msg
          );
        });
        socket.on("chat win message", () => {
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + "  贏左!!!"
          );
        });
        socket.on("chat lose message", () => {
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + "  輸左!!!"
          );
        });
        socket.on("chat miss message", () => {
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + "  估錯左!"
          );
        });

        socket.on("disconnect", function () {
          players = players.filter((p) => p !== player);
          console.table(players);
        });
      });
    }
  });
}
