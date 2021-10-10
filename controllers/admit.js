const Patient = require("../models/patient");
const PatientsAdmitted = require("../models/patientadmitted");
exports.admitGet = (req, res) => {
  PatientsAdmitted.find().distinct("patientid", (err, id) => {
    if (err) console.log(err);
    else {
      console.log(id);
      Patient.find(
        { status: "Alloted", _id: { $in: id } },
        (err, allotedpatients) => {
          if (err) console.log(err);
          else
            res.render("admit", { patients: allotedpatients, user: req.user });
        }
      );
    }
  });
};

exports.admitPost = (req, res) => {
  console.log(req.params.id);
  Patient.findOneAndUpdate(
    { _id: req.params.id },
    { status: "Admitted" },
    (err, admittedPatient) => {
      if (err) console.log(err);
      else {
        console.log(admittedPatient);
      }
    }
  );
  PatientsAdmitted.findOneAndUpdate(
    { patientid: req.params.id },
    { joining: Date.now() },
    (err, uppattime) => {
      if (err) console.log(err);
      else {
        console.log(uppattime);
      }
    }
  );
  res.redirect("/admit");
};
