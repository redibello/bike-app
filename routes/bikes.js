const router = require("express").Router();
const {
  authenticate,
  authenticateSocket,
} = require("../middleware/authenticate");
const Bike = require("../db/bike");
const Reservation = require("../db/reservation");
const Session = require("../db/session");
const Stand = require("../db/stand");
const moment = require("moment");

module.exports = (socket) => {
  router.get("/", authenticate, async function (req, res) {
    try {
      const bikes = await Bike.find();
      res.send(bikes);
    } catch (e) {
      res.status(500).send();
      console.log(e);
    }
  });

  router.get("/:id", authenticate, async function (req, res) {
    try {
      const _id = req.params.id;
      const bike = await Bike.findOne({ _id }).populate("stand");
      res.send(bike);
    } catch (e) {
      res.status(404).send();
      console.log(e);
    }
  });

  router.put("/release/:id", authenticate, async function (req, res) {
    try {
      const user = req.user;

      await Reservation.deleteOne({ user });

      const bike = await Bike.findOne({ _id: req.params.id });

      if (["reserved", "locked", "in-use"].includes(bike.status)) {
        res.status(401).send({ status: bike.status });
        return;
      }

      bike.set("status", "in-use");

      const startStand = await Stand.findOne({ _id: bike.stand });

      startStand.set("usableBikes", startStand.usableBikes - 1);
      startStand.set("freeSpots", startStand.freeSpots + 1);

      await bike.save();

      const session = new Session({
        bike,
        startStand,
        user,
        status: "ongoing",
      });

      await startStand.save();
      await session.save();

      socket
        .of("stands")
        .use(authenticateSocket)
        .emit("update-stand", startStand);

      res.send(session);
    } catch (e) {
      console.log(e);
      res.status(500).send();
    }
  });

  router.put("/lock/:id", authenticate, async function (req, res) {
    try {
      const user = req.user;
      let stand = req.body.stand;

      stand = await Stand.findOne({ _id: stand });

      if (stand.freeSpots === 0) {
        res.status(420).send();
        return;
      }

      stand.set("usableBikes", stand.usableBikes + 1);
      stand.set("freeSpots", stand.freeSpots - 1);

      let bike = await Bike.findOne({ _id: req.params.id });

      bike.set("status", "static");
      await bike.save();

      const session = await Session.findOne({
        bike,
        user,
        status: "ongoing",
      });

      session.set("status", "ended");
      session.set("endStand", stand);

      const price =
        moment().diff(moment(session.createdAt), "minutes") *
        (session.hasPenalty
          ? 0.5 * 1.1
          : session.hasDiscount
          ? 0.5 * 0.8
          : 0.5);

      user.set("balance", user.balance - price);

      await user.save();
      await session.save();
      await stand.save();

      socket.of("stands").use(authenticateSocket).emit("update-stand", stand);

      res.status(200).send();
    } catch (e) {
      res.status(404).send();
      console.log(e);
    }
  });

  return router;
};
