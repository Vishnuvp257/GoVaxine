const loginForm = document.querySelector(".login-form-lg");
const signupForm = document.querySelector(".login-form-su");
const otpConfirm = document.getElementById("confirm");

if (loginForm)
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const mobileNo = document.getElementById("number").value;
    const password = document.getElementById("password").value;

    login(mobileNo, password);
  });

if (signupForm)
  signupForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const mobileNo = document.getElementById("mobile").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const passwordConfirm = document.getElementById("passwordConfirm").value;

    confrim(mobileNo, email, password, passwordConfirm);
  });

if (otpConfirm)
  otpConfirm.addEventListener("submit", (e) => {
    e.preventDefault();

    const otp = document.getElementById("otp").value;

    signup(otp);
  });

const login = async (mobileNo, password) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/register/login",
      data: {
        mobileNo,
        password,
      },
    });

    if (res.data.status === "success") {
      showAlert("success", "Logged in Successfully!");

      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
  }
};

const confrim = async (mobileNo, email, password, passwordConfirm) => {
  location.assign("/confrim");
  try {
    const res = await axios({
      method: "POST",
      url: "/register/confrim",
      data: {
        mobileNo,
        email,
        password,
        passwordConfirm,
      },
    });
  } catch (err) {
    showAlert("error", err.res.data.message);

    window.setTimeout(() => {
      location.assign("/signup");
    }, 1200);
  }
};

const signup = async (otp) => {
  try {
    const res = await axios({
      method: "POST",
      url: "/register/signup",
      data: { otp },
    });

    if (res.data.status === "success") {
      showAlert("success", "Signed up Successfully!");

      window.setTimeout(() => {
        location.assign("/");
      }, 1500);
    }
  } catch (err) {
    showAlert("error", err.response.data.message);
    window.setTimeout(() => {
      location.assign("/signup");
    }, 1500);
  }
};

const hideAlert = () => {
  const el = document.querySelector(".alert");

  if (el) el.parentElement.removeChild(el);
};

export const showAlert = (type, message) => {
  const markup = `<div class="alert alert--${type}">${message}</div>`;
  document.querySelector("body").insertAdjacentHTML("afterbegin", markup);

  window.setTimeout(hideAlert, 1500);
};
