const Hospital = require("../models/hospital");
const Patient = require("../models/patient");
const PatientsAdmitted = require("../models/patientadmitted");

exports.discharge = (req, res) => {
  console.log(req.params);
  Patient.findOneAndUpdate(
    { _id: req.params.id },
    { status: req.params.status },
    (err, statusUpPatient) => {
      if (err) console.log(err);
      else {
        console.log(statusUpPatient);
        var type = statusUpPatient.typeofbedreq;
        Patient.findOneAndUpdate(
          {
            districtid: req.user.districtid,
            status: "Requested",
            typeofbedreq: type,
          },
          { status: "Alloted", allotmenttime: Date.now() },
          (err, allottedpatient) => {
            if (err) console.log(err);
            else if (allottedpatient == null) {
              var key1 = "avaliablebeds." + type;
              var key2 = "occupiedbeds." + type;
              Hospital.findOneAndUpdate(
                { _id: req.user._id },
                { $inc: { [key1]: 1, [key2]: -1 } },
                (err, updatedhosp) => {
                  if (err) console.log(err);
                  else {
                    console.log(updatedhosp);
                  }
                }
              );
            } else {
              console.log(allottedpatient);
              var patadm = new PatientsAdmitted({
                patientid: allottedpatient._id,
                hospitalid: req.user._id,
                districtid: req.user.districtid,
                typeofbed: allottedpatient.typeofbedreq,
              });
              PatientsAdmitted.create(patadm, (err, newpatadm) => {
                if (err) console.log(err);
                else console.log(newpatadm);
              });
              const msg =
                "Bed alloted at " +
                allottedpatient.hospitalid +
                " Report to hospital within 3 hours.You can find the name in the website";
              //sendSms('+91'+allottedpatient.phoneno,msg)
            }
          }
        );
      }
    }
  );
  PatientsAdmitted.findOneAndUpdate(
    { patientid: req.params.id },
    { leaving: Date.now() },
    (err, datepat) => {
      if (err) console.log(err);
      else console.log(datepat);
    }
  );
  res.redirect("/viewpatients");
};
