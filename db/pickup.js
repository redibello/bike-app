const mongoose = require("mongoose");

const Pickup = mongoose.model(
  "Pickup",
  new mongoose.Schema(
    {
      requestee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      acceptee: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    },
    { timestamps: true }
  )
);

module.exports = Pickup;
