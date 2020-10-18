const router = require("express").Router();
const Stand = require("../db/stand");

router.get("/", async function (req, res) {
  try {
    const stands = await Stand.find();
    // stands.forEach(async (stand) => {
    //   stand.set("usableBikes", stand.spots);
    //   stand.set("freeSpots", 0);
    //   await stand.save();
    // });
    res.send(stands);
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

module.exports = router;
