const PatientRoutes = require("./routes/patient");
const AuthRoutes = require("./routes/auth");
const HospitalRoutes = require("./routes/hospital");
const Hospital = require("./models/hospital");
const express = require("express"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  app = express(),
  mongoose = require("mongoose"),
  bodyparser = require("body-parser");
require("dotenv").config();

//MONGODB ATLAS CONNECTION

const connectionParams = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};
mongoose
  .connect(process.env.DBURL, connectionParams)
  .then(() => {
    console.log("Connected");
  })
  .catch((err) => {
    console.log("NOT CONNECTED!!");
    console.log(err);
  });
//MONGODB CONNECTION COMPLETED

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyparser.urlencoded({ extended: true }));
app.use(
  require("express-session")({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

app.use(passport.session());
passport.use(new LocalStrategy(Hospital.authenticate()));
passport.serializeUser(Hospital.serializeUser());
passport.deserializeUser(Hospital.deserializeUser());
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  next();
});
app.use(PatientRoutes);
app.use(AuthRoutes);
app.use(HospitalRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server Started!!");
});

/*var cron = require('node-cron');

cron.schedule('* * * * *', () => {
  console.log('running a task every minute');
});*/

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

function sendSms(phone, message) {
  const client = require("twilio")(accountSid, authToken);
  client.messages
    .create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phone,
    })
    .then((message) => console.log(message.sid));
}
