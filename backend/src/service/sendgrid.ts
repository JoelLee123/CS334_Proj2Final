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
  } catch (error) {
    console.error("Error sending email:", error);
  }
};

/* Send a password reset email */
const sendPasswordResetEmail = async (toEmail: string, resetToken: string) => {
  const resetURL = `https://scribe-mark-fe6416f9cd72.herokuapp.com/reset-password?token=${resetToken}`;

  const msg = {
    to: toEmail,
    from: "24737615@sun.ac.za",
    subject: "Password Reset Request",
    html: `
      <html>
        <body>
          <p>Please click the link below to reset your password:</p>
          <a href="${resetURL}" target="_blank" style="color: #1a73e8; text-decoration: none;">
            Reset Password
          </a>
          <br/>
          <p>If the above link doesn't work, you can copy and paste the following URL into your browser:</p>
          <p><a href="${resetURL}" target="_blank">${resetURL}</a></p>
        </body>
      </html>
    `,
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
  sendNoteSharedEmail,
};
