const mongoose = require("mongoose");

const Stand = mongoose.model(
  "Stand",
  new mongoose.Schema(
    {
      address: String,
      latitude: Number,
      longitude: Number,
      spots: Number,
      freeSpots: Number,
      usableBikes: Number,
    },
    { timestamps: true }
  )
);

module.exports = Stand;
