//NAVIGATION ITEMS OPACITY WHILE HOVERING
const nav = document.querySelector(".nav");
const navList = document.querySelector(".nav_lists");
const navHeight = nav.getBoundingClientRect().height;
const overlay = document.querySelector(".overlay");

const hoverOver = function (e) {
  if (e.target.classList.contains("nav_link")) {
    const link = e.target;

    const siblings = link.closest(".nav").querySelectorAll(".nav_link");
    siblings.forEach((lk) => {
      if (lk !== link) lk.style.opacity = this;
    });
  }
};

nav.addEventListener("mouseover", hoverOver.bind(0.5));
nav.addEventListener("mouseout", hoverOver.bind(1));

//STICKY NAVIGATION |||||
const header = document.querySelector(".header");
const headerOberver = new IntersectionObserver(
  function (entries, observer) {
    const [entry] = entries;

    if (!entry.isIntersecting) nav.classList.add("sticky");
    else nav.classList.remove("sticky");
  },
  {
    root: null,
    rootMargin: `-${nav.getBoundingClientRect().height}px`,
    threshold: 0,
  }
).observe(header);

const toggleBtn = document.querySelector(".toggle-btn");
const navCloseBtn = document.querySelector(".nav_closebtn");
const navOverlay = document.querySelector(".nav_overlay");

const openToggle = function () {
  navList.classList.add("nav--active");

  overlay.classList.remove("hidden");
};

const closeToggle = function () {
  overlay.classList.add("hidden");
  navList.classList.remove("nav--active");
};

toggleBtn.addEventListener("click", openToggle);
navCloseBtn.addEventListener("click", closeToggle);
navOverlay.addEventListener("click", closeToggle);

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeToggle();
});

//HEADER SEARCH BAR
//SECTION GUUDE
const guideBtn = document.querySelector(".btn--guide");
guideBtn.addEventListener("click", (e) => {
  document.location.href = "https://www.who.int/";
});

//SECTION REMAINDER
const sliderBtn = document.querySelectorAll(".btn-slider");
const tab = document.querySelector(".section_tab");
const formSubmitBtn = document.querySelector(".btn-submit");
const sliderCloseBtn = document.querySelectorAll(".btn-feature");
let windowPos = 0;

sliderBtn.forEach((btn) =>
  btn.addEventListener("click", function (e) {
    e.preventDefault();

    document.querySelector(".section_slider").classList.add("slide");
  })
);

sliderCloseBtn.forEach((btn) =>
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    document.querySelector(".section_slider").classList.remove("slide");
  })
);

window.addEventListener("scroll", function () {
  windowPos = window.scrollY;
});

// formSubmitBtn.addEventListener("click", function (e) {
//   e.preventDefault();

//   tab.style.transform = `translateY(${windowPos - 65}px)`;
//   setTimeout(() => {
//     tab.style.transform = "translateY(-300rem)";
//   }, 2000);
// });

//REVEALING SECTIONS SLOW
const sectionAll = [...document.getElementsByTagName("section")];

const sectionOberver = new IntersectionObserver(
  function (entries) {
    const [entry] = entries;

    if (!entry.isIntersecting) return;
    entry.target.classList.remove("section--hidden");
    sectionOberver.unobserve(entry.target);
  },
  {
    root: null,
    threshold: 0.2,
  }
);

sectionAll.forEach((sec) => {
  sec.classList.add("section--hidden");
  sectionOberver.observe(sec);
});

//MODAL
const modal = document.querySelector(".modal");
const btnClose = document.querySelector(".btn--close-modal");
const btnOpen = document.querySelector(".btn--show-modal");

//open modal
const openModal = function (e) {
  e.preventDefault();

  modal.classList.remove("hidden");
  overlay.classList.remove("hidden");
};

//close modal
const closeModal = function (e) {
  modal.classList.add("hidden");
  overlay.classList.add("hidden");
};

btnOpen.addEventListener("click", openModal);
btnClose.addEventListener("click", closeModal);
overlay.addEventListener("click", closeModal);

window.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !modal.classList.contains("hidden")) {
    closeModal();
    return;
  }

  if (e.key === "Escape")
    document.querySelector(".section_slider").classList.remove("slide");
});
