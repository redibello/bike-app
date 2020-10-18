const router = require("express").Router();
const { authenticate } = require("../middleware/authenticate");
const User = require("../db/user");
const { pick } = require("lodash");
const Reservation = require("../db/reservation");
const Pickup = require("../db/pickup");
const Session = require("../db/session");
const PickupResponse = require("../db/pickupResponse");

const getUserData = async (req, res) => {
  try {
    const user = req.user;

    let reservation = await Reservation.findOne({ user }).populate("stand");
    let pickup = await Pickup.findOne({
      $or: [{ requestee: user }, { acceptee: user }],
    })
      .populate("acceptee")
      .populate("requestee");

    let session = await Session.findOne({ user, status: "ongoing" });
    let response = await PickupResponse.findOne({ user, isAccepted: false });
    if (res) res.send({ user, reservation, pickup, session, response });
    else return { user, reservation, pickup, session, response };
  } catch (e) {
    if (res) res.status(400).send("Something went wrong");
    else return e;
  }
};

module.exports = (socket) => {
  router.post("/", (req, res) => {
    const { username, password, latitude = 0, longitude = 0 } = req.body;

    try {
      var user = new User({
        username,
        password,
        balance: 100,
        location: { latitude, longitude },
      });

      user
        .save()
        .then(() => {
          return user.generateAuthToken();
        })
        .then((token) => {
          res.header("x-auth", token).send(user);
        })
        .catch((e) => {
          console.log(e);
          res.status(400).send(e);
        });
    } catch (e) {
      console.log(e);
      res.status(400).send(e);
    }
  });

  router.get("/me", authenticate, async (req, res) => {
    try {
      await getUserData(req, res);
    } catch (e) {
      res.status(500).send(e);
    }
  });

  router.get("/:id", async function (req, res) {
    const id = req.params.id;

    try {
      const user = await User.findById(id);
      const details = pick(user, "username", "location", "_id");
      res.send(details);
    } catch (e) {
      res.status(500).send();
    }
  });

  router.post("/login", async (req, res) => {
    try {
      const { username, password } = req.body;

      const user = await User.findByCredentials(username, password);

      const token = await user.generateAuthToken();

      const data = await getUserData({ user, ...req });

      res.header("x-auth", token).send(data);
    } catch (e) {
      console.log(e, "error");
      res.status(400).send();
    }
  });

  router.post("/logout", authenticate, (req, res) => {
    try {
      req.user.removeToken(req.token).then(
        () => {
          res.status(200).send();
        },
        (e) => {
          console.log(e);
          res.status(400).send();
        }
      );
    } catch (e) {
      console.log("logout", e);
    }
  });

  return router;
};

// module.exports = router;
