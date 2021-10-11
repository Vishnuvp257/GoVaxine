import "./covidCaseModel";
import "./scrip";
import "./script";
import "./user";
import "./reminders";
import "./mail";
import "./login";
import axios from "axios";

import "@babel/polyfill";
import "regenerator-runtime/runtime";
import "core-js";
import { showAlert } from "./login";

const logoutBtn = document.querySelector(".nav--logout");

if (logoutBtn)
  logoutBtn.addEventListener("click", function (e) {
    e.preventDefault();
    if (e.target.textContent === "Sign out") logout();
  });

const logout = async () => {
  try {
    const res = await axios({
      method: "GET",
      url: "/register/logout",
    });

    if ((res.data.status = "success")) location.reload(true);
  } catch (e) {
    showAlert("error", "Error logging out! Try again.");
  }
};

///set reminders
const reminderForm = document.querySelector(".reminder_form");

reminderForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("Name").value;
  const age = document.getElementById("Age").value;
  const gender = document.getElementById("Gender").value;
  const vaccine = document.getElementById("Vacc-Name").value;
  const date = document.getElementById("Date").value;

  reminder(name, age, gender, vaccine, date);
});

const reminder = async (name, age, gender, vaccine, date) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/reminder",
      data: {
        name,
        age,
        gender,
        vaccine,
        dateOf1Dose:
          vaccine === "covaxin"
            ? +Date.parse(date) + 2419200000
            : +Date.parse(date) + 7257600000,
      },
    });

    if (res.data.status === "success") showAlert("success", res.data.message);
  } catch (e) {}
};
