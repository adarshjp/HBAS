const District = require("../models/district");
const Hospital = require("../models/hospital");
const Patient = require("../models/patient");
const PatientsAdmitted = require("../models/patientadmitted");

exports.home = (req, res) => {
  res.render("home");
};

exports.view = (req, res) => {
  District.find({}, (err, district) => {
    if (err) console.log(err);
    else {
      Hospital.find({}, (err, hospital) => {
        if (err) console.log(err);
        else {
          console.log(district);
          console.log(hospital);
          res.render("view", { district: district, hospital: hospital });
        }
      });
    }
  });
};

exports.requestGet = (req, res) => {
  District.find({}, { name: 1, _id: 0 }, (err, district) => {
    if (err) console.log(err);
    else res.render("request", { district: district });
  });
};

exports.requestPost = (req, res) => {
  District.find({ name: req.body.patient.district }, (err, result) => {
    if (err) console.log("District id not found " + err);
    else {
      var newPatient = new Patient({
        name: req.body.patient.name,
        age: req.body.patient.age,
        address: req.body.patient.address,
        phoneno: req.body.patient.pno,
        status: "Requested",
        typeofbedreq: req.body.patient.typeofbed,
        caretakername: req.body.patient.cname,
        caretakerphno: req.body.patient.cpno,
        districtid: result[0]._id,
      });
      Patient.create(newPatient, (err, newpatient) => {
        if (err) console.log(err);
        else {
          Hospital.find(
            { districtid: newpatient.districtid },
            { avaliablebeds: 1, districtid: 1, _id: 1 },
            (err, hosp) => {
              for (i = 0; i < hosp.length; i++) {
                var hospital = hosp[i];
                if (hosp[i].avaliablebeds[newpatient.typeofbedreq] > 0) {
                  Patient.findOneAndUpdate(
                    { _id: newpatient._id },
                    { status: "Alloted", allotmenttime: Date.now() },
                    (err, upPatient) => {
                      if (err) console.log(err);
                      else console.log(upPatient);
                    }
                  );
                  //console.log(hospital._id)
                  var patadm = new PatientsAdmitted({
                    patientid: newpatient._id,
                    hospitalid: hospital._id,
                    districtid: hospital.districtid,
                    typeofbed: newpatient.typeofbedreq,
                  });
                  PatientsAdmitted.create(patadm, (err, newpatadm) => {
                    if (err) console.log(err);
                    else {
                      console.log(newpatadm);
                      var type = newpatadm.typeofbed;
                      var key1 = "avaliablebeds." + type;
                      var key2 = "occupiedbeds." + type;
                      Hospital.findOneAndUpdate(
                        { _id: newpatadm.hospitalid },
                        { $inc: { [key1]: -1, [key2]: 1 } },
                        (err, updatedhosp) => {
                          if (err) console.log(err);
                          else {
                            console.log(updatedhosp);
                            const msg =
                              "Bed allotted at " +
                              updatedhosp.name +
                              " Report to hospital within 3 hours";
                            //sendSms('+91'+newpatient.phoneno,msg)
                          }
                        }
                      );
                    }
                  });

                  break;
                }
              }
            }
          );
          res.render("reqsuccess.ejs");
        }
      });
    }
  });
};
