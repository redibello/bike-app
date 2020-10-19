const router = require("express").Router();

module.exports = (app, socket) => {
  // app.use("/", () => {
  //   router.get("/", (_, res) => {
  //     res.send("Hello");
  //   });
  //   return router;
  // });
  app.use("/users", require("./users")(socket));
  app.use("/stands", require("./stands"));
  app.use("/reservations", require("./reservations")(socket));
  app.use("/pickups", require("./pickups")(socket));
  app.use("/pickupResponses", require("./pickupResponses")(socket));
  app.use("/bikes", require("./bikes")(socket));
  app.use("/sessions", require("./sessions"));
};
