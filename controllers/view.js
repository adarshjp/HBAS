const Patient = require("../models/patient");
const PatientsAdmitted = require("../models/patientadmitted");
exports.viewpatients = (req, res) => {
  PatientsAdmitted.find({ hospitalid: req.user._id }).distinct(
    "patientid",
    (err, id) => {
      if (err) console.log(err);
      else {
        console.log(id);
        Patient.find(
          { _id: { $in: id }, status: "Admitted" },
          (err, admittedpatients) => {
            if (err) console.log(err);
            else {
              console.log(admittedpatients);
              res.render("viewpatients", {
                patients: admittedpatients,
                user: req.user,
              });
            }
          }
        );
      }
    }
  );
};

exports.viewOne = (req, res) => {
  Patient.find({ _id: req.params.id }, (err, fulldetails) => {
    if (err) console.log(err);
    else {
      console.log("Full", fulldetails);
      res.render("viewindividual", { patient: fulldetails[0] });
    }
  });
};
