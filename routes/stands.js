const router = require("express").Router();
const Stand = require("../db/stand");

router.get("/", async (req, res) => {
  try {
    const stands = await Stand.find();

    // try {
    //   for (let i = 0; i < 660; i++) {
    //     const stand = stands[Math.floor(i / 20)];
    //     stand.set("usableBikes", 20);
    //     stand.set("spots", 20);

    //     const bike = new Bike({
    //       stand,
    //       latitude: stand.latitude,
    //       longitude: stand.longitude,
    //       status: "static",
    //     });

    //     await bike.save();
    //     await stand.save();
    //   }
    // } catch (e) {
    //   console.log(e);
    // }

    res.send(stands);
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: _id } = req.params;
    const stand = await Stand.find({ _id });

    res.send(stand);
  } catch (e) {
    res.status(404).send();
    console.log(e);
  }
});

module.exports = router;
