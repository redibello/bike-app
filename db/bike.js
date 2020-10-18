const mongoose = require("mongoose");

const Bike = mongoose.model(
  "Bike",
  new mongoose.Schema(
    {
      status: {
        type: String,
        enum: ["reserved", "locked", "in-use", "static"],
      },
      latitude: Number,
      longitude: Number,
      stand: { type: mongoose.Schema.Types.ObjectId, ref: "Stand" },
    },
    { timestamps: true }
  )
);

module.exports = Bike;
