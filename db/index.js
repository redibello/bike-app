var mongoose = require("mongoose");

mongoose.connect("mongodb://localhost/bikeapp", {
  useCreateIndex: true,
  useUnifiedTopology: true,
  useNewUrlParser: true,
});

var db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", function () {});
