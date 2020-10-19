const router = require("express").Router();
const Stand = require("../db/stand");

router.get("/", async (req, res) => {
  try {
    const stands = await Stand.find();

    res.send(stands);
  } catch (e) {
    res.status(500).send();
    console.log(e);
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id: _id } = req.params;
    const stand = await Stand.findOne({ _id });

    res.send(stand);
  } catch (e) {
    res.status(404).send();
    console.log(e);
  }
});

module.exports = router;
