const socketIO = require("socket.io");
const { authenticateSocket } = require("../middleware/authenticate");
const User = require("../db/user");

module.exports = function (server) {
  const io = socketIO(server);

  // io.on("connection", (socket) => {
  //   console.log("new user");
  //   socket.send("Hello!");
  // });

  io.of("/stands")
    .use(authenticateSocket)
    .on("connection", async (socket) => {
      console.log("new stand connection");
    });

  io.of("/user-location")
    .use(authenticateSocket)
    .on("connection", async (socket) => {
      let token = socket.handshake.query.token;

      const user = await User.findByToken(token);

      socket.on("update", (location) => {
        console.log("update location");
        user.location = location;
        user.save();

        socket.broadcast.emit("update-user", { location, user });
      });
    });

  return io;
};
