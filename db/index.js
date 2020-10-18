var mongoose = require("mongoose");
const { dbUrl } = require("../constants");

mongoose.connect(dbUrl, {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {});
