const mongoose = require("mongoose");

const Reservation = mongoose.model(
  "Reservation",
  new mongoose.Schema(
    {
      stand: { type: mongoose.Schema.Types.ObjectId, ref: "Stand" },
      bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike" },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      status: {
        type: String,
        enum: ["reserved", "locked", "requested", "ended"],
      },
    },
    { timestamps: true }
  )
);

module.exports = Reservation;
