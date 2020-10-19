const socketIO = require("socket.io");
const { authenticateSocket } = require("../middleware/authenticate");
const User = require("../db/user");

module.exports = function (server) {
  const io = socketIO(server);

  io.of("/stands")
    .use(authenticateSocket)
    .on("connection", async () => {
      console.log("new stand connection");
    });

  io.of("/pickups")
    .use(authenticateSocket)
    .on("connection", async () => {
      console.log("new pickup connection");
    });

  io.of("/user-location")
    .use(authenticateSocket)
    .on("connection", async (socket) => {
      let token = socket.handshake.query.token;

      const user = await User.findByToken(token);

      socket.on("update", async (location) => {
        console.log("update location");
        user.location = location;
        await user.save();

        socket.broadcast.emit("update-user", { location, user: user.id });
      });
    });

  return io;
};
