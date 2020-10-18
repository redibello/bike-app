const router = require("express").Router();
const { authenticate } = require("../middleware/authenticate");
const Session = require("../db/session");

router.get("/", authenticate, async function (req, res) {
  try {
    const sessions = await Session.find();
    res.send(sessions);
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

module.exports = router;
