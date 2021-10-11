const mongoose = require("mongoose");
const nodeschedule = require("node-schedule");
const Email = require("./mail");
const { async } = require("regenerator-runtime");

const reminderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name no"],
    trim: true,
  },
  age: {
    type: String,
  },
  gender: {
    type: String,
  },
  vaccine: {
    type: String,
    required: [true, "please select one vaccine"],
  },
  dateOf1Dose: {
    type: Date,
    require: [true, "date required"],
  },
  email: {
    type: String,
    unique: true,
  },
});

const Reminder = mongoose.model("Reminder", reminderSchema);

exports.setReminder = async (req, res, next) => {
  req.body.email = req.user.email;

  try {
    const data = await Reminder.findOne({ email: req.body.email });

    if (data) {
      data.name = req.body.name;
      data.age = req.body.age;
      data.vaccine = req.body.vaccine;
      data.dateOf1Dose = req.body.dateOf1Dose;
      data.save();

      return next(
        res.status(200).json({
          status: "success",
          message: "reminder updated, we'll alert you!!",
        })
      );
    } else {
      const data = await Reminder.create(req.body);

      return next(
        res.status(200).json({
          status: "success",
          message: "reminder created, we'll alert you!!",
        })
      );
    }
  } catch (err) {
    res.status(400).json({ status: "fail", message: err });
  }

  next();
};

const find = async () => {
  const date = new Date();
  const data = await Reminder.find();
  const array = [];

  data.forEach((obj) => {
    const data = {
      name: obj.name,
      date: obj.dateOf1Dose,
      email: obj.email,
      id: obj._id,
    };
    array.push(data);
  });

  array.forEach(async (el) => {
    if (el.date <= date) {
      const url = { name: el.name, link: `` };
      await new Email(el, url).sendAlertMsg();

      await Reminder.findByIdAndDelete(el.id);
    }
  });
};
nodeschedule.scheduleJob("0 8 * * *", find);
