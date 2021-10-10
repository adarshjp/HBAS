const District = require("../models/district");
const Hospital = require("../models/hospital");
const passport = require("passport");
exports.registerGet = (req, res) => {
  res.render("register");
};

exports.registerPost = (req, res) => {
  District.find({ name: req.body.hosp.district }, (err, result) => {
    if (err) console.log("District id not found " + err);
    else {
      var newHosp = new Hospital({
        username: req.body.hosp.username,
        name: req.body.hosp.name,
        address: req.body.hosp.add,
        phoneno: req.body.hosp.phno,
        emailid: req.body.hosp.email,
        type: req.body.hosp.type,
        districtid: result[0]._id,
        totalbeds: {
          general: req.body.hosp.tgen,
          oxygen: req.body.hosp.toxy,
          icu: req.body.hosp.ticu,
          icu_v: req.body.hosp.ticv,
        },
        occupiedbeds: {
          general: req.body.hosp.ogen,
          oxygen: req.body.hosp.ooxy,
          icu: req.body.hosp.oicu,
          icu_v: req.body.hosp.oicv,
        },
        avaliablebeds: {
          general: req.body.hosp.agen,
          oxygen: req.body.hosp.aoxy,
          icu: req.body.hosp.aicu,
          icu_v: req.body.hosp.aicv,
        },
      });
      Hospital.register(newHosp, req.body.hosp.pass, (err, hospital) => {
        if (err) {
          console.log(err);
          return res.render("register");
        }
        passport.authenticate("local")(req, res, function () {
          res.redirect("/");
        });
      });
    }
  });
};

exports.loginGet = (req, res) => {
  res.render("login");
};

exports.loginPost = (req, res) => {};

exports.logout = (req, res) => {
  req.logout();
  res.redirect("/");
};

exports.isLoggedIn = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  res.redirect("/login");
};
