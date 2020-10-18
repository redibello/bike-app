const mongoose = require("mongoose");

const PickupResponse = mongoose.model(
  "PickupResponses",
  new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      pickup: { type: mongoose.Schema.Types.ObjectId, ref: "Pickup" },
      isAccepted: Boolean,
    },
    { timestamps: true }
  )
);

module.exports = PickupResponse;
