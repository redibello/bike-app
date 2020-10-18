const user = require("../db/user");

const authenticateSocket = (socket, next) => {
  let token = socket.handshake.query.token;

  if (!token) socket.disconnect();

  user
    .findByToken(token)
    .then((user) => {
      if (!user) {
        socket.disconnect();
      }
      next();
    })
    .catch((e) => {
      socket.disconnect();
      console.log("err token", e);
    });
};

const authenticate = (req, res, next) => {
  const token = req.header("x-auth");

  if (!token) return Promise.reject();

  user
    .findByToken(token)
    .then((user) => {
      if (!user) {
        return Promise.reject();
      }

      req.user = user;
      req.token = token;
      next();
    })
    .catch((e) => {
      console.log(e);
      res.status(401).send();
    });
};

module.exports = { authenticate, authenticateSocket };
