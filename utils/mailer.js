const nodemailer = require("nodemailer");
const { google } = require("googleapis");

exports.mailer = async (toemail, token, subject) => {
  const oauth2Client = new google.auth.OAuth2(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URI
  );
  oauth2Client.setCredentials({ refresh_token: process.env.REFRESH_TOKEN });

  try {
    let accessToken = await oauth2Client.getAccessToken();
    let mailTransporter = nodemailer.createTransport({
      service: process.env.MAILER_SERVICE,
      auth: {
        type: "OAuth2",
        user: process.env.MAILER_MAIL,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });
    let mailDetails = {
      from: process.env.MAILER_MAIL,
      to: toemail,
      subject: subject,
      html: `<!doctype html>
      <html ⚡4email>
        <head>
          <meta charset="utf-8">
        </head>
        <body>
        <p>Please click the given link to verify email <a>http://localhost:4000/api/v1/emailverification/${token}</a></p>
        </body>
      </html>`,
    };
    let result = await mailTransporter.sendMail(mailDetails);
    return true;
  } catch (error) {
    return false;
  }
};
