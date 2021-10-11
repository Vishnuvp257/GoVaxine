let d = new Date();
const inputDate = document.getElementById("modal_date");

let date =
  ("0" + d.getDate()).slice(-2) +
  "-" +
  ("0" + (d.getMonth() + 1)).slice(-2) +
  "-" +
  d.getFullYear();

inputDate.addEventListener("change", (e) => {
  if (inputDate.value) date = inputDate.value;

  start(e);
});

/////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////////////////

const container = document.querySelector(".container");

let state, lat, lng;
let centerPincode;

const getPosi = function () {
  return new Promise(function (resolve, reject) {
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
    });
  });
};

const getLocationDetails = async function (lat, lng) {
  try {
    const resdata = await (
      await fetch(`https://geocode.xyz/${lat},${lng}?geoit=json`)
    ).json();
    if (!resdata.status) return resdata.state;
  } catch (e) {
    // console.log(e.message);
  }
};

const getVaccineCentres = async function () {
  try {
    if (lat === undefined || lng == undefined)
      throw new Error("cannot get location...Allow location to continue");

    const resdata = await (
      await fetch(
        `https://cdn-api.co-vin.in/api/v2/appointment/centers/public/findByLatLong?lat=${lat}&long=${lng}`
      )
    ).json();

    centerPincode = [...new Set(resdata.centers.map((cent) => cent.pincode))];
    centerPincode.forEach((pin) => getCentreDetails(pin));
  } catch (e) {
    //alert(`Oops! ${e.message}`);
    // console.log(e);
  }
};

const getCentreDetails = async (pincode) => {
  const resdata = await (
    await fetch(
      `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/findByPin?pincode=${+pincode}&date=${date}`
    )
  ).json();

  // console.log(resdata);

  if (resdata.sessions.length) {
    const activeSessions = resdata.sessions.filter(
      (center) => center.state_name === state
    );

    activeSessions.forEach((session) => renderCentreDetails(session));
  }
};

const renderCentreDetails = (centre) => {
  centre = {
    name: centre.name,
    address: centre.address,
    feeType: centre.fee_type,
    fee: centre.fee,
    id: centre.center_id,
    date: centre.date,
    minAge: centre.min_age_limit,
    vaccine: centre.vaccine,
    available: centre.available_capacity,
    dose1: centre.available_capacity_dose1,
    dose2: centre.available_capacity_dose2,
    slots: centre.slots,
    // lat:
    // lng:
  };
  renderTemplate(centre);
};

const generateMarkup = function (centre) {
  return `
  <li class="modal_item">
    <div>
      <h1 class="item_heading">${
        centre.name
      }</h1>  <button class="btn btn-map"><a href="https://www.google.com/maps/@,17z" target="_blank"> Map 🗺️</a></button>
      <h4 class="item_heading-sub"><address>🏠${centre.address}</address></h4>
      <table class="modal_table">
        <tbody>
          <tr>
            <td> Center Id </td>
            <td>${centre.id}</td>
          </tr>

          <tr>
            <td>Date </td>
            <td>${centre.date}</td>
          </tr>

          <tr>
            <td>Fee </td>
            <td>${centre.fee}</td>
          </tr>
          
          <tr>
            <td>MinAge</td>
            <td>${centre.minAge}</td>
          </tr>

          <tr>
            <td>Vaccine </td>
            <td>${centre.vaccine}</td>
          </tr>

          <tr>
            <td>Available</td>
            <td>${centre.available}</td> <!--centre.available-->
          </tr>

          <tr>
            <td>dose 1</td>
            <td>${centre.dose1}</td>  <!--centre.dose1-->
          </tr>

          <tr>
            <td>dose 2</td>
            <td>${centre.dose2}</td>  <!--centre.dose2-->
          </tr>
        </tbody>
      </table>
      Slots : ${centre.slots.map((slot) => `${slot} |`).join(" ")}
      
      <button class="btn-notify">Notify me</button>
    </div>
  </li>`;
};

const loading = function (parentEl) {
  const html = `
  <div class="spinner">
    <svg>
      <use href="icons.svg#icon-loader"></use>
    </svg>
  </div>
  `;

  // parentEl.innerHTML = "";
  parentEl.insertAdjacentHTML("afterbegin", html);
};

const renderTemplate = (centre) => {
  const html = generateMarkup(centre);
  modalContainer.insertAdjacentHTML("afterbegin", html);
  refreshIcon.classList.remove("fa-spin");
};

const start = async function (e) {
  e.preventDefault();

  refreshIcon.classList.add("fa-spin");
  modalContainer.innerHTML = "";

  try {
    const position = await getPosi();
    const { latitude: lati, longitude: lngi } = position.coords;
    lat = lati;
    lng = lngi;
    state = await getLocationDetails(lat, lng);
    getVaccineCentres();
  } catch (e) {
    // console.log(e);
  }
};

const modalContainer = document.querySelector(".modal_list");
const getBtn = document.querySelector(".btn--show-modal");
const refreshBtn = document.querySelector(".btn-refresh");
const refreshIcon = refreshBtn.querySelector(".fa");
let notifyBtnAll = document.querySelectorAll(".btn-notify");

getBtn.addEventListener("click", start);
refreshBtn.addEventListener("click", start);
