var http = require("http");

var port = normalizePort(process.env.PORT || "3001");

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

module.exports = app => {
  const server = http.createServer(app);
  app.set("port", port);

  return {
    server,
    port
  };
};
