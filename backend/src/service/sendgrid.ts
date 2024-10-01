require("dotenv").config();
const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

/* Send general email */
const sendEmail = async (toEmail: string) => {
  const msg = {
    to: toEmail,
    from: "24737615@sun.ac.za",
    subject: "This is the most malicious virus on the internet",
    html: "Your computer is <strong>fucked</strong>",
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent to", toEmail);
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/* Send a password reset email */
const sendPasswordResetEmail = async (toEmail: string) => {
  const resetURL = undefined;

  const msg = {
    to: toEmail,
    from: "24737615@sun.ac.za",
    subject: "Password Reset Request",
    html: `Please click the link to reset your password: <a href="${resetURL}">${resetURL}</a>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent to: ", toEmail);
  } catch (error) {
    console.error("Error sending password reset email:", error);
  }
};

/* Send a note shared email */
const sendNoteSharedEmail = async (
  toEmail: string,
  noteTitle: string,
  sharedBy: string
) => {
  const msg = {
    to: toEmail,
    from: "24737615@sun.ac.za",
    subject: `A Note Has Been Shared with You: ${noteTitle}`,
    html: `<p>${sharedBy} has shared a note "<strong>${noteTitle}</strong>" with you.</p>`,
  };

  try {
    await sgMail.send(msg);
    console.log("Email sent to: ", toEmail);
  } catch (error) {
    console.error("Error sending note shared email:", error);
  }
};

module.exports = {
  sendEmail,
  sendPasswordResetEmail,
  sendNoteSharedEmail
};
