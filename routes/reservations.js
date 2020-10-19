const router = require("express").Router();
const {
  authenticate,
  authenticateSocket,
} = require("../middleware/authenticate");
const Reservation = require("../db/reservation");
const Bike = require("../db/bike");
const Stand = require("../db/stand");
const constants = require("../constants");
const agenda = require("../jobs/agenda");

module.exports = (socket) => {
  router.get("/", authenticate, async function (req, res) {
    try {
      const reservations = await Reservation.find({ user: req.user });
      res.send(reservations);
    } catch (e) {
      res.status(500).send();
      console.log(e);
    }
  });

  router.post("/", authenticate, async function (req, res) {
    try {
      const { stand: standId, isLockRequest } = req.body;
      const user = req.user;

      const stand = await Stand.findOne({ _id: standId });

      const existingReservation = await Reservation.find({ user });

      if (existingReservation.length > 0) {
        res.status(406).send("You can only make 1 reservation at a time");
      }

      const bike = await Bike.findOne({ status: "static", stand });

      if (!bike) {
        res.status(405).send();
        return;
      }

      const reservation = new Reservation({
        stand,
        user,
        bike,
        status: isLockRequest ? "locked" : "reserved",
      });

      await reservation.save();

      agenda.schedule(
        `in ${isLockRequest ? "20" : "10"} minutes`,
        constants.jobs.cancelReservation,
        reservation
      );

      stand.set("usableBikes", stand.usableBikes - 1);

      bike.set("status", isLockRequest ? "locked" : "reserved");

      await bike.save();
      await stand.save();

      socket.of("stands").use(authenticateSocket).emit("update-stand", stand);

      if (isLockRequest) {
        req.user.set("balance", req.user.balance - 2);
        await req.user.save();
      }

      res.status(200).send(reservation);
    } catch (e) {
      res.status(400).send("Couldn't make reservation, please try again");
      console.log(e);
    }
  });

  router.delete("/:id", authenticate, async function (req, res) {
    try {
      const { id: _id } = req.params;

      const reservation = await Reservation.findOne({ _id });
      await Reservation.findOneAndDelete({ _id });

      const stand = await Stand.findOne({ _id: reservation.stand });
      stand.set("usableBikes", stand.usableBikes + 1);
      await stand.save();

      const bike = await Bike.findOne({ _id: reservation.bike });
      bike.set("status", "static");
      await bike.save();

      res.status(200).send();
    } catch (e) {
      res.status(500).send();
      console.log(e);
    }
  });

  router.put("/change-to-lock/:id", authenticate, async function (req, res) {
    try {
      const { id: _id } = req.params;

      const reservation = await Reservation.findOne({ _id });
      reservation.set("status", "locked");
      await reservation.populate("stand").execPopulate();

      const bike = await Bike.findOne({ _id: reservation.bike });
      bike.set("status", "locked");

      await bike.save();
      await reservation.save();

      agenda.schedule(
        "in 20 minutes",
        constants.jobs.cancelReservation,
        reservation
      );

      const requestedStand = await Stand.findOne({ _id: reservation.stand });

      requestedStand.set("usableBikes", requestedStand.usableBikes - 1);

      await requestedStand.save();

      socket
        .of("stands")
        .use(authenticateSocket)
        .emit("update-stand", requestedStand);

      req.user.set("balance", req.user.balance - 2);
      await req.user.save();

      res.status(200).send(reservation);
    } catch (e) {
      res.status(500).send();
      console.log(e);
    }
  });

  return router;
};
