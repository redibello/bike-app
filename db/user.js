const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { secret } = require("../constants");

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 6,
      unique: true,
    },
    password: {
      type: String,
      require: true,
      minlength: 6,
    },
    tokens: [
      {
        access: {
          type: String,
          required: true,
        },
        token: {
          type: String,
          required: true,
        },
      },
    ],
    card: Number,
    balance: Number,
    location: {
      latitude: Number,
      longitude: Number,
    },
    status: {
      type: String,
      enum: ["using", "not-using", "not-active"],
    },
  },
  { timestamps: true }
);

UserSchema.methods.toJSON = function () {
  var { _id, username, balance, card, location } = this.toObject();
  return { _id, username, balance, card, location };
};

UserSchema.methods.generateAuthToken = function () {
  var user = this;
  var access = "auth";
  var token = jwt
    .sign({ _id: user._id.toHexString(), access }, secret)
    .toString();

  user.tokens.push({ access, token });

  return user.save().then(() => {
    return token;
  });
};

UserSchema.methods.removeToken = function (token) {
  var user = this;

  return user.updateOne({
    $pull: {
      tokens: { token },
    },
  });
};

UserSchema.statics.findByToken = function (token) {
  var User = this;
  var decoded;

  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    return Promise.reject();
  }

  return User.findOne({
    _id: decoded._id,
    "tokens.token": token,
    "tokens.access": "auth",
  });
};

UserSchema.statics.findByCredentials = function (username, password) {
  const User = this;

  return User.findOne({ username })
    .then((user) => {
      if (!user) {
        return Promise.reject();
      }

      return new Promise((resolve, reject) => {
        bcrypt.compare(password, user.password, (err, res) => {
          if (res) {
            resolve(user);
          } else {
            reject();
          }
        });
      });
    })
    .catch((e) => console.log("err", e));
};

UserSchema.pre("save", function (next) {
  var user = this;

  if (user.isModified("password")) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

var User = mongoose.model("User", UserSchema);

module.exports = User;
