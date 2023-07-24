/* eslint-disable */
const paypal = require("paypal-rest-api");

exports.handlePayPalPayment = async (event) => {
  const payment = paypal.Payment.fromEvent(event);
  if (payment.status === "APPROVED") {
    console.log("approved!");
  }
};