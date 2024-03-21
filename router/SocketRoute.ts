import express from "express";
import socketIO from "socket.io";

type players = player[];

type player = {
  socketID: string;
  userName: string;
  roomID: string;
};

let players: player[] = [];

// ---- socket io chatroom test ---- //

export function chatRoomIO(io: socketIO.Server) {
  io.on("connection", (socket: socketIO.Socket) => {
    if ((socket.request as express.Request).session["user"]) {
      let user = (socket.request as express.Request).session["user"];

      socket.on("join-room", (id: string) => {
        socket.join(`Room-${id}`);
        if (!user) {
          return;
        }
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

        socket.on("chat message", (msg: string) => {
          if (!user) {
            return;
          }
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + ": " + msg
          );
        });
        socket.on("chat win message", () => {
          if (!user) {
            return;
          }
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + "  贏左!!!"
          );
        });
        socket.on("chat lose message", () => {
          if (!user) {
            return;
          }
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + "  輸左!!!"
          );
        });
        socket.on("chat miss message", () => {
          if (!user) {
            return;
          }
          io.to(`Room-${id}`).emit(
            "chat message",
            user.profile_image,
            user.name + "  估錯左!"
          );
        });

        socket.on("disconnect", function () {
          players = players.filter((p) => p !== player);
        });
      });
    }
  });
}
