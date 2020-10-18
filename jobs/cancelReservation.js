const constants = require("../constants");
const Bike = require("../db/bike");
const Reservation = require("../db/reservation");
const Stand = require("../db/stand");

module.exports = (agenda) => {
  agenda.define(constants.jobs.cancelReservation, async (job, done) => {
    const { _id } = job.attrs.data;

    const reservation = await Reservation.findOne({ _id });

    if (!reservation) return;

    const bike = await Bike.findOne({ _id: reservation.bike });

    if (bike.status !== "in-use") {
      bike.set("status", "static");

      const stand = await Stand.findOne({ _id: reservation.stand });
      stand.set("usableBikes", stand.usableBikes + 1);

      await stand.save();
      await bike.save();
      await Reservation.deleteOne({ _id });
    }
  });
};
