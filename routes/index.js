module.exports = (app, socket) => {
  app.use("/users", require("./users"));
  app.use("/stands", require("./stands"));
  app.use("/reservations", require("./reservations")(socket));
  app.use("/pickups", require("./pickups")(socket));
  app.use("/pickupResponses", require("./pickupResponses")(socket));
  app.use("/bikes", require("./bikes")(socket));
  app.use("/sessions", require("./sessions"));
};
