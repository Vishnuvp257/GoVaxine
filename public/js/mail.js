const nodemailer = require("nodemailer");
const pug = require("pug");
//const htmlToText = require('html-to-text');

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.name = "User";
    this.url = url;
    this.from = `Vishnu VP <${process.env.EMAIL_FROM}>`;
  }

  newTransport() {
    return nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.SENDGRID_USERNAME,
        pass: process.env.SENDGRID_PASSWORD,
      },
    });
  }

  // Send the actual email
  async send(template, subject) {
    // 1) Render HTML based on a pug template
    const html = pug.renderFile(
      `${__dirname}/../../views/email/${template}.pug`,
      {
        name: "User",
        url: this.url,
        subject,
      }
    );

    // 2) Define email options
    const mailOptions = {
      from: this.from,
      to: this.to,
      subject,
      html,
      text: html
    };

    // 3) Create a transport and send email
    await this.newTransport().sendMail(mailOptions);
  }

  async sendWelcome() {
    await this.send("welcome", "Welcome to the GoVaxine !");
  }

  async sendOTP() {
    await this.send("verify",`OTP verification`);
  }

  async sendAlertMsg(){
    await this.send("alert",'Vaccine Day(2nd Dose)')
  }
};
