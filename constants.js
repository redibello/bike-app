module.exports = {
  secret: "bikeappsecret",
  // dbUrl: "mongodb://localhost/bikeapp",
  dbUrl:
    "mongodb+srv://admin:redibello@cluster0.fgjv0.mongodb.net/bikeapp?retryWrites=true&w=majority",
  jobs: {
    cancelReservation: "cancelReservation",
  },
};
