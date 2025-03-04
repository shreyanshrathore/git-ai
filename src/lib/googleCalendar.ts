const { google } = require("googleapis");
const oauth2Client = new google.auth.OAuth2(
  "YOUR_CLIENT_ID",
  "YOUR_CLIENT_SECRET",
  "YOUR_REDIRECT_URI",
);

// Generate Auth URL
const scopes = ["https://www.googleapis.com/auth/calendar"];
const authUrl = oauth2Client.generateAuthUrl({
  access_type: "offline",
  scope: scopes,
});
console.log("Authorize this app by visiting:", authUrl);
