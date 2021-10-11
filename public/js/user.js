//user model
const { promisify } = require("util");
const crypto = require("crypto");

const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Email = require("./mail");

const userSchema = new mongoose.Schema({
  mobileNo: {
    type: String,
    required: [true, "Please enter your mobile no"],
    trim: true,
    unique: true,
    minLength: 10,
    validate: [validator.isMobilePhone, "please enter a valid mobile no"],
  },
  email: {
    type: String,
    required: [true, "Please provide your email"],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid id"],
  },
  password: {
    type: String,
    required: [true, "Please provide your password"],
    minLength: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "no confirm password found"],
    minLength: 8,
    validate: {
      validator: function (el) {
        return el === this.password;
      },
      message: "Please check your password",
    },
  },
  passwordChangedAt: {
    type: Date,
  },
  passwordResetToken: String,
  resetTokenExpriesIn: Date,
});

//encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;

  next();
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

userSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ active: { $ne: false } });
  next();
});

userSchema.methods.passwordChangedAfter = function (JwTTimeStamp) {
  if (this.passwordChangedAt) {
    const changedTime = parseInt(this.passwordChangedAt.getTime() / 1000, 10);

    return JwTTimeStamp < changedTime;
  }
  return false;
};

userSchema.methods.createResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetTokenExpriesIn = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const User = mongoose.model("User", userSchema);

//////////////////////////////////////////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////

//authentication Controller
const createToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPRIES_IN,
  });
};

const createCookie = (token, res) => {
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;

  res.cookie("jwt", token, cookieOptions);
};

let random, data;

exports.confrim = async (req, res, next) => {
  const user = await User.findOne({
    mobileNo: req.body.mobileNo,
    email: req.body.email,
  });

  if (user)
    return res.status(400).json({
      status: "fail",
      message: "Account already exits",
    });

  random = Math.floor(Math.random() * 999999 + 10000);
  await new Email(req.body, `${random}`).sendOTP();

  data = req.body;

  next();
};

exports.signup = async (req, res, next) => {
  if (+req.body.otp === random) {
    try {
      req.body.otp = undefined;

      const newUser = await User.create(data);

      const url = `${req.protocol}//:${req.get("host")}/`;
      await new Email(newUser, url).sendWelcome();

      const token = createToken(newUser._id);
      createCookie(token, res);

      res.status(201).json({
        status: "success",
        token,
        data: {
          user: newUser,
        },
      });
    } catch (err) {
      // console.log(err);
      res.status(400).json({
        status: "fail",
        message: "invalid email or already exits",
      });
    }
  } else {
    res.status(400).json({
      status: "fail",
      message: "invalid otp",
    });
  }
  next();
};

exports.logIn = async (req, res, next) => {
  const { mobileNo, password } = req.body;

  if (!mobileNo || !password)
    return res
      .status(401)
      .json({ status: "fail", message: "missing mobile no or password" });

  const user = await User.findOne({ mobileNo }).select("+password");

  if (!user || !(await bcrypt.compare(password, user.password)))
    return res
      .status(401)
      .json({ status: "fail", message: "Incorrect number or password" });

  const token = createToken(user._id);

  createCookie(token, res);

  res.status(200).json({
    status: "success",
    token,
  });

  next();
};

exports.isLoggedIn = async (req, res, next) => {
  if (req.cookies.jwt) {
    //1.verify the user token
    let decoded;
    try {
      decoded = await promisify(jwt.verify)(
        req.cookies.jwt,
        process.env.JWT_SECRET
      );
    } catch (err) {
      return next();
    }

    //2.verify if user still exits
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) return next();

    //3.verify if user changed password after token issued
    if (currentUser.passwordChangedAfter(decoded.iat)) return next();

    res.locals.user = currentUser;
    return next();
  }
  next();
};

exports.logOut = async (req, res, next) => {
  const cookieOptions2 = {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  };
  res.cookie("jwt", "loggedout", cookieOptions2);

  res.status(200).json({ status: "success" });

  next();
};

exports.protectFeatures = async (req, res, next) => {
  //1.checking is user logged in
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token)
    return next(
      res.status(401).json({
        status: "fail",
        message: "You are not logged in, Please login to continue",
      })
    );

  //2.verify the user token
  let decoded;
  try {
    decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
  } catch (err) {
    if (err.name === "TokenExpiredError")
      return next(
        res.status(401).json({
          status: "fail",
          message: "token expired login again!",
        })
      );

    return next(
      res.status(400).json({
        status: "fail",
        message: `Invalid token, Please login again!${err} `,
      })
    );
  }

  //3.verify if user still exits
  const currentUser = await User.findById(decoded.id);
  if (!currentUser)
    return next(
      res.status(401).json({
        status: "fail",
        message: "user to this token not available",
      })
    );

  //4.verify if user changed password after token issued
  if (currentUser.passwordChangedAfter(decoded.iat))
    return next(
      res.status(401).json({
        status: "fail",
        message: "Password changed login again to continue",
      })
    );

  req.user = currentUser;

  next();
};

exports.forgotPassword = async (req, res, next) => {
  //1.verify account with that email exits
  const user = await User.findOne({ email: req.body.email });

  if (!user)
    return next(
      res.status(400).json({
        status: "fail",
        message: "no email exits, Please enter valid email",
      })
    );

  //2.create a reset token
  const resetToken = user.createResetToken();
  await user.save({ validateBeforeSave: false });
  //3.send email

  const reqUrl = `${req.protocol}//:${req.get(
    "host"
  )}/login/resetpassword/${resetToken}`;
  const message = `reset password token, click to continue ${reqUrl}`;

  // try {
  //   await sendMail({
  //     email: user.email,
  //     subject: "Your reset password token (valid fo 10min)",
  //     message: message,
  //   });
  // } catch (e) {
  //   this.passwordResetToken = undefined;
  //   this.resetTokenExpriesIn = undefined;
  //   await user.save({ validateBeforeSave: false });
  // }

  res.json({
    status: "success",
  });

  next();
};
exports.resetPassword = async function (req, res, next) {
  //1.hashed the token first and checking if it is valid or expires
  const hashed = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passswordResetToken: hashed,
    resetTokenExpriesIn: { $gt: Date.now() },
  });

  if (!user)
    return next(
      res
        .status(400)
        .json({ status: "fail", message: "token invalid or expires" })
    );

  //2.if valid, update the new passsword and save

  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passswordResetToken = undefined;
  user.resetTokenExpriesIn = undefined;

  try {
    await user.save();
  } catch (err) {
    return res.status(400).json({ status: "fail", message: err });
  }

  //3.adding passwordchanged time

  //4.Login and send token
  const token = createToken(user._id);

  createCookie(token, res);

  res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });

  next();
};

exports.updatePassword = async (req, res, next) => {
  //1.Get user from colllection
  const user = await User.findById(req.user.id).select("+password");

  //2.verify the old password
  if (!user || !(await bcrypt.compare(req.body.passwordCurrent, user.password)))
    return res
      .status(401)
      .json({ status: "fail", message: "Incorrect password" });

  //3.update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  //4.Login again and send JWt
  const token = createToken(user._id);

  createCookie(token, res);

  res.status(200).json({
    status: "success",
    token,
  });

  next();
};
