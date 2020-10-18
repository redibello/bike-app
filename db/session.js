const mongoose = require("mongoose");

const Session = mongoose.model(
  "Session",
  new mongoose.Schema(
    {
      bike: { type: mongoose.Schema.Types.ObjectId, ref: "Bike" },
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      startStand: { type: mongoose.Schema.Types.ObjectId, ref: "Stand" },
      endStand: { type: mongoose.Schema.Types.ObjectId, ref: "Stand" },
      hasDiscount: Boolean,
      hasPenalty: Boolean,
      status: {
        type: String,
        enum: ["ongoing", "ended"],
      },
    },
    { timestamps: true }
  )
);

module.exports = Session;
