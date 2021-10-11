import { countryList } from "./suggestions";

const searchBox = document.querySelector(".search_input");
const searchContainer = document.querySelector(".search_input");
const input = document.querySelector("input");
let inputValue = document.querySelector("input").value;
const grid = document.querySelector(".grid");

const totalCase = document.querySelector(".total_cases");
const totalDeath = document.querySelector(".death");
const totalRecovered = document.querySelector(".recovered");
const vaccineTaken = document.querySelector(".vaccine_taken");
const dailyPerMillion = document.querySelector(".dailyPer_million");
let covidData, vaccineData;

const getAllCovidData = async function () {
  try {
    const resData1 = await (
      await fetch(
        `https://covid-19.dataflowkit.com/v1/${
          inputValue ? inputValue.toLocaleLowerCase() : "world"
        }`
      )
    ).json();
    //console.log(resData1);

    covidData = {
      totalCase: resData1["Total Cases_text"],
      totalDeath: resData1["Total Deaths_text"],
      totalRecovered: resData1["Total Recovered_text"],
    };
    //console.log(covidData);
  } catch (e) {
    document.querySelector("input").value = "";
    // alert("please check your spelling");
    return;
  }
  totalCase.textContent = covidData.totalCase ? covidData.totalCase : 0;
  totalDeath.textContent = covidData.totalDeath ? covidData.totalDeath : 0;
  totalRecovered.textContent = covidData.totalRecovered
    ? covidData.totalRecovered
    : 0;
};

const getAllVaccineData = async function () {
  try {
    const resData2 = await (
      await fetch(
        `https://disease.sh/v3/covid-19/vaccine/coverage${
          inputValue ? "/countries/" + inputValue : ""
        }?lastdays=2&fullData=true`
      )
    ).json();
    //console.log(resData2);
    vaccineData = {
      vaccineTaken: resData2.timeline
        ? resData2.timeline[0].total
        : resData2[0].total,
      dailyPerMillion: resData2.timeline
        ? resData2.timeline[0].dailyPerMillion
        : resData2[0].dailyPerMillion,
    };
    //console.log(vaccineData);
  } catch (e) {
    document.querySelector("input").value = "";
    alert("check your spelling");
    return;
  }
  vaccineTaken.textContent = vaccineData.vaccineTaken
    ? vaccineData.vaccineTaken
    : 0;
  dailyPerMillion.textContent = vaccineData.dailyPerMillion
    ? vaccineData.dailyPerMillion
    : 0;
};

getAllCovidData();
getAllVaccineData();

// document.querySelector(".search_input").addEventListener("click", function (e) {
//   if (e.target.textContent !== "") inputValue = e.target.textContent;
//   getAllCovidData();
//   getAllVaccineData();
// });

const suggessions = searchContainer.querySelector(".search_input-box");

// input.onkeyup = (e) => {
//   let userData = e.target.value; //user enetered data
//   let emptyArray = [];
//   if (userData) {
//     emptyArray = countryList.filter((data) =>
//       data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase())
//     );
//     emptyArray = emptyArray.map((data) => (data = `<li>${data}</li>`));
//     //console.log(emptyArray);
//     suggessions.classList.add("active");
//   } else {
//     suggessions.classList.remove("active");
//     inputValue = "";
//     getAllCovidData();
//     getAllVaccineData();
//   }
//   showSuggestions(emptyArray);

//   let allList = suggessions.querySelectorAll("li");
//   for (let i = 0; i < allList.length; i++) {
//     //adding onclick attribute in all li tag
//     allList[i].setAttribute("onclick", "select(this)");
//   }
// };

// const showSuggestions = (list) => {
//   let listData;
//   if (!list.length) {
//     let userValue = input.value;
//     listData = `<li>${userValue}</li>`;
//   } else {
//     listData = list.join("");
//   }
//   suggessions.innerHTML = listData;
// };

// const select = function (element) {
//   let selectData = element.textContent;
//   input.value = selectData;
//   suggessions.classList.remove("active");
// };
