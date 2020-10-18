let Agenda = require("agenda");
const constants = require("../constants");

let agenda = new Agenda({
  db: { address: constants.dbUrl },
});

Object.keys(constants.jobs).forEach((type) => {
  require("./" + type)(agenda);
});

agenda.on("ready", async () => {
  await agenda.start();
});

let graceful = () => {
  agenda.stop(() => process.exit(0));
};

process.on("SIGTERM", graceful);
process.on("SIGINT", graceful);

module.exports = agenda;
