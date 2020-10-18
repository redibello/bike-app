const router = require("express").Router();
const {
  authenticate,
  authenticateSocket,
} = require("../middleware/authenticate");
const Pickup = require("../db/pickup");
const Session = require("../db/session");

module.exports = (socket) => {
  router.get("/", authenticate, async function (req, res) {
    try {
      const pickups = await Pickup.find({ acceptee: undefined }).populate(
        "requestee"
      );
      res.send(pickups);
    } catch (e) {
      res.status(500).send();
      console.log(e);
    }
  });

  router.post("/", authenticate, async function (req, res) {
    try {
      const requestee = req.user;
      const pickup = new Pickup({ requestee });
      pickup.save();

      socket
        .of("/pickups")
        .use(authenticateSocket)
        .emit("request-created", pickup);

      res.status(200).send(pickup);
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  router.put("/confirm/:id", authenticate, async function (req, res) {
    try {
      const _id = req.params.id;
      const pickup = await Pickup.findOne({ _id });

      console.log(pickup);

      const prevSession = await Session.findOne({ user: pickup.acceptee });

      prevSession.set("hasDiscount", true);
      prevSession.set("status", "ended");
      await prevSession.save();

      socket
        .of("/pickups")
        .use(authenticateSocket)
        .emit("pickup-ended", pickup);

      await Pickup.deleteOne({ _id });

      const session = new Session({
        user: req.user,
        bike: prevSession.bike,
        status: "ongoing",
        hasDiscount: false,
        hasPenalty: false,
      });
      await session.save();

      res.status(200).send(session);
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  router.delete("/:id", authenticate, async function (req, res) {
    try {
      const _id = req.params.id;

      const pickup = await Pickup.findOne({ _id });

      if (!pickup) {
        res.status(404).send("Pickup doesn't exist");
        return;
      }

      if (pickup.acceptee) {
        if (req.user._id === pickup.acceptee) {
          const session = await Session.findOne({
            user: pickup.acceptee,
            status: "ongoing",
          });

          session.set("hasPenalty", true);
          session.set("hasDiscount", false);

          await session.save();
        } else
          socket
            .of("/pickups")
            .use(authenticateSocket)
            .emit("pickup-cancelled", pickup);
      } else {
        socket
          .of("/pickups")
          .use(authenticateSocket)
          .emit("request-deleted", pickup);
      }

      await Pickup.deleteOne({ _id });

      res.send();
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  return router;
};

// module.exports = router;
