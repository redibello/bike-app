const router = require("express").Router();
const {
  authenticate,
  authenticateSocket,
} = require("../middleware/authenticate");
const PickupResponse = require("../db/pickupResponse");
const Pickup = require("../db/pickup");
const Session = require("../db/session");

module.exports = (socket) => {
  router.get("/", authenticate, async function (req, res) {
    try {
      const requestee = req.user._id;
      const pickup = await Pickup.findOne({ requestee });

      if (pickup) {
        const responses = await PickupResponse.find({ pickup })
          .populate("user")
          .populate("requestee")
          .exec();

        // console.log(responses);

        res.send(responses);
      } else res.send([]);
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  router.post("/", authenticate, async function (req, res) {
    try {
      const user = req.user._id;
      const pickup = req.body.pickup;

      const response = new PickupResponse({ user, pickup });
      await response.save();
      await response.populate("pickup").execPopulate();
      await response.populate("user").execPopulate();

      res.status(200).send(response);

      socket
        .of("/pickups")
        .use(authenticateSocket)
        .emit("response-created", response);
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  router.delete("/:id", authenticate, async function (req, res) {
    try {
      const _id = req.params.id;

      const response = await PickupResponse.findOne({ _id });

      socket
        .of("/pickups")
        .use(authenticateSocket)
        .emit("response-deleted", response);

      await PickupResponse.deleteOne({ _id });

      res.status(200).send("Pickup response cancelled");
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  router.put("/accept/:id", authenticate, async function (req, res) {
    try {
      const _id = req.params.id;

      const response = await PickupResponse.findOne({ _id });
      response.set("isAccepted", true);
      await response.save();

      await response.populate("pickup").execPopulate();
      await response.populate("pickup.requestee").execPopulate();

      console.log(response);

      socket.of("/pickups").emit("response-accepted", response);

      const pickup = await Pickup.findOne({ _id: response.pickup._id });

      pickup.set("acceptee", response.user);
      await pickup.save();

      const session = await Session.findOne({
        user: response.user,
        status: "ongoing",
      });
      session.set("hasDiscount", true);
      session.set("hasPenalty", false);

      await session.save();

      await pickup.populate("acceptee").execPopulate();

      res.status(200).send(pickup);
    } catch (e) {
      res.status(400).send();
      console.log(e);
    }
  });

  return router;
};

// module.exports = router;
